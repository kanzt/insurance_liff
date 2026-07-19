import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { AgentSearch } from '../AgentSearch';
import { searchQuotations } from '../../utils/api';

export function BasicInfoSection({
  state,
  setters,
  actions,
  baseApiUrl,
  idToken,
  categories
}) {
  const {
    submissionType, informerName, categoryId, referenceInput, isRedPlate, notes, duplicatePolicy
  } = state;
  const {
    setInformerId, setInformerName, setCategoryId, setReferenceInput, setIsRedPlate, setNotes, setDuplicatePolicy, setSubmissionType
  } = setters;

  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

  // Debounced check for existing plate numbers
  useEffect(() => {
    if (submissionType !== 'new' || !referenceInput || referenceInput.length < 2) {
      setDuplicatePolicy(null);
      setIsCheckingDuplicate(false);
      return;
    }

    const handler = setTimeout(async () => {
      setIsCheckingDuplicate(true);
      try {
        const currentYear = new Date().getFullYear().toString();
        const response = await searchQuotations(baseApiUrl, referenceInput, 10, currentYear);
        const json = await response.json();
        
        if (json.results && json.results.length > 0) {
          // Exact match check
          const exactMatch = json.results.find(policy => {
            const plate = policy.plateNumber || policy.plate_number || '';
            const customer = policy.customerName || policy.customer_name || '';
            return plate.toLowerCase() === referenceInput.toLowerCase() || customer.toLowerCase() === referenceInput.toLowerCase();
          });
          
          if (exactMatch) {
            setDuplicatePolicy(exactMatch);
          } else {
            setDuplicatePolicy(null);
          }
        } else {
          setDuplicatePolicy(null);
        }
      } catch (error) {
        console.error("Duplicate check error:", error);
      } finally {
        setIsCheckingDuplicate(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [referenceInput, submissionType, baseApiUrl]);

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
          <div class="relative">
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
                ${(submissionType === 'success' || submissionType === 'additional') ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white/80'}
                ${duplicatePolicy && submissionType === 'new' ? 'border-red-400 ring-4 ring-red-50' : ''}`}
            />
            {isCheckingDuplicate && (
              <div class="absolute right-3 top-3.5">
                <div class="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          {duplicatePolicy && submissionType === 'new' && (
            <div class="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg animate-in fade-in zoom-in-95 duration-200">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div class="flex items-start sm:items-center gap-2 text-red-700 text-xs sm:text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                  <span><strong>พบข้อมูลนี้ในระบบแล้ว!</strong> ไม่สามารถสร้างเช็คเบี้ยใหม่ได้</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSubmissionType('additional');
                    if (actions && actions.handleSelectPolicy) {
                      actions.handleSelectPolicy(duplicatePolicy);
                    }
                  }}
                  class="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-red-700 active:scale-95 transition-all whitespace-nowrap self-start sm:self-auto"
                >
                  เปลี่ยนเป็นส่งเอกสารเพิ่มเติม
                </button>
              </div>
            </div>
          )}

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
