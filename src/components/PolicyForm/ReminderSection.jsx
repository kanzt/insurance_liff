import { h } from 'preact';

export function ReminderSection({
  state,
  setters,
  actions,
  templates,
  formatThaiDate
}) {
  const {
    submissionType, quotationSubType, endDate, enableReminder, reminderType, reminderDate, categoryId, isRedPlate, referenceInput
  } = state;
  const {
    setEndDate, setReminderType, setReminderDate
  } = setters;
  const { handleReminderToggle, handleSetReminderPreset } = actions;

  return (
    <div>
      <div class="flex items-center justify-between mb-1">
        <label class="block text-sm font-medium text-gray-700">วันที่ประกันเดิมหมดอายุ (ถ้าทราบ)</label>
        {quotationSubType === 'renewal' && endDate && !enableReminder && (
          <button
            type="button"
            onClick={() => handleSetReminderPreset && handleSetReminderPreset(45)}
            class="text-[11px] text-brand-600 hover:text-brand-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>⏰ ตั้งเตือนล่วงหน้า 45 วัน</span>
          </button>
        )}
      </div>
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
                      const tId = t.templateId || t.slug;
                      const isDisabled = tId === 'follow_case' && !endDate;
                      return (
                        <label
                          key={tId}
                          onClick={(e) => {
                            if (isDisabled) {
                              e.preventDefault();
                              return;
                            }
                          }}
                          class={`flex items-center p-2 rounded-xl border-2 transition-all ${isDisabled
                            ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-100'
                            : reminderType === tId
                              ? 'border-brand-500 bg-brand-100/50 shadow-sm cursor-pointer'
                              : 'border-gray-200 bg-white hover:border-brand-200 cursor-pointer'
                            }`}
                        >
                          <input
                            type="radio"
                            name="reminderType"
                            value={tId}
                            checked={reminderType === tId}
                            onChange={() => !isDisabled && setReminderType(tId)}
                            disabled={isDisabled}
                            class="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                          />
                          <div class="ml-3 flex flex-col">
                            <span class={`text-sm font-medium ${reminderType === tId && !isDisabled ? 'text-brand-800' : 'text-gray-600'}`}>
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
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-xs font-semibold text-gray-600 uppercase tracking-wider">แจ้งเตือนกลับในวันที่</label>
                  {endDate && (
                    <span class="text-[10px] text-brand-600 font-medium">วันหมดอายุ: {formatThaiDate(endDate)}</span>
                  )}
                </div>
                <input
                  type="date"
                  value={reminderDate}
                  onInput={(e) => setReminderDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  class="block w-full rounded-xl border-gray-200 shadow-sm p-3 text-sm border focus:ring-2 focus:ring-brand-500 focus:border-brand-500 appearance-none cursor-pointer bg-white"
                />

                {quotationSubType === 'renewal' && endDate && (
                  <div class="mt-2 flex flex-wrap items-center gap-1.5">
                    <span class="text-[10px] text-gray-500 font-medium">ตั้งเตือนล่วงหน้า:</span>
                    {[
                      { days: 60, label: '60 วัน' },
                      { days: 45, label: '45 วัน (แนะนำ)', highlight: true },
                      { days: 30, label: '30 วัน' },
                      { days: 15, label: '15 วัน' }
                    ].map((preset) => (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={() => handleSetReminderPreset && handleSetReminderPreset(preset.days)}
                        class={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-all shadow-2xs ${
                          preset.highlight
                            ? 'bg-brand-50 hover:bg-brand-100 text-brand-700 border-brand-300'
                            : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                )}

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
                        const template = templates.find(t => (t.templateId || t.slug) === reminderType);
                        if (!template) return 'เลือกประเภทการแจ้งเตือน...';

                        const isMotor = categoryId === 'motor' || categoryId === '1';
                        const dPlate = isMotor ? (isRedPlate ? 'ป้ายแดง' : (referenceInput || '')) : '';
                        const dCustomer = isMotor ? (isRedPlate ? (referenceInput || '') : '') : (referenceInput || '');

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

