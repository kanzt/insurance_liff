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
    submissionType, informerName, categoryId, referenceInput, isRedPlate, notes, duplicatePolicy,
    vehicleYear, vehicleMake, vehicleModel
  } = state;
  const {
    setInformerId, setInformerName, setCategoryId, setReferenceInput, setIsRedPlate, setNotes, setDuplicatePolicy, setSubmissionType,
    setVehicleYear, setVehicleMake, setVehicleModel, setSelectedPolicy
  } = setters;

  const {
    years, makes, models,
    isLoadingYears, isLoadingMakes, isLoadingModels
  } = useVehicleData(baseApiUrl, vehicleYear, vehicleMake);

  const isMotor = categoryId === 'motor' || categoryId === '1';

  const handleResultsFetched = (results) => {
    if (submissionType !== 'quotation' || !referenceInput || referenceInput.length < 2) {
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
        setDuplicatePolicy(exactMatch);
        // Auto-select if it's an exact match and user hasn't selected it yet
        if (actions && actions.handleSelectPolicy && (!state.selectedPolicy || (state.selectedPolicy.id !== exactMatch.id && state.selectedPolicy.policy_id !== exactMatch.policy_id))) {
          actions.handleSelectPolicy(exactMatch);
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
            {isMotor
              ? (isRedPlate ? 'ชื่อผู้เอาประกัน (กรณีป้ายแดง)' : 'ทะเบียนรถ')
              : 'ชื่อผู้เอาประกัน'}
            <span class="text-red-500">*</span>
          </label>
          <PolicySearch
            baseApiUrl={baseApiUrl}
            idToken={idToken}
            onSelectPolicy={(policy) => {
              if (actions && actions.handleSelectPolicy) {
                actions.handleSelectPolicy(policy);
              }
            }}
            onQueryChange={setReferenceInput}
            onResultsFetched={handleResultsFetched}
            initialQuery={referenceInput}
            uploadHistory={uploadHistory}
            placeholder={isMotor
              ? (isRedPlate ? '🔍 ระบุชื่อลูกค้า' : '🔍 เช่น 1กข-1234 กทม')
              : '🔍 เช่น สมชาย ใจดี'}
          />

          {state.selectedPolicy && (state.selectedPolicy.documentLink || state.selectedPolicy.document_link) && (
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
                href={state.selectedPolicy.documentLink || state.selectedPolicy.document_link}
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

          {isMotor && submissionType !== 'success' && !state.selectedPolicy && (
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
