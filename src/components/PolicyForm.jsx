import { h } from 'preact';

import { usePolicyFormState } from '../hooks/usePolicyFormState';
import { useReferenceData } from '../hooks/useReferenceData';
import { usePolicySubmit } from '../hooks/usePolicySubmit';

import { PurposeSelector } from './PolicyForm/PurposeSelector';
import { PolicySearchSection } from './PolicyForm/PolicySearchSection';
import { BasicInfoSection } from './PolicyForm/BasicInfoSection';
import { ReminderSection } from './PolicyForm/ReminderSection';
import { SuccessFlowSection } from './PolicyForm/SuccessFlowSection';
import { AttachmentSection } from './PolicyForm/AttachmentSection';

export function PolicyForm({
  idToken,
  baseApiUrl,
  setUploadToasts,
  setUploadHistory,
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
        />

        <PolicySearchSection 
          state={state}
          actions={actions}
          baseApiUrl={baseApiUrl}
          idToken={idToken}
        />

        <BasicInfoSection 
          state={state}
          setters={setters}
          actions={actions}
          baseApiUrl={baseApiUrl}
          idToken={idToken}
          categories={categories}
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
          <button
            type="submit"
            disabled={state.submissionType === 'new' && state.duplicatePolicy}
            class={`col-span-2 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-200 
              ${(state.submissionType === 'new' && state.duplicatePolicy) 
                ? 'bg-gray-400 cursor-not-allowed opacity-50 shadow-none' 
                : 'active:scale-[0.98] bg-gradient-to-r from-brand-500 to-brand-600 hover:shadow-brand-500/30 hover:-translate-y-0.5'}`}
          >
            ส่งข้อมูลเช็คเบี้ย
          </button>
        </div>
      </form>
    </div>
  );
}
