import {
  submitQuotation,
  updateQuotation,
  submitPolicy
} from '../utils/api';

export function usePolicySubmit({
  baseApiUrl,
  state,
  actions,
  setSuccessMessage,
  setErrorMessage,
  setIsSubmitting
}) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!state.informerId) {
      setErrorMessage('กรุณาเลือกตัวแทนผู้แจ้งงานจากรายชื่อที่ปรากฏ');
      return;
    }

    const hasFiles = Object.values(state.filesData).some(arr => arr.length > 0);
    if (!hasFiles && state.submissionType !== 'additional') {
      setErrorMessage('กรุณาแนบเอกสารอย่างน้อย 1 รายการ');
      return;
    }

    setIsSubmitting(true);

    try {
      let plateNumber = null;
      let customerName = null;

      if (state.categoryId === '1') {
        if (state.isRedPlate) {
          plateNumber = 'ป้ายแดง';
          customerName = state.referenceInput;
        } else {
          plateNumber = state.referenceInput;
        }
      } else {
        customerName = state.referenceInput;
      }

      const safeRef = state.referenceInput.replace(/[\/\\:*?"<>|]/g, '_').replace(/\s+/g, '_');
      const formData = new FormData();
      
      if (state.submissionType !== 'success') {
        formData.append('quote_agent_id', state.informerId);
        formData.append('category_id', state.categoryId);
        
        if (plateNumber) formData.append('plate_number', plateNumber);
        if (customerName) formData.append('customer_name', customerName);
        if (state.endDate) formData.append('previous_policy_expiry_date', state.endDate);
      }
      
      if (state.submissionType === 'new' && state.notes) {
        formData.append('notes', state.notes);
      }
      
      if (state.submissionType === 'additional') {
        const qId = state.selectedPolicy?.quotationId || state.selectedPolicy?.quotation_id;
        if (qId) formData.append('quotation_id', qId);
        if (state.notes) formData.append('notes', state.notes);
      }

      if (state.submissionType === 'success') {
        const qId = state.selectedPolicy?.quotationId || state.selectedPolicy?.quotation_id;
        if (qId) formData.append('quotation_id', qId);
        
        if (state.policyStartDate) formData.append('policy_start_date', state.policyStartDate);
        if (state.policyExpiryDate) formData.append('policy_expiry_date', state.policyExpiryDate);
        if (state.submitAgentCode) formData.append('submitted_by', state.submitAgentCode);
        if (state.companyId) formData.append('company_id', state.companyId);
        if (state.premiumAmount) formData.append('premium_amount', state.premiumAmount);
        if (state.paymentMethodId) formData.append('payment_method_id', state.paymentMethodId);
        if (state.actualPaid) formData.append('actual_paid', state.actualPaid);
        if (state.installmentMonths) formData.append('installment_months', state.installmentMonths);
        if (state.brokerChannelId) formData.append('broker_channel_id', state.brokerChannelId);
        if (state.commissionPercent) formData.append('commission_percent', state.commissionPercent);
        if (state.taxRate) formData.append('tax_rate', state.taxRate);
        if (state.productId) formData.append('product_id', state.productId);
        if (state.policyNotes) formData.append('policy_notes', state.policyNotes);
      }
      
      if (state.submissionType !== 'success' && state.enableReminder && state.reminderDate) {
        formData.append('reminder_date', state.reminderDate);
        formData.append('reminder_type', state.reminderType);
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
        const fileArr = state.filesData[map.key];
        if (fileArr.length > 0) {
          fileArr.forEach((file, index) => {
            const ext = file.name.split('.').pop() || 'pdf';
            let newFileName = `${safeRef}_${map.docType}`;

            if (state.submissionType === 'additional') {
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

      const response = state.submissionType === 'additional' 
        ? await updateQuotation(baseApiUrl, formData)
        : state.submissionType === 'success'
          ? await submitPolicy(baseApiUrl, formData)
          : await submitQuotation(baseApiUrl, formData);

      const result = await response.json();
      if (response.ok) {
        setSuccessMessage({
          title: 'ส่งข้อมูลสำเร็จ!',
          description: result.message + '\n\nคุณสามารถกรอกรายการถัดไปได้ทันทีคะ'
        });
        actions.handleReset(false); // Silent reset on success
      } else {
        setErrorMessage(result.error || 'เกิดข้อผิดพลาดในการส่งข้อมูล');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit };
}
