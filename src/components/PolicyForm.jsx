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
  isSubmitting,
  setIsSubmitting,
  setSuccessMessage,
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
          submissionType={state.submissionType}
          setSubmissionType={setters.setSubmissionType}
          handleReset={actions.handleReset}
          setCategoryId={setters.setCategoryId}
        />

        <PolicySearchSection 
          submissionType={state.submissionType}
          baseApiUrl={baseApiUrl}
          idToken={idToken}
          selectedPolicy={state.selectedPolicy}
          handleSelectPolicy={actions.handleSelectPolicy}
        />

        <BasicInfoSection 
          submissionType={state.submissionType}
          baseApiUrl={baseApiUrl}
          idToken={idToken}
          informerName={state.informerName}
          setInformerId={setters.setInformerId}
          setInformerName={setters.setInformerName}
          categoryId={state.categoryId}
          setCategoryId={setters.setCategoryId}
          categories={categories}
          referenceInput={state.referenceInput}
          setReferenceInput={setters.setReferenceInput}
          isRedPlate={state.isRedPlate}
          setIsRedPlate={setters.setIsRedPlate}
          notes={state.notes}
          setNotes={setters.setNotes}
        />

        <ReminderSection 
          submissionType={state.submissionType}
          endDate={state.endDate}
          setEndDate={setters.setEndDate}
          enableReminder={state.enableReminder}
          handleReminderToggle={actions.handleReminderToggle}
          templates={templates}
          reminderType={state.reminderType}
          setReminderType={setters.setReminderType}
          reminderDate={state.reminderDate}
          setReminderDate={setters.setReminderDate}
          categoryId={state.categoryId}
          isRedPlate={state.isRedPlate}
          referenceInput={state.referenceInput}
          formatThaiDate={formatThaiDate}
        />

        <SuccessFlowSection 
          submissionType={state.submissionType}
          policyStartDate={state.policyStartDate}
          setPolicyStartDate={setters.setPolicyStartDate}
          policyExpiryDate={state.policyExpiryDate}
          setPolicyExpiryDate={setters.setPolicyExpiryDate}
          companies={companies}
          companyId={state.companyId}
          setCompanyId={setters.setCompanyId}
          setCompanyName={setters.setCompanyName}
          productId={state.productId}
          setProductId={setters.setProductId}
          products={products}
          paymentMethods={paymentMethods}
          paymentMethodId={state.paymentMethodId}
          setPaymentMethodId={setters.setPaymentMethodId}
          setSelectedPaymentMethod={setters.setSelectedPaymentMethod}
          selectedPaymentMethod={state.selectedPaymentMethod}
          premiumAmount={state.premiumAmount}
          setPremiumAmount={setters.setPremiumAmount}
          actualPaid={state.actualPaid}
          setActualPaid={setters.setActualPaid}
          installmentMonths={state.installmentMonths}
          setInstallmentMonths={setters.setInstallmentMonths}
          allAgents={allAgents}
          submitAgentCode={state.submitAgentCode}
          setSubmitAgentCode={setters.setSubmitAgentCode}
          brokerChannels={brokerChannels}
          brokerChannelId={state.brokerChannelId}
          setBrokerChannelId={setters.setBrokerChannelId}
          commissionPercent={state.commissionPercent}
          setCommissionPercent={setters.setCommissionPercent}
          taxRate={state.taxRate}
          setTaxRate={setters.setTaxRate}
          policyNotes={state.policyNotes}
          setPolicyNotes={setters.setPolicyNotes}
          informerName={state.informerName}
        />

        <AttachmentSection 
          submissionType={state.submissionType}
          filesData={state.filesData}
          setFilesData={setters.setFilesData}
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
    </div>
  );
}
