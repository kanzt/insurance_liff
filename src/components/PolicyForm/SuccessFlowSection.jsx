import { h } from 'preact';
import { SearchableSelect } from '../SearchableSelect';

export function SuccessFlowSection({
  state,
  setters,
  companies,
  products,
  paymentMethods,
  allAgents,
  brokerChannels
}) {
  const {
    submissionType, policyStartDate, policyExpiryDate, companyId, productId,
    paymentMethodId, selectedPaymentMethod, premiumAmount, actualPaid,
    installmentMonths, submitAgentCode, brokerChannelId, commissionPercent,
    taxRate, policyNotes, informerName
  } = state;

  const {
    setPolicyStartDate, setPolicyExpiryDate, setCompanyId, setCompanyName,
    setProductId, setPaymentMethodId, setSelectedPaymentMethod,
    setPremiumAmount, setActualPaid, setInstallmentMonths, setSubmitAgentCode,
    setBrokerChannelId, setCommissionPercent, setTaxRate, setPolicyNotes
  } = setters;

  if (submissionType !== 'success') return null;

  const isCreditCard = selectedPaymentMethod?.paymentMethodName?.includes('ชำระบัตรเครดิต');
  const isInstallment = selectedPaymentMethod?.paymentMethodName?.includes('ผ่อนเงินสด');

  return (
    <div class="bg-white p-4 rounded-xl border-2 border-brand-500 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 mt-4 mb-6 ring-4 ring-brand-50">
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
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        class="block w-full appearance-none rounded-xl border-brand-200 shadow-sm p-3 border-2 focus:ring-4 focus:ring-brand-100 focus:border-brand-500 bg-white transition-all text-sm"
      >
        <option value="">-- เลือกประเภทงานที่ปิดการขายได้ --</option>
        <optgroup label="🚗 งานรถยนต์ (Motor)">
          {products
            .filter(sub => sub.categoryId?.toString() === '1')
            .map(sub => (
              <option key={sub.productId} value={sub.productId}>{sub.productName}</option>
            ))
          }
        </optgroup>
        <optgroup label="🛡️ งานประกันอื่นๆ (Non-Motor)">
          {products
            .filter(sub => sub.categoryId?.toString() === '2')
            .map(sub => (
              <option key={sub.productId} value={sub.productId}>{sub.productName}</option>
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

      <div class="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
        <div class="flex items-center justify-between mb-1">
          <label class="block text-sm font-bold text-brand-700">🪙 คอมมิชชันตัวแทน (%)</label>
          <div class="text-[10px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full border border-brand-100 font-bold">
            {commissionPercent || '0.00'}%
          </div>
        </div>
        <input
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={commissionPercent}
          onInput={(e) => setCommissionPercent(e.target.value)}
          placeholder="เช่น 15.00"
          class="block w-full rounded-xl border-brand-200 shadow-sm p-3 border-2 focus:ring-4 focus:ring-brand-100 focus:border-brand-500 bg-white transition-all text-sm"
        />
        <p class="mt-1.5 text-[10px] text-brand-500 font-medium flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          <span>% คอมมิชชันที่ {informerName || 'ตัวแทนผู้แจ้งงาน'} จะได้รับเมื่อปิดงานสำเร็จ</span>
        </p>
      </div>

      <div class="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
        <div class="flex items-center justify-between mb-1">
          <label class="block text-sm font-bold text-brand-700">📑 % หักภาษี (tax_rate)</label>
          <div class="text-[10px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full border border-brand-100 font-bold">
            {taxRate || '0.00'}%
          </div>
        </div>
        <input
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={taxRate}
          onInput={(e) => setTaxRate(e.target.value)}
          placeholder="เช่น 1.00 หรือ 3.00"
          class="block w-full rounded-xl border-brand-200 shadow-sm p-3 border-2 focus:ring-4 focus:ring-brand-100 focus:border-brand-500 bg-white transition-all text-sm"
        />
      </div>

      <div class="mt-4">
        <label class="block text-sm font-bold text-brand-700 mb-1">หมายเหตุ / ข้อมูลเพิ่มเติม</label>
        <textarea
          value={policyNotes}
          onInput={(e) => setPolicyNotes(e.target.value)}
          rows={2}
          placeholder="ระบุรายละเอียดเพิ่มเติม เช่น เลขกรมธรรม์ที่ออกใหม่ หรือข้อมูลสำหรับแอดมิน..."
          class="block w-full rounded-xl border-brand-200 shadow-sm p-3 border-2 focus:ring-4 focus:ring-brand-100 focus:border-brand-500 bg-white transition-all text-sm resize-none"
        />
      </div>
    </div>
  );
}
