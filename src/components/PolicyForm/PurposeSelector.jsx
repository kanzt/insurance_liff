import { h } from 'preact';

export function PurposeSelector({ state, setters, actions }) {
  const { submissionType } = state;
  const { setSubmissionType, setCategoryId } = setters;
  const { handleReset } = actions;
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
                }
              }}
              class="sr-only"
            />
            <span class="text-sm font-bold text-slate-700">{type.label}</span>
            <span class="text-[10px] text-gray-400 font-medium">{type.desc}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
