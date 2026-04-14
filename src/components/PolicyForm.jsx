import { useState, useEffect } from 'preact/hooks';
import liff from '@line/liff';
import { AgentSearch } from './AgentSearch';
import { Dropzone } from './Dropzone';
import { authenticatedFetch } from '../utils/api';

const STORAGE_KEY = 'insurance_liff_form_draft';

export function PolicyForm({ idToken, baseApiUrl, isSubmitting, setIsSubmitting, setSuccessMessage, setErrorMessage, setConfirmModal, onOpenGallery }) {
  const [informerId, setInformerId] = useState(null);
  const [informerName, setInformerName] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [subCategories, setSubCategories] = useState([]);
  const [submissionType, setSubmissionType] = useState('new');
  const [referenceInput, setReferenceInput] = useState('');
  const [endDate, setEndDate] = useState('');
  const [enableReminder, setEnableReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderType, setReminderType] = useState('quotation_confirm');
  const [templates, setTemplates] = useState([]);

  const [isRedPlate, setIsRedPlate] = useState(false);
  const [filesData, setFilesData] = useState({
    registration: [],
    oldPolicy: [],
    quotation: [],
    compQuotation: [],
    renewalNotice: [],
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
        if (data.subCategoryId) setSubCategoryId(data.subCategoryId);
        if (data.submissionType) setSubmissionType(data.submissionType);
        if (data.referenceInput) setReferenceInput(data.referenceInput);
        if (data.endDate) setEndDate(data.endDate);
        if (data.enableReminder) setEnableReminder(data.enableReminder);
        if (data.reminderDate) setReminderDate(data.reminderDate);
        if (data.reminderType) setReminderType(data.reminderType);
        if (data.isRedPlate !== undefined) setIsRedPlate(data.isRedPlate);
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
      subCategoryId,
      submissionType,
      referenceInput,
      endDate,
      enableReminder,
      reminderDate,
      reminderType,
      isRedPlate
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [informerId, informerName, subCategoryId, submissionType, referenceInput, endDate, enableReminder, reminderDate, reminderType, isRedPlate]);

  // Load sub-categories
  useEffect(() => {
    async function loadSubCategories() {
      try {
        const response = await authenticatedFetch(`${baseApiUrl}/load-sub-categories`);
        const json = await response.json();
        if (json.results) {
          setSubCategories(json.results);
          if (json.results.length > 0 && !localStorage.getItem(STORAGE_KEY)?.includes('subCategoryId')) {
             setSubCategoryId(json.results[0].subCategoryId.toString());
          }
        }
      } catch (err) {
        console.error("Failed to load sub-categories:", err);
      }
    }
    loadSubCategories();

    async function loadTemplates() {
      try {
        const response = await authenticatedFetch(`${baseApiUrl}/load-notification-templates`);
        const json = await response.json();
        if (json.results) {
          setTemplates(json.results);
        }
      } catch (err) {
        console.error("Failed to load templates:", err);
      }
    }
    loadTemplates();
  }, [baseApiUrl]);

  // Derived categoryId to keep motor vs non-motor dynamic logic intact
  const selectedSub = subCategories.find(s => s.subCategoryId.toString() === subCategoryId);
  const categoryId = selectedSub ? selectedSub.categoryId.toString() : '1';

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
      setSubCategoryId('');
      setSubmissionType('new');
      setIsRedPlate(false);
      setReferenceInput('');
      setEndDate('');
      setEnableReminder(false);
      setReminderDate('');
      setReminderType('quotation_confirm');
      setFilesData({
        registration: [],
        oldPolicy: [],
        quotation: [],
        compQuotation: [],
        renewalNotice: [],
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!informerId) {
      setErrorMessage('กรุณาเลือกตัวแทนผู้แจ้งงานจากรายชื่อที่ปรากฏ');
      return;
    }

    const hasFiles = Object.values(filesData).some(arr => arr.length > 0);
    if (!hasFiles) {
      setErrorMessage('กรุณาแนบเอกสารอย่างน้อย 1 รายการ');
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
      formData.append('quote_agent_code', informerId);
      formData.append('sub_category_id', subCategoryId);
      formData.append('submission_type', submissionType);
      if (plateNumber) formData.append('plate_number', plateNumber);
      if (customerName) formData.append('customer_name', customerName);
      if (endDate) formData.append('previous_policy_expiry_date', endDate);
      if (enableReminder && reminderDate) {
        formData.append('reminder_date', reminderDate);
        formData.append('reminder_type', reminderType);
      }

      const fileMappings = [
        { key: 'registration', docType: 'หน้ารายการจดทะเบียน' },
        { key: 'oldPolicy', docType: 'กรมธรรม์เดิม' },
        { key: 'quotation', docType: 'ใบเสนอราคา' },
        { key: 'compQuotation', docType: 'ใบเสนอราคาคู่แข่ง' },
        { key: 'renewalNotice', docType: 'เบี้ยต่ออายุ' },
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

      const response = await authenticatedFetch(`${baseApiUrl}/submit-policy`, {
        method: 'POST',
        body: formData
      });

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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ตัวแทนผู้แจ้งงาน <span class="text-red-500">*</span></label>
            <AgentSearch
              baseApiUrl={baseApiUrl}
              idToken={idToken}
              onSelectAgent={(id, name) => { setInformerId(id); setInformerName(name); }}
              initialQuery={informerName}
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">หมวดหมู่ <span class="text-red-500">*</span></label>
            <select
              required
              value={subCategoryId}
              onChange={(e) => setSubCategoryId(e.target.value)}
              class="block w-full appearance-none rounded-xl border-gray-200 shadow-sm p-3 border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white/80 transition-all text-sm bg-white"
            >
              <option value="" disabled>-- เลือกหมวดหมู่ --</option>
              {subCategories.length > 0 ? (
                subCategories.map(sub => (
                  <option key={sub.subCategoryId} value={sub.subCategoryId}>
                    {sub.subCategoryName}
                  </option>
                ))
              ) : (
                <option value="" disabled>กำลังโหลด...</option>
              )}
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">วัตถุประสงค์ <span class="text-red-500">*</span></label>
            <select
              value={submissionType}
              onChange={(e) => setSubmissionType(e.target.value)}
              class="block w-full appearance-none rounded-xl border-gray-200 shadow-sm p-3 border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white/80 transition-all text-sm bg-white"
            >
              <option value="new">🆕 แจ้งเช็คเบี้ยใหม่</option>
              <option value="renewal">🔄 แจ้งเช็คเบี้ยต่ออายุ</option>
              <option value="additional">📎 ส่งเอกสารเพิ่มเติม (อัปเดตงานเดิม)</option>
            </select>
          </div>

          <div>
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
                      templates.map((t) => (
                        <label 
                          key={t.slug}
                          class={`flex items-center p-2 rounded-xl border-2 transition-all cursor-pointer ${
                            reminderType === t.slug 
                              ? 'border-brand-500 bg-brand-100/50 shadow-sm' 
                              : 'border-gray-200 bg-white hover:border-brand-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name="reminderType"
                            value={t.slug}
                            checked={reminderType === t.slug}
                            onChange={() => setReminderType(t.slug)}
                            class="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                          />
                          <span class={`ml-3 text-sm font-medium ${reminderType === t.slug ? 'text-brand-800' : 'text-gray-600'}`}>
                            {t.title}
                          </span>
                        </label>
                      ))
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
                          
                          const dPlate = categoryId === '1' ? (isRedPlate ? 'ป้ายแดง' : (referenceInput || '...')) : 'ไม่ระบุ';
                          const dCustomer = categoryId === '1' ? (isRedPlate ? (referenceInput || '...') : 'ไม่ระบุ') : (referenceInput || '...');
                          
                          return template.body_template
                            .replace(/{{customer}}/g, dCustomer)
                            .replace(/{{plate}}/g, dPlate);
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
            แนบเอกสารตามประเภท <span class="text-red-500">*</span> <span class="text-xs text-gray-400 font-normal">(แนบอย่างน้อย 1 ช่อง)</span>
          </label>

          <div class="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-inner">
            <Dropzone label="1. หน้ารายการจดทะเบียน / สำเนารถ" fileTypeIcon="📑" initialFiles={filesData.registration} onFilesChanged={(files) => setFilesData({ ...filesData, registration: files })} onOpenGallery={onOpenGallery} />
            <Dropzone label="2. กรมธรรม์เดิม" fileTypeIcon="🛡️" initialFiles={filesData.oldPolicy} onFilesChanged={(files) => setFilesData({ ...filesData, oldPolicy: files })} onOpenGallery={onOpenGallery} />
            <Dropzone label="3. ใบเสนอราคา" fileTypeIcon="💰" initialFiles={filesData.quotation} onFilesChanged={(files) => setFilesData({ ...filesData, quotation: files })} onOpenGallery={onOpenGallery} />
            <Dropzone label="4. ใบเสนอราคาคู่แข่ง" fileTypeIcon="🏢" initialFiles={filesData.compQuotation} onFilesChanged={(files) => setFilesData({ ...filesData, compQuotation: files })} onOpenGallery={onOpenGallery} />
            <Dropzone label="5. เบี้ยต่ออายุ / ใบเตือนต่ออายุ" fileTypeIcon="🔄" initialFiles={filesData.renewalNotice} onFilesChanged={(files) => setFilesData({ ...filesData, renewalNotice: files })} onOpenGallery={onOpenGallery} />
            <Dropzone label="6. เอกสารอื่นๆ (แนบได้หลายไฟล์)" fileTypeIcon="📎" initialFiles={filesData.others} multiple={true} onFilesChanged={(files) => setFilesData({ ...filesData, others: files })} onOpenGallery={onOpenGallery} />
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
