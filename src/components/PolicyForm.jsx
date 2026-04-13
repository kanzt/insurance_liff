import { useState, useEffect } from 'preact/hooks';
import liff from '@line/liff';
import { AgentSearch } from './AgentSearch';
import { Dropzone } from './Dropzone';
import { authenticatedFetch } from '../utils/api';

const STORAGE_KEY = 'insurance_liff_form_draft';

export function PolicyForm({ idToken, baseApiUrl, isSubmitting, setIsSubmitting, setSuccessMessage, setErrorMessage, onOpenGallery }) {
  const [informerId, setInformerId] = useState(null);
  const [informerName, setInformerName] = useState('');
  const [categoryId, setCategoryId] = useState('1');
  const [submissionType, setSubmissionType] = useState('new');
  const [referenceInput, setReferenceInput] = useState('');
  const [endDate, setEndDate] = useState('');
  const [enableReminder, setEnableReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState('');

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
        if (data.categoryId) setCategoryId(data.categoryId);
        if (data.submissionType) setSubmissionType(data.submissionType);
        if (data.referenceInput) setReferenceInput(data.referenceInput);
        if (data.endDate) setEndDate(data.endDate);
        if (data.enableReminder) setEnableReminder(data.enableReminder);
        if (data.reminderDate) setReminderDate(data.reminderDate);
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
      categoryId,
      submissionType,
      referenceInput,
      endDate,
      enableReminder,
      reminderDate,
      isRedPlate
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [informerId, informerName, categoryId, submissionType, referenceInput, endDate, enableReminder, reminderDate, isRedPlate]);

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
    if (showConfirm && !window.confirm('♻️ คุณต้องการล้างข้อมูลในฟอร์มทั้งหมดใช่หรือไม่?')) {
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    setInformerId(null);
    setInformerName('');
    setCategoryId('1');
    setSubmissionType('new');
    setIsRedPlate(false);
    setReferenceInput('');
    setEndDate('');
    setEnableReminder(false);
    setReminderDate('');
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
      formData.append('informer_id', informerId);
      formData.append('category_id', categoryId);
      formData.append('submission_type', submissionType);
      if (plateNumber) formData.append('plate_number', plateNumber);
      if (customerName) formData.append('customer_name', customerName);
      if (endDate) formData.append('end_date', endDate);
      if (enableReminder && reminderDate) formData.append('reminder_date', reminderDate);

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
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              class="block w-full appearance-none rounded-xl border-gray-200 shadow-sm p-3 border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white/80 transition-all text-sm bg-white"
            >
              <option value="1">ประกันรถยนต์ (Motor)</option>
              <option value="2">ประกันอื่นๆ (Non-Motor)</option>
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
              <span class="ml-2 text-sm font-medium text-brand-800">ตั้งเตือนให้ออกใบเสนอราคาล่วงหน้า</span>
            </label>

            {enableReminder && (
              <div class="mt-3">
                <label class="block text-xs font-semibold text-gray-600 mb-1">วันที่ต้องการให้ระบบแจ้งเตือนกลับ</label>
                <input
                  type="date"
                  value={reminderDate}
                  onInput={(e) => setReminderDate(e.target.value)}
                  required
                  class="block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm border focus:ring-brand-500 focus:border-brand-500 appearance-none cursor-pointer bg-white"
                />
                <p class="text-[11px] text-gray-500 mt-1">* ระบบจะส่งข้อความแจ้งเตือนผ่าน LINE ไปหาคุณในวันที่กำหนด</p>
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
