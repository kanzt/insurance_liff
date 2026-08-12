import {
  submitQuotation,
  updateQuotation,
  submitPolicy
} from '../utils/api';

function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        }, file.type, quality);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export function usePolicySubmit({
  baseApiUrl,
  state,
  actions,
  setUploadToasts,
  setUploadHistory,
  setErrorMessage,
  defaultCategoryId
}) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!state.informerId) {
      setErrorMessage('กรุณาเลือกตัวแทนผู้แจ้งงานจากรายชื่อที่ปรากฏ');
      return;
    }

    const hasFiles = Object.values(state.filesData).some(arr => arr.length > 0);
    if (!hasFiles && !(state.submissionType === 'quotation' && state.selectedPolicy)) {
      setErrorMessage('กรุณาแนบเอกสารอย่างน้อย 1 รายการ');
      return;
    }

    // Capture the state at the time of submission
    const capturedState = { ...state };
    
    // Clear the form UI instantly for non-blocking experience
    actions.handleReset(false, defaultCategoryId);

    const jobId = Date.now().toString() + Math.random().toString(36).substring(2);

    // Background upload function
    const doBackgroundSubmit = async (submissionState) => {
      let tempCustomerName = null;
      const isMotor = submissionState.categoryId === 'motor' || submissionState.categoryId === '1';
      if (isMotor) {
        tempCustomerName = submissionState.isRedPlate ? submissionState.referenceInput : submissionState.referenceInput;
      } else {
        tempCustomerName = submissionState.referenceInput;
      }
      const jobTitle = tempCustomerName || 'รายการใหม่';

      setUploadToasts(prev => {
        const exists = prev.find(t => t.id === jobId);
        if (exists) {
          return prev.map(t => t.id === jobId ? { ...t, status: 'loading', message: 'กำลังลองใหม่อีกครั้ง...' } : t);
        }
        return [...prev, { 
          id: jobId, 
          status: 'loading', 
          title: jobTitle,
          message: 'กำลังอัปโหลดเอกสาร... คุณสามารถเพิ่มรายการถัดไปได้เลย',
          timestamp: Date.now()
        }];
      });

      setUploadHistory(prev => {
        const exists = prev.find(t => t.id === jobId);
        if (exists) {
          return prev.map(t => t.id === jobId ? { 
            ...t, 
            status: 'loading', 
            message: 'กำลังลองใหม่อีกครั้ง...',
            retryCount: (t.retryCount || 0) + 1
          } : t);
        }
        return [...prev, { 
          id: jobId, 
          status: 'loading', 
          title: jobTitle,
          message: 'กำลังอัปโหลดเอกสาร... คุณสามารถเพิ่มรายการถัดไปได้เลย',
          timestamp: Date.now(),
          retryCount: 0
        }];
      });
      
      const startTime = Date.now();

      try {
        let plateNumber = null;
        let customerName = null;

        if (isMotor) {
          if (submissionState.isRedPlate) {
            plateNumber = 'ป้ายแดง';
            customerName = submissionState.referenceInput;
          } else {
            plateNumber = submissionState.referenceInput;
          }
        } else {
          customerName = submissionState.referenceInput;
        }

        const safeRef = submissionState.referenceInput.replace(/[\/\\:*?"<>|]/g, '_').replace(/\s+/g, '_');
        const formData = new FormData();
        
        if (submissionState.submissionType !== 'success') {
          formData.append('quoted_by', submissionState.informerId);
          formData.append('category_id', submissionState.categoryId);
          
          if (plateNumber) formData.append('plate_number', plateNumber);
          if (customerName) formData.append('customer_name', customerName);
          if (submissionState.endDate) formData.append('previous_policy_expiry_date', submissionState.endDate);
        }
        
        if (submissionState.submissionType === 'quotation' && !submissionState.selectedPolicy && submissionState.notes) {
          formData.append('notes', submissionState.notes);
        }
        
        if (submissionState.submissionType === 'quotation' && submissionState.selectedPolicy) {
          const qId = submissionState.selectedPolicy?.quotationId || submissionState.selectedPolicy?.quotation_id;
          if (qId) formData.append('quotation_id', qId);
          if (submissionState.notes) formData.append('notes', submissionState.notes);
        }

        if (isMotor) {
          if (submissionState.vehicleYear) formData.append('vehicle_year', submissionState.vehicleYear);
          if (submissionState.vehicleMake) formData.append('vehicle_make', submissionState.vehicleMake);
          if (submissionState.vehicleModel) formData.append('vehicle_model', submissionState.vehicleModel);
        }

        if (submissionState.submissionType === 'success') {
          const qId = submissionState.selectedPolicy?.quotationId || submissionState.selectedPolicy?.quotation_id;
          if (qId) formData.append('quotation_id', qId);
          
          if (submissionState.policyStartDate) formData.append('policy_start_date', submissionState.policyStartDate);
          if (submissionState.policyExpiryDate) formData.append('policy_expiry_date', submissionState.policyExpiryDate);
          if (submissionState.submitAgentCode) formData.append('submitted_by', submissionState.submitAgentCode);
          if (submissionState.companyId) formData.append('company_id', submissionState.companyId);
          if (submissionState.premiumAmount) formData.append('premium_amount', submissionState.premiumAmount);
          if (submissionState.paymentMethodId) formData.append('payment_method_id', submissionState.paymentMethodId);
          if (submissionState.actualPaid) formData.append('actual_paid', submissionState.actualPaid);
          if (submissionState.installmentMonths) formData.append('installment_months', submissionState.installmentMonths);
          if (submissionState.brokerChannelId) formData.append('broker_channel_id', submissionState.brokerChannelId);
          if (submissionState.commissionPercent) formData.append('commission_percent', submissionState.commissionPercent);
          if (submissionState.taxRate) formData.append('tax_rate', submissionState.taxRate);
          if (submissionState.productId) formData.append('product_id', submissionState.productId);
          if (submissionState.policyNotes) formData.append('policy_notes', submissionState.policyNotes);
        }
        
        if (submissionState.submissionType !== 'success' && submissionState.enableReminder && submissionState.reminderDate) {
          formData.append('reminder_date', submissionState.reminderDate);
          formData.append('reminder_type', submissionState.reminderType);
        }

        const fileMappings = [
          { key: 'registration', docType: 'หน้ารายการจดทะเบียน' },
          { key: 'oldPolicy', docType: 'กรมธรรม์เดิม' },
          { key: 'quotation', docType: 'ใบเสนอราคา' },
          { key: 'compQuotation', docType: 'ใบเสนอราคาคู่แข่ง' },
          { key: 'renewalNotice', docType: 'เบี้ยต่ออายุ' },
          { key: 'workOrder', docType: 'ใบแจ้งงาน' },
          { key: 'others', docType: 'เอกสารอื่นๆ' }
        ];

        for (const map of fileMappings) {
          const fileArr = submissionState.filesData[map.key];
          if (fileArr.length > 0) {
            // Compress images asynchronously before submitting
            const compressedFiles = await Promise.all(fileArr.map(file => compressImage(file)));
            
            compressedFiles.forEach((file, index) => {
              const ext = file.name.split('.').pop() || 'pdf';
              let newFileName = `${safeRef}_${map.docType}`;

              if (submissionState.submissionType === 'quotation' && submissionState.selectedPolicy) {
                newFileName += `_เพิ่มเติม_${Date.now()}`;
              }
              if (fileArr.length > 1) {
                newFileName += `_${index + 1}`;
              }
              newFileName += `.${ext}`;

              const renamedFile = new File([file], newFileName, { type: file.type });
              formData.append('files', renamedFile);
            });
          }
        }

        const response = (submissionState.submissionType === 'quotation' && submissionState.selectedPolicy)
          ? await updateQuotation(baseApiUrl, formData)
          : submissionState.submissionType === 'success'
            ? await submitPolicy(baseApiUrl, formData)
            : await submitQuotation(baseApiUrl, formData);

        const result = await response.json();
        const elapsedTime = (Date.now() - startTime) / 1000;

        if (response.ok) {
          const successUpdate = {
            status: 'success',
            message: 'บันทึกข้อมูลสำเร็จเรียบร้อย',
            elapsedTime: elapsedTime
          };
          setUploadToasts(prev => prev.map(t => t.id === jobId ? { ...t, ...successUpdate } : t));
          setUploadHistory(prev => prev.map(t => t.id === jobId ? { ...t, ...successUpdate } : t));
          
          setTimeout(() => {
            setUploadToasts(prev => prev.filter(t => t.id !== jobId));
          }, 4000);
        } else {
          const errorUpdate = {
            status: 'error',
            message: result.error || 'เกิดข้อผิดพลาดในการส่งข้อมูล',
            onRetry: () => doBackgroundSubmit(submissionState)
          };
          setUploadToasts(prev => prev.map(t => t.id === jobId ? { ...t, ...errorUpdate } : t));
          setUploadHistory(prev => prev.map(t => t.id === jobId ? { ...t, ...errorUpdate } : t));
        }
      } catch (error) {
        console.error(error);
        const catchUpdate = {
          status: 'error',
          message: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
          onRetry: () => doBackgroundSubmit(submissionState)
        };
        setUploadToasts(prev => prev.map(t => t.id === jobId ? { ...t, ...catchUpdate } : t));
        setUploadHistory(prev => prev.map(t => t.id === jobId ? { ...t, ...catchUpdate } : t));
      }
    };

    // Trigger the background upload
    doBackgroundSubmit(capturedState);
  };

  return { handleSubmit };
}
