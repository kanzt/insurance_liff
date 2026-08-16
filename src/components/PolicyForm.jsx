import { h } from 'preact';

import { usePolicyFormState } from '../hooks/usePolicyFormState';
import { useReferenceData } from '../hooks/useReferenceData';
import { usePolicySubmit } from '../hooks/usePolicySubmit';

import { PurposeSelector } from './PolicyForm/PurposeSelector';
import { BasicInfoSection } from './PolicyForm/BasicInfoSection';
import { ReminderSection } from './PolicyForm/ReminderSection';
import { SuccessFlowSection } from './PolicyForm/SuccessFlowSection';
import { AttachmentSection } from './PolicyForm/AttachmentSection';

export function PolicyForm({
  idToken,
  baseApiUrl,
  setUploadToasts,
  setUploadHistory,
  uploadHistory,
  setErrorMessage,
  setConfirmModal,
  onOpenGallery
}) {
  const { state, setters, actions } = usePolicyFormState(setConfirmModal);
  
  const {
    categories,
    products,
    templates,
    allAgents,
    companies,
    paymentMethods,
    brokerChannels,
    quotationTypes,
  } = useReferenceData(baseApiUrl, setters.setCategoryId);

  // Compute default category ID (Motor / ประกันรถยนต์)
  const motorCategory = categories?.find(c => c.categoryName === 'ประกันรถยนต์' || c.categoryName.toLowerCase() === 'motor');
  const defaultCategoryId = motorCategory ? (motorCategory.categoryId || motorCategory.category_id)?.toString() : (categories?.length > 0 ? (categories[0].categoryId || categories[0].category_id)?.toString() : '');

  const { handleSubmit } = usePolicySubmit({
    baseApiUrl,
    state,
    actions,
    setUploadToasts,
    setUploadHistory,
    setErrorMessage,
    defaultCategoryId
  });

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

  return (
    <div class="relative min-h-[400px]">
      <form class="space-y-4 transition-all duration-300 opacity-100" onSubmit={handleSubmit}>
        
        <PurposeSelector 
          state={state}
          setters={setters}
          actions={actions}
          quotationTypes={quotationTypes}
        />



        <BasicInfoSection 
          state={state}
          setters={setters}
          actions={actions}
          baseApiUrl={baseApiUrl}
          idToken={idToken}
          categories={categories}
          uploadHistory={uploadHistory}
        />

        <ReminderSection 
          state={state}
          setters={setters}
          actions={actions}
          templates={templates}
          formatThaiDate={formatThaiDate}
        />

        <SuccessFlowSection 
          state={state}
          setters={setters}
          companies={companies}
          products={products}
          paymentMethods={paymentMethods}
          allAgents={allAgents}
          brokerChannels={brokerChannels}
        />

        <AttachmentSection 
          state={state}
          setters={setters}
          onOpenGallery={onOpenGallery}
        />

        <div class="grid grid-cols-3 gap-3 mt-6">
          <button
            type="button"
            onClick={() => actions.handleReset(true, defaultCategoryId)}
            class="col-span-1 border-2 border-slate-200 text-slate-500 font-bold py-3 px-2 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] disabled:opacity-50 text-sm flex items-center justify-center gap-1"
          >
            ♻️&nbsp;ล้างข้อมูล
          </button>
          
          {(() => {
            const isProcessing = uploadHistory && uploadHistory.some(
              job => job.title === state.referenceInput && job.status === 'loading'
            );
            const isRenewalLocked = state.submissionType === 'quotation' && state.quotationSubType === 'new' && !state.isPlateTransfer && (
              Boolean(state.selectedPolicy?.policyId) ||
              state.selectedPolicy?._recordType === 'policy' ||
              state.selectedPolicy?.quotationTypeId === 'renewal' ||
              state.selectedPolicy?.quotation_type_id === 'renewal'
            );
            const isDuplicate = state.submissionType === 'quotation' && !state.selectedPolicy && state.duplicatePolicy && !state.isPlateTransfer;
            const isDisabled = isProcessing || isDuplicate || isRenewalLocked;

            let buttonLabel = 'ส่งข้อมูลเช็คเบี้ย';
            if (state.submissionType === 'success') {
              buttonLabel = 'ส่งข้อมูลแจ้งงานสำเร็จ';
            } else if (state.quotationSubType === 'renewal') {
              buttonLabel = 'ส่งข้อมูลเช็คเบี้ยต่ออายุ';
            }

            return (
              <button
                type="submit"
                disabled={isDisabled}
                class={`col-span-2 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 flex flex-col items-center justify-center leading-tight
                  ${isDisabled
                    ? 'bg-gray-400 cursor-not-allowed opacity-50 shadow-none' 
                    : 'active:scale-[0.98] bg-gradient-to-r from-brand-500 to-brand-600 hover:shadow-brand-500/30 hover:-translate-y-0.5'}`}
              >
                <span>{buttonLabel}</span>
                {isProcessing && <span class="text-[10px] font-normal opacity-90 mt-0.5">ระบบกำลังประมวลผลทะเบียนนี้...</span>}
                {isRenewalLocked && <span class="text-[10px] font-normal opacity-90 mt-0.5">⚠️ กรุณากดสลับเป็นงานต่ออายุ หรือสลับป้ายทะเบียน</span>}
              </button>
            );
          })()}

        </div>
      </form>
    </div>
  );
}

