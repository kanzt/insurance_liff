import { h } from 'preact';

export function PurposeSelector({ state, setters, actions, quotationTypes = [] }) {
  const { submissionType, quotationSubType } = state;
  const { setSubmissionType, setQuotationSubType, setCategoryId } = setters;
  const { handleReset } = actions;

  const defaultTypes = [
    { quotationTypeId: 'new', quotationTypeName: 'งานใหม่', icon: '✨' },
    { quotationTypeId: 'renewal', quotationTypeName: 'งานต่ออายุ', icon: '🔄' }
  ];

  const typesToRender = (quotationTypes && quotationTypes.length > 0)
    ? quotationTypes.map(t => ({
        ...t,
        icon: t.quotationTypeId === 'renewal' ? '🔄' : '✨'
      }))
    : defaultTypes;

  return (
    <div class="bg-brand-50/30 p-4 rounded-xl border border-brand-100/50 shadow-sm mb-6">
      <label class="block text-sm font-bold text-brand-800 mb-2">วัตถุประสงค์การแจ้งงาน <span class="text-red-500">*</span></label>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {[
          { id: 'quotation', label: '📄 เช็คเบี้ยประกัน / ส่งเอกสาร', desc: 'ยื่นเช็คเบี้ยหรือเพิ่มเอกสาร' },
          { id: 'success', label: '✅ แจ้งงานสำเร็จ', desc: 'แนบใบแจ้งงาน' }
        ].map((type) => (
          <label
            key={type.id}
            class={`flex flex-col p-3 rounded-xl border-2 transition-all cursor-pointer ${submissionType === type.id
              ? 'border-brand-500 bg-white shadow-md scale-[1.02]'
              : 'border-white bg-white/50 hover:border-brand-200 opacity-70'
              }`}
          >
            <input
              type="radio"
              name="submissionType"
              value={type.id}
              checked={submissionType === type.id}
              onChange={(e) => {
                const nextType = e.target.value;
                handleReset(false);
                setSubmissionType(nextType);
                if (nextType === 'quotation') {
                  setCategoryId('motor');
                  setQuotationSubType('new');
                }
              }}
              class="sr-only"
            />
            <span class="text-sm font-bold text-slate-700">{type.label}</span>
            <span class="text-[10px] text-gray-400 font-medium">{type.desc}</span>
          </label>
        ))}
      </div>

      {submissionType === 'quotation' && (
        <div class="mt-4 pt-3 border-t border-brand-100/60 animate-in fade-in slide-in-from-top-1 duration-300">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-brand-900 flex items-center gap-1.5">
              <span>ประเภทงาน</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-brand-100 text-brand-700 font-semibold">
                {quotationSubType === 'renewal' ? 'โหมดต่ออายุ' : 'โหมดงานใหม่'}
              </span>
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
            {typesToRender.map((type) => (
              <button
                key={type.quotationTypeId}
                type="button"
                onClick={() => {
                  if (actions && actions.handleQuotationSubTypeChange) {
                    actions.handleQuotationSubTypeChange(type.quotationTypeId);
                  } else {
                    setQuotationSubType(type.quotationTypeId);
                  }
                }}
                class={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  quotationSubType === type.quotationTypeId
                    ? 'bg-white text-brand-700 shadow-sm border border-brand-200/80 scale-[1.01]'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/40'
                }`}
              >
                <span>{type.icon} {type.quotationTypeName}</span>
              </button>

            ))}
          </div>
        </div>
      )}
    </div>
  );
}


