import { h } from 'preact';

export function ReminderSection({
  state,
  setters,
  actions,
  templates,
  formatThaiDate
}) {
  const {
    submissionType, endDate, enableReminder, reminderType, reminderDate, categoryId, isRedPlate, referenceInput
  } = state;
  const {
    setEndDate, setReminderType, setReminderDate
  } = setters;
  const { handleReminderToggle } = actions;

  return (
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">วันที่ประกันเดิมหมดอายุ (ถ้าทราบ)</label>
      <input
        type="date"
        value={endDate}
        onInput={(e) => setEndDate(e.target.value)}
        disabled={submissionType === 'success'}
        class={`block w-full rounded-xl border-gray-200 shadow-sm p-3 border transition-all text-sm appearance-none ${submissionType === 'success' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 cursor-pointer'}`}
      />

      {submissionType !== 'success' && (
        <div class="mt-3 bg-brand-50 border border-brand-100 rounded-lg p-3 animate-in fade-in slide-in-from-top-2 duration-500">
          <label class="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enableReminder}
              onChange={handleReminderToggle}
              class="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 cursor-pointer"
            />
            <span class="ml-2 text-sm font-medium text-brand-800">ตั้งแจ้งเตือน (Follow-up)</span>
          </label>

          {enableReminder && (
            <div class="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
              {/* ประเภทการแจ้งเตือน */}
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">ประเภทการแจ้งเตือน</label>
                <div class="grid grid-cols-1 gap-2">
                  {templates.length > 0 ? (
                    templates.map((t) => {
                      const isDisabled = t.slug === 'follow_case' && !endDate;
                      return (
                        <label
                          key={t.slug}
                          onClick={(e) => {
                            if (isDisabled) {
                              e.preventDefault();
                              return;
                            }
                          }}
                          class={`flex items-center p-2 rounded-xl border-2 transition-all ${isDisabled
                            ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-100'
                            : reminderType === t.slug
                              ? 'border-brand-500 bg-brand-100/50 shadow-sm cursor-pointer'
                              : 'border-gray-200 bg-white hover:border-brand-200 cursor-pointer'
                            }`}
                        >
                          <input
                            type="radio"
                            name="reminderType"
                            value={t.slug}
                            checked={reminderType === t.slug}
                            onChange={() => !isDisabled && setReminderType(t.slug)}
                            disabled={isDisabled}
                            class="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                          />
                          <div class="ml-3 flex flex-col">
                            <span class={`text-sm font-medium ${reminderType === t.slug && !isDisabled ? 'text-brand-800' : 'text-gray-600'}`}>
                              {t.title}
                            </span>
                            {isDisabled && (
                              <span class="text-[10px] text-red-500 font-normal italic">
                                * กรุณาระบุวันหมดอายุก่อนเลือก
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })
                  ) : (
                    <div class="text-xs text-gray-400 italic py-1 text-center bg-white/50 rounded-lg border border-dashed border-gray-200">
                      กำลังโหลดเทมเพลต...
                    </div>
                  )}
                </div>
              </div>

              {/* วันที่แจ้งเตือน */}
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">แจ้งเตือนกลับในวันที่</label>
                <input
                  type="date"
                  value={reminderDate}
                  onInput={(e) => setReminderDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  class="block w-full rounded-xl border-gray-200 shadow-sm p-3 text-sm border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 appearance-none cursor-pointer bg-white"
                />
              </div>

              {/* พรีวิวข้อความ */}
              <div class="bg-white/60 rounded-xl p-3 border border-brand-100 shadow-inner">
                <label class="block text-[10px] font-bold text-brand-400 mb-2 uppercase tracking-widest pl-1">Preview (LINE Message)</label>
                <div class="relative flex items-start">
                  <div class="w-8 h-8 rounded-full bg-brand-500 flex-shrink-0 flex items-center justify-center text-white text-xs shadow-sm">
                    Bot
                  </div>
                  <div class="ml-2 bg-white border border-gray-100 rounded-2xl rounded-tl-none p-3 shadow-md max-w-[85%]">
                    <p class="text-[13px] text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {(() => {
                        const template = templates.find(t => t.slug === reminderType);
                        if (!template) return 'เลือกประเภทการแจ้งเตือน...';

                        const dPlate = categoryId === '1' ? (isRedPlate ? 'ป้ายแดง' : (referenceInput || '')) : '';
                        const dCustomer = categoryId === '1' ? (isRedPlate ? (referenceInput || '') : '') : (referenceInput || '');

                        let finalPreview = template.body_template
                          .replace(/{{customer}}/g, dCustomer)
                          .replace(/{{plate}}/g, dPlate)
                          .replace(/{{previous_policy_expiry_date}}/g, formatThaiDate(endDate));

                        return finalPreview.replace(/\(\s*\)/g, '').replace(/\s+/g, ' ').trim();
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              <p class="text-[11px] text-gray-400 italic text-center">* ระบบจะส่งข้อความแจ้งเตือนที่เห็นนี้ไปหาคุณอัตโนมัติ</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
