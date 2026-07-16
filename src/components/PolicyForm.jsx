import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

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
  isSubmitting,
  setIsSubmitting,
  setSuccessMessage,
  setErrorMessage,
  setConfirmModal,
  onOpenGallery
}) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval;
    if (isSubmitting) {
      setElapsedTime(0);
      const startTime = Date.now();
      interval = setInterval(() => {
        setElapsedTime((Date.now() - startTime) / 1000);
      }, 100);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [isSubmitting]);

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

  const { handleSubmit } = usePolicySubmit({
    baseApiUrl,
    state,
    actions,
    setSuccessMessage,
    setErrorMessage,
    setIsSubmitting
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
      <form class={`space-y-4 transition-all duration-300 ${isSubmitting ? 'opacity-20 pointer-events-none scale-[0.98]' : 'opacity-100'}`} onSubmit={handleSubmit}>
        
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
            disabled={isSubmitting}
            onClick={() => actions.handleReset(true)}
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

      {isSubmitting && (
        <div class="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl">
          <div class="bg-white p-6 rounded-2xl shadow-xl border border-brand-100 flex flex-col items-center gap-3 text-center">
            <div class="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <p class="font-bold text-brand-800 text-sm">กำลังบันทึกข้อมูล...</p>
              <p class="text-xs text-slate-500 mt-1">ใช้เวลาประมวลผล {elapsedTime.toFixed(1)} วินาที</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
