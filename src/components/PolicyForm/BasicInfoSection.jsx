import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { AgentSearch } from '../AgentSearch';
import { PolicySearch } from '../PolicySearch';
import { SearchableSelect } from '../SearchableSelect';
import { useVehicleData } from '../../hooks/useVehicleData';

export function BasicInfoSection({
  state,
  setters,
  actions,
  baseApiUrl,
  idToken,
  categories,
  uploadHistory
}) {
  const {
    submissionType, quotationSubType, isPlateTransfer, informerName, categoryId, referenceInput, isRedPlate, notes, duplicatePolicy,
    vehicleYear, vehicleMake, vehicleModel
  } = state;
  const {
    setInformerId, setInformerName, setCategoryId, setQuotationSubType, setReferenceInput, setIsRedPlate, setNotes, setDuplicatePolicy, setSubmissionType,
    setVehicleYear, setVehicleMake, setVehicleModel, setSelectedPolicy
  } = setters;

  const {
    years, makes, models,
    isLoadingYears, isLoadingMakes, isLoadingModels
  } = useVehicleData(baseApiUrl, vehicleYear, vehicleMake);

  const isMotor = categoryId === 'motor' || categoryId === '1';
  const isRenewal = submissionType === 'quotation' && quotationSubType === 'renewal';

  const handleResultsFetched = (results) => {
    if (submissionType !== 'quotation' || !referenceInput || referenceInput.length < 2 || isPlateTransfer) {
      setDuplicatePolicy(null);
      return;
    }

    if (results && results.length > 0) {
      const exactMatch = results.find(policy => {
        const plate = policy.plateNumber || policy.plate_number || '';
        const customer = policy.customerName || policy.customer_name || '';
        return plate.toLowerCase() === referenceInput.toLowerCase() || customer.toLowerCase() === referenceInput.toLowerCase();
      });

      if (exactMatch) {
        if (isRenewal) {
          // In renewal mode, exact match is the desired target policy
          setDuplicatePolicy(null);
          if (actions && actions.handleSelectPolicy && (!state.selectedPolicy || (state.selectedPolicy.id !== exactMatch.id && state.selectedPolicy.policy_id !== exactMatch.policy_id))) {
            actions.handleSelectPolicy(exactMatch);
          }
        } else {
          // In new quotation mode, flag as duplicate unless plate transfer is chosen
          setDuplicatePolicy(exactMatch);
          if (actions && actions.handleSelectPolicy && (!state.selectedPolicy || (state.selectedPolicy.id !== exactMatch.id && state.selectedPolicy.policy_id !== exactMatch.policy_id))) {
            actions.handleSelectPolicy(exactMatch);
          }
        }
      } else {
        setDuplicatePolicy(null);
      }
    } else {
      setDuplicatePolicy(null);
    }
  };

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
            disabled={submissionType === 'success'}
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
            disabled={submissionType === 'success'}
            value={categoryId}
            onChange={(e) => {
              const newCat = e.target.value;
              if (actions && actions.handleCategoryChange) {
                actions.handleCategoryChange(newCat);
              } else {
                setCategoryId(newCat);
              }
            }}
            class={`block w-full appearance-none rounded-xl border-gray-200 shadow-sm p-3 border transition-all text-sm
              ${(submissionType === 'success') ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500'}`}
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

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-4">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {isRenewal
              ? (isMotor ? 'ค้นหาทะเบียนรถที่ต้องการต่ออายุ' : 'ค้นหาชื่อผู้เอาประกันที่ต้องการต่ออายุ')
              : (isMotor
                ? (isRedPlate ? 'ชื่อผู้เอาประกัน (กรณีป้ายแดง)' : 'ทะเบียนรถ')
                : 'ชื่อผู้เอาประกัน')}
            <span class="text-red-500">*</span>
          </label>
          <PolicySearch
            baseApiUrl={baseApiUrl}
            idToken={idToken}
            searchMode={isRenewal ? 'policies' : 'quotations'}
            quotationTypeId={quotationSubType || 'new'}
            year={isRenewal ? '' : new Date().getFullYear().toString()}
            onSelectPolicy={(policy) => {
              if (actions && actions.handleSelectPolicy) {
                actions.handleSelectPolicy(policy);
              }
            }}
            onQueryChange={setReferenceInput}
            onResultsFetched={handleResultsFetched}
            initialQuery={referenceInput}
            uploadHistory={uploadHistory}
            placeholder={isRenewal
              ? (isMotor ? '🔍 ค้นหากรมธรรม์เดิมเพื่อต่ออายุ (เช่น 1กข-1234 กทม หรือ สมชาย)' : '🔍 ค้นหากรมธรรม์เดิม (เช่น สมชาย ใจดี)')
              : (isMotor
                ? (isRedPlate ? '🔍 ระบุชื่อลูกค้า' : '🔍 เช่น 1กข-1234 กทม')
                : '🔍 เช่น สมชาย ใจดี')}
          />


          {isRenewal && !state.selectedPolicy && referenceInput && referenceInput.length >= 2 && (
            <div class="mt-2.5 p-2.5 bg-brand-50/70 border border-brand-200/60 rounded-xl text-xs text-brand-800 flex items-center gap-2 animate-in fade-in duration-200">
              <span class="text-base">💡</span>
              <span>หากเป็นงานต่ออายุจากบริษัทอื่นหรือไม่พบข้อมูลเดิม สามารถระบุข้อมูลรถและแนบใบเตือนต่ออายุเพื่อส่งเช็คเบี้ยได้ทันที</span>
            </div>
          )}

          {isPlateTransfer && (
            <div class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between animate-in fade-in duration-300">
              <div class="flex items-center gap-2">
                <span class="text-xl">🚗✨</span>
                <div>
                  <div class="text-xs font-bold text-amber-900">โหมดสลับป้ายทะเบียนมาใส่รถคันใหม่</div>
                  <div class="text-[11px] text-amber-700">กรุณาระบุปี/ยี่ห้อ/รุ่นของรถคันใหม่ ระบบจะไม่ล็อกการเช็คเบี้ยซ้ำ</div>
                </div>
              </div>
              <button
                type="button"
                onClick={actions.handleCancelPlateTransfer}
                class="px-2.5 py-1.5 bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold transition-all shadow-xs"
              >
                ✕ ยกเลิก
              </button>
            </div>
          )}

          {state.selectedPolicy && !isPlateTransfer && (() => {
            const isQuotationRecord = state.selectedPolicy._recordType === 'quotation' || (Boolean(state.selectedPolicy.quotationId || state.selectedPolicy.quotation_id) && !state.selectedPolicy.policyId);
            const policyId = state.selectedPolicy.policyId;
            const quotationId = state.selectedPolicy.quotationId || state.selectedPolicy.quotation_id;

            return (
              <div class={`mt-3 p-3.5 border rounded-xl space-y-3 animate-in fade-in zoom-in-95 duration-300 ${
                isQuotationRecord 
                  ? 'bg-amber-50/90 border-amber-200/80' 
                  : 'bg-brand-50/90 border-brand-200/80'
              }`}>
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <div class={`p-2 bg-white rounded-full shadow-xs ${isQuotationRecord ? 'text-amber-600' : 'text-brand-600'}`}>
                      {isQuotationRecord ? (
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clip-rule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div class={`text-xs font-bold flex items-center gap-1.5 ${isQuotationRecord ? 'text-amber-900' : 'text-brand-900'}`}>
                        <span>
                          {isQuotationRecord
                            ? `📎 ส่งเอกสารเพิ่ม / แก้ไขเคสเช็คเบี้ยเดิม`
                            : (isRenewal ? '🔄 เชื่อมโยงกรมธรรม์เดิมเพื่อเปิดเคสต่ออายุ' : 'พบข้อมูลเดิมในระบบ')}
                        </span>
                        {policyId && (
                          <span class="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-semibold border border-teal-200">
                            🛡️ {policyId}
                          </span>
                        )}
                        {isQuotationRecord && quotationId && (
                          <span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                            📄 #{quotationId}
                          </span>
                        )}
                      </div>
                      <div class={`text-[11px] font-medium ${isQuotationRecord ? 'text-amber-700' : 'text-brand-700'}`}>
                        {state.selectedPolicy.plateNumber || state.selectedPolicy.plate_number || state.selectedPolicy.customerName || state.selectedPolicy.customer_name}
                        {state.selectedPolicy.companyName ? ` • 🏢 ${state.selectedPolicy.companyName}` : ''}
                        {state.selectedPolicy.productName ? ` (${state.selectedPolicy.productName})` : ''}
                      </div>
                    </div>
                  </div>


                <div class="flex items-center gap-1.5 shrink-0">
                  {(state.selectedPolicy.documentLink || state.selectedPolicy.document_link) && (
                    <a
                      href={state.selectedPolicy.documentLink || state.selectedPolicy.document_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-brand-700 active:scale-95 transition-all flex items-center gap-1"
                    >
                      <span>📂 ดูไฟล์เดิม</span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedPolicy(null)}
                    class="px-2 py-1.5 bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-lg text-xs font-medium transition-colors"
                    title="ล้างการเชื่อมโยงกรมธรรม์เดิม"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {submissionType === 'quotation' && (
                <div class="pt-2 border-t border-brand-200/60 flex flex-wrap items-center justify-between gap-2">
                  <span class="text-[11px] text-slate-600">หากลูกค้าสลับป้ายทะเบียนนี้ไปใส่รถคันอื่น:</span>
                  <button
                    type="button"
                    onClick={actions.handlePlateTransfer}
                    class="px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <span>🚗✨ สลับป้ายใส่คันใหม่</span>
                  </button>
                </div>
              )}
            </div>
          ); })()}



          {isMotor && submissionType !== 'success' && !state.selectedPolicy && !isPlateTransfer && (
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

      {isMotor && (
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              ปีรถ
            </label>
            <SearchableSelect
              options={years}
              value={vehicleYear}
              onSelect={(opt) => {
                setVehicleYear(opt ? opt.value : '');
                setVehicleMake('');
                setVehicleModel('');
              }}
              placeholder={isLoadingYears ? "กำลังโหลด..." : "ปีรถ"}
              disabled={isLoadingYears || submissionType === 'success'}
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              ยี่ห้อ
            </label>
            <SearchableSelect
              options={makes}
              value={vehicleMake}
              onSelect={(opt) => {
                setVehicleMake(opt ? opt.value : '');
                setVehicleModel('');
              }}
              placeholder={isLoadingMakes ? "กำลังโหลด..." : (vehicleYear ? "ยี่ห้อรถ" : "เลือกปีรถก่อน")}
              disabled={!vehicleYear || isLoadingMakes || submissionType === 'success'}
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              รุ่นรถ
            </label>
            <SearchableSelect
              options={models}
              value={vehicleModel}
              onSelect={(opt) => setVehicleModel(opt ? opt.value : '')}
              placeholder={isLoadingModels ? "กำลังโหลด..." : (vehicleMake ? "รุ่นรถ" : "เลือกยี่ห้อก่อน")}
              disabled={!vehicleMake || isLoadingModels || submissionType === 'success'}
            />
          </div>
        </div>
      )}

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

