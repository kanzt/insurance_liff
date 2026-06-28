import { h } from 'preact';
import { AgentSearch } from '../AgentSearch';

export function BasicInfoSection({
  submissionType,
  baseApiUrl,
  idToken,
  informerName,
  setInformerId,
  setInformerName,
  categoryId,
  setCategoryId,
  categories,
  referenceInput,
  setReferenceInput,
  isRedPlate,
  setIsRedPlate,
  notes,
  setNotes
}) {
  return (
    <>
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
            disabled={submissionType === 'success' || submissionType === 'additional'}
            placeholder={categoryId === '1'
              ? (isRedPlate ? 'ระบุชื่อลูกค้า' : 'เช่น 1กข-1234 กทม')
              : 'เช่น สมชาย ใจดี'}
            class={`block w-full rounded-xl border-gray-200 shadow-sm p-3 border transition-all text-sm
              ${(submissionType === 'success' || submissionType === 'additional') ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white/80'}`}
          />
          {categoryId === '1' && submissionType !== 'additional' && submissionType !== 'success' && (
            <div class="mt-2 pl-1">
              <label class="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isRedPlate}
                  onChange={(e) => setIsRedPlate(e.target.checked)}
                  class="w-3.5 h-3.5 text-brand-600 border-gray-300 rounded focus:ring-brand-500 transition-all cursor-pointer"
                />
                <span class="ml-2 text-xs font-medium transition-colors text-gray-500 group-hover:text-brand-600">รถใหม่ป้ายแดง / ยังไม่ทราบทะเบียน</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {submissionType !== 'success' && (
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ / ข้อมูลเพิ่มเติม</label>
          <textarea
            value={notes}
            onInput={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="ระบุรายละเอียดเพิ่มเติม เช่น บริษัทเดิม, เลขกรมธรรม์เดิม หรือข้อความถึงแอดมิน..."
            class="block w-full rounded-xl border-gray-200 shadow-sm p-3 border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white/80 transition-all text-sm resize-none"
          />
        </div>
      )}
    </>
  );
}
