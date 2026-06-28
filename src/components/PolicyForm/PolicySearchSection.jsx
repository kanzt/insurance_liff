import { h } from 'preact';
import { PolicySearch } from '../PolicySearch';

export function PolicySearchSection({
  submissionType,
  baseApiUrl,
  idToken,
  selectedPolicy,
  handleSelectPolicy
}) {
  if (submissionType !== 'additional' && submissionType !== 'success') return null;

  return (
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
  );
}
