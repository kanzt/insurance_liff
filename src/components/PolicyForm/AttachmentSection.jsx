import { h } from 'preact';
import { Dropzone } from '../Dropzone';

export function AttachmentSection({
  state,
  setters,
  onOpenGallery
}) {
  const { submissionType, quotationSubType, filesData } = state;
  const { setFilesData } = setters;

  const isRenewal = submissionType === 'quotation' && quotationSubType === 'renewal';

  return (
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="block text-sm font-medium text-gray-700">
          แนบเอกสารตามประเภท {(submissionType === 'additional' || submissionType === 'success') ? <span class="text-xs text-gray-400 font-normal">(ถ้ามี)</span> : <span class="text-red-500">*</span>}
          {!(submissionType === 'additional' || submissionType === 'success') && <span class="text-xs text-gray-400 font-normal"> (แนบอย่างน้อย 1 ช่อง)</span>}
        </label>
        {isRenewal && (
          <span class="text-[11px] font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full animate-in fade-in duration-200">
            🔄 เรียงตามความสำคัญของงานต่ออายุ
          </span>
        )}
      </div>

      <div class="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-inner">
        {isRenewal ? (
          <>
            <Dropzone
              label="1. เบี้ยต่ออายุ / ใบเตือนต่ออายุ (แนะนำสำหรับงานต่ออายุ)"
              fileTypeIcon="🔄"
              initialFiles={filesData.renewalNotice}
              onFilesChanged={(files) => setFilesData({ ...filesData, renewalNotice: files })}
              onOpenGallery={onOpenGallery}
            />
            <Dropzone
              label="2. กรมธรรม์เดิม (แนะนำสำหรับงานต่ออายุ)"
              fileTypeIcon="🛡️"
              initialFiles={filesData.oldPolicy}
              onFilesChanged={(files) => setFilesData({ ...filesData, oldPolicy: files })}
              onOpenGallery={onOpenGallery}
            />
            <Dropzone
              label="3. หน้ารายการจดทะเบียน / สำเนารถ"
              fileTypeIcon="📑"
              initialFiles={filesData.registration}
              onFilesChanged={(files) => setFilesData({ ...filesData, registration: files })}
              onOpenGallery={onOpenGallery}
            />
            <Dropzone
              label="4. ใบเสนอราคา"
              fileTypeIcon="💰"
              initialFiles={filesData.quotation}
              onFilesChanged={(files) => setFilesData({ ...filesData, quotation: files })}
              onOpenGallery={onOpenGallery}
            />
            <Dropzone
              label="5. ใบเสนอราคาคู่แข่ง"
              fileTypeIcon="🏢"
              initialFiles={filesData.compQuotation}
              onFilesChanged={(files) => setFilesData({ ...filesData, compQuotation: files })}
              onOpenGallery={onOpenGallery}
            />
            <Dropzone
              label="6. เอกสารอื่นๆ (แนบได้หลายไฟล์)"
              fileTypeIcon="📎"
              initialFiles={filesData.others}
              multiple={true}
              onFilesChanged={(files) => setFilesData({ ...filesData, others: files })}
              onOpenGallery={onOpenGallery}
            />
          </>
        ) : (
          <>
            <Dropzone
              label="1. หน้ารายการจดทะเบียน / สำเนารถ"
              fileTypeIcon="📑"
              initialFiles={filesData.registration}
              onFilesChanged={(files) => setFilesData({ ...filesData, registration: files })}
              onOpenGallery={onOpenGallery}
            />
            <Dropzone
              label="2. กรมธรรม์เดิม"
              fileTypeIcon="🛡️"
              initialFiles={filesData.oldPolicy}
              onFilesChanged={(files) => setFilesData({ ...filesData, oldPolicy: files })}
              onOpenGallery={onOpenGallery}
            />
            <Dropzone
              label="3. ใบเสนอราคา"
              fileTypeIcon="💰"
              initialFiles={filesData.quotation}
              onFilesChanged={(files) => setFilesData({ ...filesData, quotation: files })}
              onOpenGallery={onOpenGallery}
            />
            <Dropzone
              label="4. ใบเสนอราคาคู่แข่ง"
              fileTypeIcon="🏢"
              initialFiles={filesData.compQuotation}
              onFilesChanged={(files) => setFilesData({ ...filesData, compQuotation: files })}
              onOpenGallery={onOpenGallery}
            />
            <Dropzone
              label="5. เบี้ยต่ออายุ / ใบเตือนต่ออายุ"
              fileTypeIcon="🔄"
              initialFiles={filesData.renewalNotice}
              onFilesChanged={(files) => setFilesData({ ...filesData, renewalNotice: files })}
              onOpenGallery={onOpenGallery}
            />
            {submissionType === 'success' && (
              <Dropzone
                label="6. ใบแจ้งงาน"
                fileTypeIcon="📝"
                initialFiles={filesData.workOrder}
                onFilesChanged={(files) => setFilesData({ ...filesData, workOrder: files })}
                onOpenGallery={onOpenGallery}
              />
            )}
            <Dropzone
              label={submissionType === 'success' ? "7. เอกสารอื่นๆ (แนบได้หลายไฟล์)" : "6. เอกสารอื่นๆ (แนบได้หลายไฟล์)"}
              fileTypeIcon="📎"
              initialFiles={filesData.others}
              multiple={true}
              onFilesChanged={(files) => setFilesData({ ...filesData, others: files })}
              onOpenGallery={onOpenGallery}
            />
          </>
        )}
      </div>
    </div>
  );
}

