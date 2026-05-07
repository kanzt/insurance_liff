import { useState, useEffect } from 'preact/hooks';
import liff from '@line/liff';
import { AgentSearch } from './AgentSearch';
import { PolicySearch } from './PolicySearch';
import { Dropzone } from './Dropzone';
import { SearchableSelect } from './SearchableSelect';
import {
  fetchCategories,
  fetchSubCategories,
  fetchAgents,
  fetchCompanies,
  fetchTemplates,
  fetchPaymentMethods,
  fetchBrokerChannels,
  submitPolicy
} from '../utils/api';

const STORAGE_KEY = 'insurance_liff_form_draft';

export function PolicyForm({ idToken, baseApiUrl, isSubmitting, setIsSubmitting, setSuccessMessage, setErrorMessage, setConfirmModal, onOpenGallery }) {
  const [informerId, setInformerId] = useState(null);
  const [informerName, setInformerName] = useState('');
  const [categoryId, setCategoryId] = useState('1');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [submissionType, setSubmissionType] = useState('new');
  const [referenceInput, setReferenceInput] = useState('');
  const [endDate, setEndDate] = useState('');
  const [enableReminder, setEnableReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderType, setReminderType] = useState('quotation_confirm');
  const [notes, setNotes] = useState('');
  const [policyStartDate, setPolicyStartDate] = useState('');
  const [policyExpiryDate, setPolicyExpiryDate] = useState('');
  const [submitAgentCode, setSubmitAgentCode] = useState('');
  const [allAgents, setAllAgents] = useState([]);
  const [companyId, setCompanyId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companies, setCompanies] = useState([]);
  const [premiumAmount, setPremiumAmount] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [actualPaid, setActualPaid] = useState('');
  const [installmentMonths, setInstallmentMonths] = useState('1');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [brokerChannelId, setBrokerChannelId] = useState('');
  const [brokerChannels, setBrokerChannels] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  
  const isCreditCard = selectedPaymentMethod?.paymentMethodName?.includes('ชำระบัตรเครดิต');
  const isInstallment = selectedPaymentMethod?.paymentMethodName?.includes('ผ่อนเงินสด');

  const [isRedPlate, setIsRedPlate] = useState(false);
  const [filesData, setFilesData] = useState({
    registration: [],
    oldPolicy: [],
    quotation: [],
    compQuotation: [],
    renewalNotice: [],
    workOrder: [],
    others: []
  });

  // Restore form state from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.informerId) setInformerId(data.informerId);
        if (data.informerName) setInformerName(data.informerName);
        if (data.categoryId) setCategoryId(data.categoryId.toString());
        else if (data.subCategoryId) {
          // หากมีข้อมูลเก่าที่เป็น subCategoryId ให้พยายามใช้ค่าเดิม (แต่ default เป็น '1' หากไม่แน่ใจ)
          setCategoryId(data.subCategoryId.toString());
        }
        if (data.subCategoryId) setSubCategoryId(data.subCategoryId.toString());
        if (data.submissionType) setSubmissionType(data.submissionType);
        if (data.referenceInput) setReferenceInput(data.referenceInput);
        if (data.endDate) setEndDate(data.endDate);
        if (data.enableReminder) setEnableReminder(data.enableReminder);
        if (data.reminderDate) setReminderDate(data.reminderDate);
        if (data.reminderType) setReminderType(data.reminderType);
        if (data.isRedPlate !== undefined) setIsRedPlate(data.isRedPlate);
        if (data.notes) setNotes(data.notes);
        if (data.policyStartDate) setPolicyStartDate(data.policyStartDate);
        if (data.policyExpiryDate) setPolicyExpiryDate(data.policyExpiryDate);
        if (data.submitAgentCode) setSubmitAgentCode(data.submitAgentCode);
        if (data.companyId) setCompanyId(data.companyId);
        if (data.companyName) setCompanyName(data.companyName);
        if (data.premiumAmount) setPremiumAmount(data.premiumAmount);
        if (data.paymentMethodId) setPaymentMethodId(data.paymentMethodId);
        if (data.actualPaid) setActualPaid(data.actualPaid);
        if (data.brokerChannelId) setBrokerChannelId(data.brokerChannelId);
      } catch (e) {
        console.error("Failed to restore form state:", e);
      }
    }
  }, []);

  // Save form state to localStorage on any change
  useEffect(() => {
    const stateToSave = {
      informerId,
      informerName,
      categoryId,
      subCategoryId,
      submissionType,
      referenceInput,
      endDate,
      enableReminder,
      reminderDate,
      reminderType,
      isRedPlate,
      notes,
      policyStartDate,
      policyExpiryDate,
      submitAgentCode,
      companyId,
      companyName,
      premiumAmount,
      paymentMethodId,
      actualPaid,
      installmentMonths,
      brokerChannelId
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [informerId, informerName, categoryId, subCategoryId, submissionType, referenceInput, endDate, enableReminder, reminderDate, reminderType, isRedPlate, notes, policyStartDate, policyExpiryDate, submitAgentCode, companyId, companyName, premiumAmount, paymentMethodId, actualPaid, installmentMonths, brokerChannelId]);

  // Load sub-categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetchCategories(baseApiUrl);
        const json = await response.json();
        if (json.results) {
          setCategories(json.results);
          const storage = localStorage.getItem(STORAGE_KEY);
          const hasExistingCategory = storage && (storage.includes('"categoryId":') || storage.includes('"subCategoryId":'));

          if (json.results.length > 0 && !hasExistingCategory) {
            setCategoryId(json.results[0].categoryId.toString());
          }
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();

    async function loadSubCategories() {
      try {
        const response = await fetchSubCategories(baseApiUrl);
        const json = await response.json();
        if (json.results) {
          setSubCategories(json.results);
        }
      } catch (err) {
        console.error("Failed to load sub-categories:", err);
      }
    }
    loadSubCategories();

    async function loadTemplates() {
      try {
        const response = await fetchTemplates(baseApiUrl);
        const json = await response.json();
        if (json.results) {
          setTemplates(json.results);
        }
      } catch (err) {
        console.error("Failed to load templates:", err);
      }
    }
    loadTemplates();

    async function loadAllAgents() {
      try {
        const response = await fetchAgents(baseApiUrl);
        const json = await response.json();
        if (json.results) {
          setAllAgents(json.results);
        }
      } catch (err) {
        console.error("Failed to load all agents:", err);
      }
    }
    loadAllAgents();

    async function loadCompanies() {
      const CACHE_KEY = 'insurance_companies_cache';
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000; // 24 hours
          if (!isExpired) {
            setCompanies(data);
            return;
          }
        } catch (e) {
          console.warn("Invalid company cache");
        }
      }

      try {
        const response = await fetchCompanies(baseApiUrl);
        const json = await response.json();
        if (json.results) {
          setCompanies(json.results);
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: json.results,
            timestamp: Date.now()
          }));
        }
      } catch (err) {
        console.error("Failed to load companies:", err);
      }
    }
    loadCompanies();

    async function loadPaymentMethods() {
      try {
        const response = await fetchPaymentMethods(baseApiUrl);
        const json = await response.json();
        if (json.results) {
          setPaymentMethods(json.results);
        }
      } catch (err) {
        console.error("Failed to load payment methods:", err);
      }
    }
    loadPaymentMethods();

    async function loadBrokerChannels() {
      try {
        const response = await fetchBrokerChannels(baseApiUrl);
        const json = await response.json();
        if (json.results) {
          setBrokerChannels(json.results);
        }
      } catch (err) {
        console.error("Failed to load broker channels:", err);
      }
    }
    loadBrokerChannels();
  }, [baseApiUrl]);

  // ✅ ป้องกันการเลือก "ติดตามการเสนอราคา" ค้างไว้หากวันหมดอายุถูกลบออก
  useEffect(() => {
    if (reminderType === 'follow_case' && !endDate) {
      setReminderType('quotation_confirm');
    }
  }, [endDate, reminderType]);

  // const categoryId = ... logic removed

  // Auto-calculate expiry date (default +1 year)
  useEffect(() => {
    if (policyStartDate && !policyExpiryDate) {
      const start = new Date(policyStartDate);
      const expiry = new Date(start);
      expiry.setFullYear(start.getFullYear() + 1);
      setPolicyExpiryDate(expiry.toISOString().split('T')[0]);
    }
  }, [policyStartDate]);

  const handleReminderToggle = (e) => {
    setEnableReminder(e.target.checked);
    if (e.target.checked && endDate && !reminderDate) {
      const d = new Date(endDate);
      d.setDate(d.getDate() - 60);
      setReminderDate(d.toISOString().split('T')[0]);
    } else if (!e.target.checked) {
      setReminderDate('');
    }
  };

  const handleReset = (showConfirm = true) => {
    const performReset = () => {
      localStorage.removeItem(STORAGE_KEY);
      setInformerId(null);
      setInformerName('');
      setCategoryId('');
      setSubCategoryId('');
      setSubmissionType('new');
      setIsRedPlate(false);
      setReferenceInput('');
      setEndDate('');
      setEnableReminder(false);
      setReminderDate('');
      setReminderType('quotation_confirm');
      setSelectedPolicy(null);
      setNotes('');
      setPolicyStartDate('');
      setPolicyExpiryDate('');
      setSubmitAgentCode('');
      setBrokerChannelId('');
      setCompanyId('');
      setCompanyName('');
      setFilesData({
        registration: [],
        oldPolicy: [],
        quotation: [],
        compQuotation: [],
        renewalNotice: [],
        workOrder: [],
        others: []
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (showConfirm) {
      setConfirmModal({
        title: 'ยืนยันการล้างข้อมูล',
        message: 'คุณต้องการล้างข้อมูลในฟอร์มทั้งหมดใช่หรือไม่? ข้อมูลที่กรอกไว้จะหายไปทั้งหมด',
        onConfirm: performReset
      });
      return;
    }

    performReset();
  };

  const formatThaiDate = (dateStr) => {
    if (!dateStr) return '...';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
    } catch (e) {
      return dateStr;
    }
  };

  const handleSelectPolicy = (policy) => {
    setSelectedPolicy(policy);
    if (policy) {
      // Normalize property access (handle both camelCase and snake_case)
      const plate = policy.plateNumber || policy.plate_number;
      const customer = policy.customerName || policy.customer_name;
      const catId = policy.categoryId || policy.category_id;
      const subCatId = policy.subCategoryId || policy.sub_category_id;
      const agentCode = policy.agentCode || policy.agent_code;
      const agentName = policy.agentName || policy.agent_name;
      const expiry = policy.expiryDate || policy.expiry_date || policy.previous_policy_expiry_date;
      const reminder = policy.reminderDate || policy.reminder_date;
      const rType = policy.reminderType || policy.reminder_type;
      const notesVal = policy.notes;

      if (plate && plate !== 'ป้ายแดง') {
        setIsRedPlate(false);
        setReferenceInput(plate);
      } else if (plate === 'ป้ายแดง') {
        setIsRedPlate(true);
        setReferenceInput(customer || '');
      } else {
        setReferenceInput(customer || '');
      }

      if (catId) {
        setCategoryId(catId.toString());
      }

      if (subCatId) {
        setSubCategoryId(subCatId.toString());
      }

      if (agentCode && agentName) {
        setInformerId(agentCode);
        setInformerName(agentName);
      }

      if (reminder) {
        setReminderDate(reminder);
        setEnableReminder(true);
        if (rType) {
          setReminderType(rType);
        }
      } else {
        setReminderDate('');
        setEnableReminder(false);
      }

      setEndDate(expiry || '');
      setNotes(notesVal || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!informerId) {
      setErrorMessage('กรุณาเลือกตัวแทนผู้แจ้งงานจากรายชื่อที่ปรากฏ');
      return;
    }

    const hasFiles = Object.values(filesData).some(arr => arr.length > 0);
    if (!hasFiles && submissionType !== 'additional') {
      setErrorMessage('กรุณาแนบเอกสารอย่างน้อย 1 รายการ');
      return;
    }

    if (categoryId === '2' && !subCategoryId) {
      setErrorMessage('กรุณาเลือกหมวดหมู่ย่อย');
      return;
    }

    setIsSubmitting(true);

    try {
      let plateNumber = null;
      let customerName = null;

      if (categoryId === '1') {
        if (isRedPlate) {
          plateNumber = 'ป้ายแดง';
          customerName = referenceInput;
        } else {
          plateNumber = referenceInput;
        }
      } else {
        customerName = referenceInput;
      }

      const safeRef = referenceInput.replace(/[\/\\:*?"<>|]/g, '_').replace(/\s+/g, '_');
      const formData = new FormData();
      formData.append('quote_agent_id', informerId);
      formData.append('category_id', categoryId);
      if (categoryId === '2' && subCategoryId) {
        formData.append('sub_category_id', subCategoryId);
      }
      formData.append('submission_type', submissionType);
      if (plateNumber) formData.append('plate_number', plateNumber);
      if (customerName) formData.append('customer_name', customerName);
      if (endDate) formData.append('previous_policy_expiry_date', endDate);
      if (enableReminder && reminderDate) {
        formData.append('reminder_date', reminderDate);
        formData.append('reminder_type', reminderType);
      }
      if (notes) formData.append('notes', notes);

      if (submissionType === 'additional' && selectedPolicy) {
        formData.append('original_policy_id', selectedPolicy.id);
      }

      if (submissionType === 'success') {
        if (policyStartDate) formData.append('policy_start_date', policyStartDate);
        if (policyExpiryDate) formData.append('policy_expiry_date', policyExpiryDate);
        if (submitAgentCode) formData.append('submit_agent_id', submitAgentCode);
        if (companyId) formData.append('company_id', companyId);
        if (premiumAmount) formData.append('premium_amount', premiumAmount);
        if (paymentMethodId) formData.append('payment_method_id', paymentMethodId);
        if (brokerChannelId) formData.append('broker_channel_id', brokerChannelId);
        
        if (isInstallment) {
          formData.append('installment_months', installmentMonths);
        } else if (!isCreditCard && actualPaid) {
          formData.append('actual_paid', actualPaid);
        }
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
        const fileArr = filesData[map.key];
        if (fileArr.length > 0) {
          fileArr.forEach((file, index) => {
            const ext = file.name.split('.').pop() || 'pdf';
            let newFileName = `${safeRef}_${map.docType}`;

            if (submissionType === 'additional') {
              newFileName += `_เพิ่มเติม_${Date.now()}`;
            }
            if (fileArr.length > 1) {
              newFileName += `_${index + 1}`;
            }
            newFileName += `.${ext}`;

            // Create a new File object to rename it for the backend
            const renamedFile = new File([file], newFileName, { type: file.type });
            formData.append('files', renamedFile);
          });
        }
      }

      const response = await submitPolicy(baseApiUrl, formData);

      const result = await response.json();
      if (response.ok) {
        setSuccessMessage({
          title: 'ส่งข้อมูลสำเร็จ!',
          description: result.message + '\n\nคุณสามารถกรอกรายการถัดไปได้ทันทีคะ'
        });
        handleReset(false); // Silent reset on success
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

  return (
    <div class="relative min-h-[400px]">
      <form class={`space-y-4 transition-all duration-300 ${isSubmitting ? 'opacity-20 pointer-events-none scale-[0.98]' : 'opacity-100'}`} onSubmit={handleSubmit}>
        {/* วัตถุประสงค์ (Submission Type) - Priority Selection */}
        <div class="bg-brand-50/30 p-4 rounded-xl border border-brand-100/50 shadow-sm mb-6">
          <label class="block text-sm font-bold text-brand-800 mb-2">วัตถุประสงค์การแจ้งงาน <span class="text-red-500">*</span></label>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'new', label: '🆕 เช็คเบี้ยใหม่', desc: 'ยื่นคำขอใหม่' },
              { id: 'additional', label: '📎 ส่งเอกสารเพิ่ม', desc: 'อัปเดตงานเดิม' },
              { id: 'success', label: '✅ แจ้งงานสำเร็จ', desc: 'แนบใบแจ้งงาน' }
            ].map((type) => (
              <label
                key={type.id}
                class={`flex flex-col p-3 rounded-xl border-2 transition-all cursor-pointer ${submissionType === type.id
                  ? 'border-brand-500 bg-white shadow-md scale-[1.02]'
                  : 'border-white bg-white/50 hover:border-brand-200 opacity-70'
                  }`}
              >
                <input
                  type="radio"
                  name="submissionType"
                  value={type.id}
                  checked={submissionType === type.id}
                  onChange={(e) => {
                    const nextType = e.target.value;
                    // Reset all fields to ensure clean state for new purpose
                    setInformerId(null);
                    setInformerName('');
                    setCategoryId(nextType === 'new' ? '1' : '');
                    setSubCategoryId('');
                    setIsRedPlate(false);
                    setReferenceInput('');
                    setEndDate('');
                    setEnableReminder(false);
                    setReminderDate('');
                    setReminderType('quotation_confirm');
                    setSelectedPolicy(null);
                    setNotes('');
                    setPolicyStartDate('');
                    setPolicyExpiryDate('');
                    setSubmitAgentCode('');
                    setCompanyId('');
                    setCompanyName('');
                    setPremiumAmount('');
                    setPaymentMethodId('');
                    setSelectedPaymentMethod(null);
                    setActualPaid('');
                    setInstallmentMonths('1');
                    setFilesData({
                      registration: [],
                      oldPolicy: [],
                      quotation: [],
                      compQuotation: [],
                      renewalNotice: [],
                      workOrder: [],
                      others: []
                    });

                    // Update type
                    setSubmissionType(nextType);
                  }}
                  class="sr-only"
                />
                <span class="text-sm font-bold text-slate-700">{type.label}</span>
                <span class="text-[10px] text-gray-400 font-medium">{type.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {(submissionType === 'additional' || submissionType === 'success') && (
          <div class="bg-white p-4 rounded-xl border-2 border-brand-500 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 mb-6 ring-4 ring-brand-50">
            <label class="block text-sm font-bold text-brand-800 mb-2">
              {submissionType === 'success' ? '🔎\u00A0ค้นหารายการเดิมเพื่อแจ้งงานสำเร็จ' : '🔎\u00A0ค้นหารายการเดิมที่ต้องการส่งเอกสารเพิ่ม'} <span class="text-red-500">*</span>
            </label>
            <PolicySearch
              baseApiUrl={baseApiUrl}
              idToken={idToken}
              onSelectPolicy={handleSelectPolicy}
              initialQuery={selectedPolicy ? (selectedPolicy.plateNumber || selectedPolicy.plate_number || selectedPolicy.customerName || selectedPolicy.customer_name) : ''}
            />

            {selectedPolicy && (selectedPolicy.documentLink || selectedPolicy.document_link) && (
              <div class="mt-3 p-3 bg-brand-50 border border-brand-100 rounded-xl flex items-center justify-between animate-in fade-in zoom-in-95 duration-300">
                <div class="flex items-center gap-2">
                  <div class="p-2 bg-white rounded-full text-brand-600 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div class="text-[11px] font-bold text-brand-800 uppercase tracking-tight">เอกสารเดิมที่เคยยื่นไว้</div>
                    <div class="text-[10px] text-brand-600">เปิดดูใน Google Drive เพื่อตรวจสอบข้อมูล</div>
                  </div>
                </div>
                <a 
                  href={selectedPolicy.documentLink || selectedPolicy.document_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-brand-700 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span>📂 เปิดดูไฟล์</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                </a>
              </div>
            )}
            <p class="mt-2 text-[10px] text-gray-500 italic px-1">
              * ระบบจะช่วยเลือกตัวแทน ทะเบียน และหมวดหมู่ให้อัตโนมัติเมื่อเลือกรายการ (สำหรับแจ้งงานสำเร็จหรือส่งเอกสารเพิ่ม)
            </p>
          </div>
        )}

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              ตัวแทนผู้แจ้งงาน <span class="text-red-500">*</span>
            </label>
            <AgentSearch
              baseApiUrl={baseApiUrl}
              idToken={idToken}
              disabled={submissionType === 'additional' || submissionType === 'success'}
              onSelectAgent={(id, name) => { setInformerId(id); setInformerName(name); }}
              initialQuery={informerName}
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              หมวดหมู่ <span class="text-red-500">*</span>
            </label>
            <select
              required
              disabled={submissionType === 'additional' || submissionType === 'success'}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              class={`block w-full appearance-none rounded-xl border-gray-200 shadow-sm p-3 border transition-all text-sm
                ${(submissionType === 'additional' || submissionType === 'success') ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500'}`}
            >
              <option value="" disabled>-- เลือกหมวดหมู่ --</option>
              {categories.length > 0 ? (
                categories.map(cat => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                  </option>
                ))
              ) : (
                <option value="" disabled>กำลังโหลด...</option>
              )}
            </select>
          </div>

          {categoryId === '2' && (
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                หมวดหมู่ย่อย <span class="text-red-500">*</span>
              </label>
              <select
                required={categoryId === '2'}
                disabled={submissionType === 'additional' || submissionType === 'success'}
                value={subCategoryId}
                onChange={(e) => setSubCategoryId(e.target.value)}
                class={`block w-full appearance-none rounded-xl border-gray-200 shadow-sm p-3 border transition-all text-sm
                  ${(submissionType === 'additional' || submissionType === 'success') ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500'}`}
              >
                <option value="" disabled>-- เลือกหมวดหมู่ย่อย --</option>
                {subCategories.filter(s => s.categoryId?.toString() === '2').length > 0 ? (
                  subCategories.filter(s => s.categoryId?.toString() === '2').map(sub => (
                    <option key={sub.subCategoryId} value={sub.subCategoryId}>
                      {sub.subCategoryName}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>กำลังโหลดหมวดหมู่ย่อย...</option>
                )}
              </select>
            </div>
          )}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {categoryId === '1'
                ? (isRedPlate ? 'ชื่อผู้เอาประกัน (กรณีป้ายแดง)' : 'ทะเบียนรถ')
                : 'ชื่อผู้เอาประกัน'}
              <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={referenceInput}
              onInput={(e) => setReferenceInput(e.target.value)}
              required
              placeholder={categoryId === '1'
                ? (isRedPlate ? 'ระบุชื่อลูกค้า' : 'เช่น 1กข-1234 กทม')
                : 'เช่น สมชาย ใจดี'}
              class="block w-full rounded-xl border-gray-200 shadow-sm p-3 border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white/80 transition-all text-sm"
            />
            {categoryId === '1' && (
              <div class="mt-2 pl-1">
                <label class="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isRedPlate}
                    onChange={(e) => setIsRedPlate(e.target.checked)}
                    class="w-3.5 h-3.5 text-brand-600 border-gray-300 rounded focus:ring-brand-500 cursor-pointer"
                  />
                  <span class="ml-2 text-xs font-medium text-gray-500 group-hover:text-brand-600 transition-colors">รถใหม่ป้ายแดง / ยังไม่ทราบทะเบียน</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {submissionType === 'success' && (
          <div class="bg-white p-4 rounded-xl border-2 border-brand-500 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 mb-6 ring-4 ring-brand-50">
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-bold text-brand-700 mb-1">📅 วันที่เริ่มคุ้มครอง <span class="text-red-500">*</span></label>
                <input
                  type="date"
                  required={submissionType === 'success'}
                  value={policyStartDate}
                  onInput={(e) => setPolicyStartDate(e.target.value)}
                  class="block w-full rounded-xl border-brand-200 shadow-sm p-3 border-2 focus:ring-4 focus:ring-brand-100 focus:border-brand-500 bg-white transition-all text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-brand-700 mb-1">📅 วันที่หมดอายุ <span class="text-red-500">*</span></label>
                <input
                  type="date"
                  required={submissionType === 'success'}
                  value={policyExpiryDate}
                  onInput={(e) => setPolicyExpiryDate(e.target.value)}
                  class="block w-full rounded-xl border-brand-200 shadow-sm p-3 border-2 focus:ring-4 focus:ring-brand-100 focus:border-brand-500 bg-white transition-all text-sm"
                />
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-bold text-brand-700 mb-1">🏦 บริษัทประกันภัย <span class="text-red-500">*</span></label>
              <SearchableSelect
                options={companies}
                value={companyId}
                onSelect={(company) => {
                  setCompanyId(company ? company.companyId : '');
                  setCompanyName(company ? company.companyName : '');
                }}
                placeholder="-- เลือกบริษัทประกันภัย --"
                required={submissionType === 'success'}
                valueKey="companyId"
                labelKey="companyName"
                showIdInList={false}
              />
            </div>

            <label class="block text-sm font-bold text-brand-700 mb-2">
              📋 ประเภทงานที่แจ้งสำเร็จจริง <span class="text-red-500">*</span>
            </label>
            <select
              required={submissionType === 'success'}
              value={subCategoryId}
              onChange={(e) => setSubCategoryId(e.target.value)}
              class="block w-full appearance-none rounded-xl border-brand-200 shadow-sm p-3 border-2 focus:ring-4 focus:ring-brand-100 focus:border-brand-500 bg-white transition-all text-sm"
            >
              <option value="">-- เลือกประเภทงานที่ปิดการขายได้ --</option>
              <optgroup label="🚗 งานรถยนต์ (Motor)">
                {subCategories
                  .filter(sub => sub.categoryId?.toString() === '1')
                  .map(sub => (
                    <option key={sub.subCategoryId} value={sub.subCategoryId}>{sub.subCategoryName}</option>
                  ))
                }
              </optgroup>
              <optgroup label="🛡️ งานประกันอื่นๆ (Non-Motor)">
                {subCategories
                  .filter(sub => sub.categoryId?.toString() === '2')
                  .map(sub => (
                    <option key={sub.subCategoryId} value={sub.subCategoryId}>{sub.subCategoryName}</option>
                  ))
                }
              </optgroup>
            </select>
            <p class="mt-1.5 text-[11px] text-brand-500 italic pl-1">
              * หากเป็นงานประกันอื่นๆ โปรดเลือกประเภทประกันที่ถูกต้อง
            </p>

            <div class="mt-4">
              <label class="block text-sm font-bold text-brand-700 mb-1">💳 ช่องทางการชำระเงิน <span class="text-red-500">*</span></label>
              <SearchableSelect
                options={paymentMethods}
                value={paymentMethodId}
                onSelect={(method) => {
                  setPaymentMethodId(method ? method.paymentMethodId : '');
                  setSelectedPaymentMethod(method);
                }}
                placeholder="-- เลือกช่องทางการชำระเงิน --"
                required={submissionType === 'success'}
                valueKey="paymentMethodId"
                labelKey="paymentMethodName"
                showIdInList={false}
              />
            </div>

            <div class="mt-4 grid grid-cols-2 gap-4">
              <div class={isCreditCard ? "col-span-2" : ""}>
                <label class="block text-sm font-bold text-brand-700 mb-1">💰 ราคาบนใบเสนอราคา (Premium) <span class="text-red-500">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  required={submissionType === 'success'}
                  value={premiumAmount}
                  onInput={(e) => setPremiumAmount(e.target.value)}
                  placeholder="เช่น 15000.50"
                  class="block w-full rounded-xl border-brand-200 shadow-sm p-3 border-2 focus:ring-4 focus:ring-brand-100 focus:border-brand-500 bg-white transition-all text-sm"
                />
                {isCreditCard && (
                  <p class="mt-1.5 text-[10px] text-brand-500 font-medium flex items-center gap-1 animate-in fade-in slide-in-from-left-1 duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                    <span>ชำระผ่านบัตรเครดิต: ไม่ต้องระบุยอดโอนชำระจริง</span>
                  </p>
                )}
              </div>
              
              {isInstallment ? (
                <div class="animate-in fade-in slide-in-from-right-2 duration-300">
                  <label class="block text-sm font-bold text-brand-700 mb-1">📅 จำนวนงวดที่ผ่อน <span class="text-red-500">*</span></label>
                  <select
                    value={installmentMonths}
                    onChange={(e) => setInstallmentMonths(e.target.value)}
                    class="block w-full rounded-xl border-brand-200 shadow-sm p-3 border-2 focus:ring-4 focus:ring-brand-100 focus:border-brand-500 bg-white transition-all text-sm appearance-none"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1} เดือน</option>
                    ))}
                  </select>
                </div>
              ) : !isCreditCard && (
                <div class="animate-in fade-in slide-in-from-left-2 duration-300">
                  <label class="block text-sm font-bold text-brand-700 mb-1">💸 ยอดโอนชำระจริง <span class="text-red-500">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    required={submissionType === 'success' && !isInstallment && !isCreditCard}
                    value={actualPaid}
                    onInput={(e) => setActualPaid(e.target.value)}
                    placeholder="เช่น 14850.00"
                    class="block w-full rounded-xl border-brand-200 shadow-sm p-3 border-2 focus:ring-4 focus:ring-brand-100 focus:border-brand-500 bg-white transition-all text-sm"
                  />
                </div>
              )}
            </div>

            <div class="mt-4">
              <label class="block text-sm font-bold text-brand-700 mb-1">👤 รหัสแจ้งงาน <span class="text-red-500">*</span></label>
              <SearchableSelect
                options={allAgents}
                value={submitAgentCode}
                onSelect={(agent) => setSubmitAgentCode(agent ? agent.agentId : '')}
                placeholder="-- เลือกรหัสแจ้งงาน --"
                required={submissionType === 'success'}
                valueKey="agentId"
                labelKey="fullName"
                displayTemplate={(agent) => `${agent.fullName}`}
              />
            </div>

            <div class="mt-4">
              <label class="block text-sm font-bold text-brand-700 mb-1">📢 ช่องทางการแจ้งงาน <span class="text-red-500">*</span></label>
              <SearchableSelect
                options={brokerChannels}
                value={brokerChannelId}
                onSelect={(channel) => setBrokerChannelId(channel ? channel.channelId : '')}
                placeholder="-- เลือกช่องทางการแจ้งงาน --"
                required={submissionType === 'success'}
                valueKey="channelId"
                labelKey="channelName"
                showIdInList={false}
              />
            </div>
          </div>
        )}

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ / ข้อมูลเพิ่มเติม</label>
          <textarea
            value={notes}
            onInput={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="ระบุรายละเอียดเพิ่มเติม เช่น บริษัทเดิม, เลขกรมธรรม์เดิม หรือข้อความถึงแอดมิน..."
            class="block w-full rounded-xl border-gray-200 shadow-sm p-3 border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white/80 transition-all text-sm resize-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">วันที่ประกันเดิมหมดอายุ (ถ้าทราบ)</label>
          <input
            type="date"
            value={endDate}
            onInput={(e) => setEndDate(e.target.value)}
            class="block w-full rounded-xl border-gray-200 shadow-sm p-3 border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white/80 transition-all text-sm appearance-none cursor-pointer"
          />

          <div class="mt-3 bg-brand-50 border border-brand-100 rounded-lg p-3">
            <label class="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enableReminder}
                onChange={handleReminderToggle}
                class="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 cursor-pointer"
              />
              <span class="ml-2 text-sm font-medium text-brand-800">ตั้งแจ้งเตือน</span>
            </label>

            {enableReminder && (
              <div class="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                {/* ประเภทการแจ้งเตือน */}
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">ประเภทการแจ้งเตือน</label>
                  <div class="grid grid-cols-1 gap-2">
                    {templates.length > 0 ? (
                      templates.map((t) => {
                        const isDisabled = t.slug === 'follow_case' && !endDate;
                        return (
                          <label
                            key={t.slug}
                            onClick={(e) => {
                              if (isDisabled) {
                                e.preventDefault();
                                return;
                              }
                            }}
                            class={`flex items-center p-2 rounded-xl border-2 transition-all ${isDisabled
                              ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-100'
                              : reminderType === t.slug
                                ? 'border-brand-500 bg-brand-100/50 shadow-sm cursor-pointer'
                                : 'border-gray-200 bg-white hover:border-brand-200 cursor-pointer'
                              }`}
                          >
                            <input
                              type="radio"
                              name="reminderType"
                              value={t.slug}
                              checked={reminderType === t.slug}
                              onChange={() => !isDisabled && setReminderType(t.slug)}
                              disabled={isDisabled}
                              class="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                            />
                            <div class="ml-3 flex flex-col">
                              <span class={`text-sm font-medium ${reminderType === t.slug && !isDisabled ? 'text-brand-800' : 'text-gray-600'}`}>
                                {t.title}
                              </span>
                              {isDisabled && (
                                <span class="text-[10px] text-red-500 font-normal italic">
                                  * กรุณาระบุวันหมดอายุก่อนเลือก
                                </span>
                              )}
                            </div>
                          </label>
                        );
                      })
                    ) : (
                      <div class="text-xs text-gray-400 italic py-1 text-center bg-white/50 rounded-lg border border-dashed border-gray-200">
                        กำลังโหลดเทมเพลต...
                      </div>
                    )}
                  </div>
                </div>

                {/* วันที่แจ้งเตือน */}
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">แจ้งเตือนกลับในวันที่</label>
                  <input
                    type="date"
                    value={reminderDate}
                    onInput={(e) => setReminderDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    class="block w-full rounded-xl border-gray-200 shadow-sm p-3 text-sm border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 appearance-none cursor-pointer bg-white"
                  />
                </div>

                {/* พรีวิวข้อความ */}
                <div class="bg-white/60 rounded-xl p-3 border border-brand-100 shadow-inner">
                  <label class="block text-[10px] font-bold text-brand-400 mb-2 uppercase tracking-widest pl-1">Preview (LINE Message)</label>
                  <div class="relative flex items-start">
                    <div class="w-8 h-8 rounded-full bg-brand-500 flex-shrink-0 flex items-center justify-center text-white text-xs shadow-sm">
                      Bot
                    </div>
                    <div class="ml-2 bg-white border border-gray-100 rounded-2xl rounded-tl-none p-3 shadow-md max-w-[85%]">
                      <p class="text-[13px] text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {(() => {
                          const template = templates.find(t => t.slug === reminderType);
                          if (!template) return 'เลือกประเภทการแจ้งเตือน...';

                          const dPlate = categoryId === '1' ? (isRedPlate ? 'ป้ายแดง' : (referenceInput || '')) : '';
                          const dCustomer = categoryId === '1' ? (isRedPlate ? (referenceInput || '') : '') : (referenceInput || '');

                          let finalPreview = template.body_template
                            .replace(/{{customer}}/g, dCustomer)
                            .replace(/{{plate}}/g, dPlate)
                            .replace(/{{previous_policy_expiry_date}}/g, formatThaiDate(endDate));

                          // ลบวงเล็บที่ว่างเปล่าออกเพื่อความสวยงาม
                          return finalPreview.replace(/\(\s*\)/g, '').replace(/\s+/g, ' ').trim();
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

                <p class="text-[11px] text-gray-400 italic text-center">* ระบบจะส่งข้อความแจ้งเตือนที่เห็นนี้ไปหาคุณอัตโนมัติ</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            แนบเอกสารตามประเภท {(submissionType === 'additional' || submissionType === 'success') ? <span class="text-xs text-gray-400 font-normal">(ถ้ามี)</span> : <span class="text-red-500">*</span>}
            {!(submissionType === 'additional' || submissionType === 'success') && <span class="text-xs text-gray-400 font-normal"> (แนบอย่างน้อย 1 ช่อง)</span>}
          </label>

          <div class="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-inner">
            <Dropzone label="1. หน้ารายการจดทะเบียน / สำเนารถ" fileTypeIcon="📑" initialFiles={filesData.registration} onFilesChanged={(files) => setFilesData({ ...filesData, registration: files })} onOpenGallery={onOpenGallery} />
            <Dropzone label="2. กรมธรรม์เดิม" fileTypeIcon="🛡️" initialFiles={filesData.oldPolicy} onFilesChanged={(files) => setFilesData({ ...filesData, oldPolicy: files })} onOpenGallery={onOpenGallery} />
            <Dropzone label="3. ใบเสนอราคา" fileTypeIcon="💰" initialFiles={filesData.quotation} onFilesChanged={(files) => setFilesData({ ...filesData, quotation: files })} onOpenGallery={onOpenGallery} />
            <Dropzone label="4. ใบเสนอราคาคู่แข่ง" fileTypeIcon="🏢" initialFiles={filesData.compQuotation} onFilesChanged={(files) => setFilesData({ ...filesData, compQuotation: files })} onOpenGallery={onOpenGallery} />
            <Dropzone label="5. เบี้ยต่ออายุ / ใบเตือนต่ออายุ" fileTypeIcon="🔄" initialFiles={filesData.renewalNotice} onFilesChanged={(files) => setFilesData({ ...filesData, renewalNotice: files })} onOpenGallery={onOpenGallery} />
            {submissionType === 'success' && (
              <Dropzone label="6. ใบแจ้งงาน" fileTypeIcon="📝" initialFiles={filesData.workOrder} onFilesChanged={(files) => setFilesData({ ...filesData, workOrder: files })} onOpenGallery={onOpenGallery} />
            )}
            <Dropzone label={submissionType === 'success' ? "7. เอกสารอื่นๆ (แนบได้หลายไฟล์)" : "6. เอกสารอื่นๆ (แนบได้หลายไฟล์)"} fileTypeIcon="📎" initialFiles={filesData.others} multiple={true} onFilesChanged={(files) => setFilesData({ ...filesData, others: files })} onOpenGallery={onOpenGallery} />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3 mt-6">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleReset(true)}
            class="col-span-1 border-2 border-slate-200 text-slate-500 font-bold py-3 px-2 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] disabled:opacity-50 text-sm flex items-center justify-center gap-1"
          >
            ♻️&nbsp;ล้างข้อมูล
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            class={`col-span-2 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 active:scale-[0.98] 
              ${isSubmitting ? 'bg-brand-300 cursor-not-allowed' : 'bg-gradient-to-r from-brand-500 to-brand-600 hover:shadow-brand-500/30 hover:-translate-y-0.5'}`}
          >
            {isSubmitting ? '⏳ กำลังส่ง...' : 'ส่งข้อมูลเช็คเบี้ย'}
          </button>
        </div>
      </form>
    </div>
  );
}
