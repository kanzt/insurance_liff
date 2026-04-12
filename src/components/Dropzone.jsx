import { useState, useRef } from 'preact/hooks';

export function Dropzone({ label, fileTypeIcon, onFilesChanged, multiple = false }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave' || e.type === 'drop') {
      setIsDragActive(false);
    }
  };

  const notifyChange = (newFiles) => {
    setFiles(newFiles);
    onFilesChanged(newFiles);
  };

  const handleDrop = (e) => {
    handleDrag(e);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const added = Array.from(e.dataTransfer.files);
      notifyChange(multiple ? [...files, ...added] : added);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const added = Array.from(e.target.files);
      notifyChange(multiple ? [...files, ...added] : added);
    }
  };

  const handlePaste = (e) => {
    if (!e.clipboardData) return;
    const items = e.clipboardData.items;
    const pastedFiles = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        pastedFiles.push(items[i].getAsFile());
      }
    }
    if (pastedFiles.length > 0) {
      notifyChange(multiple ? [...files, ...pastedFiles] : pastedFiles);
    }
  };

  const handleRemove = (index, e) => {
    e.stopPropagation();
    const newFiles = files.filter((_, i) => i !== index);
    notifyChange(newFiles);
  };

  return (
    <div class="space-y-3">
      <div
        tabIndex={0}
        class={`dropzone group relative p-4 border-2 border-dashed rounded-xl transition-all duration-300 focus:outline-none bg-white 
          ${isDragActive ? 'border-brand-500 bg-brand-50' : 'border-brand-200 hover:border-brand-500 hover:bg-brand-50/50 focus:border-brand-500 focus:ring-4 focus:ring-brand-100'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onPaste={handlePaste}
      >
        <label class="block text-xs font-bold text-gray-700 mb-2 cursor-pointer pointer-events-none">
          {fileTypeIcon} {label}
          <span class="font-normal text-brand-500 ml-1 hidden lg:inline">(คลิกที่นี่แล้วกด Ctrl+V เพื่อวางรูป)</span>
        </label>

        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,image/*"
          multiple={multiple}
          onChange={handleChange}
          class="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:font-semibold file:bg-brand-100 file:text-brand-700 hover:file:bg-brand-200 transition cursor-pointer"
        />

        {files.length > 0 && (
          <div class="preview-container mt-3 grid grid-cols-4 gap-2">
            {files.map((file, idx) => {
              const isImage = file.type.startsWith('image/');
              const objectUrl = isImage ? URL.createObjectURL(file) : null;

              return (
                <div key={idx} class="relative group rounded-md overflow-hidden bg-gray-100 border border-gray-200 aspect-square flex items-center justify-center">
                  <button
                    type="button"
                    onClick={(e) => handleRemove(idx, e)}
                    title="ลบไฟล์นี้"
                    class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs sm:opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-600 focus:outline-none shadow pointer-events-auto"
                  >
                    ✕
                  </button>
                  {isImage ? (
                    <img
                      src={objectUrl}
                      alt="preview"
                      onClick={() => setPreviewImageUrl(objectUrl)}
                      class="object-cover w-full h-full cursor-zoom-in hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div class="flex flex-col items-center p-1 w-full">
                      <span class="text-[10px] font-bold text-gray-500 truncate w-full px-1 text-center">{file.name}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImageUrl && (
        <div
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div class="relative max-w-full max-h-full">
            <button
              type="button"
              class="absolute -top-12 right-0 text-white text-3xl font-bold hover:text-gray-300 transition-colors"
              onClick={() => setPreviewImageUrl(null)}
            >
              ✕
            </button>
            <img
              src={previewImageUrl}
              alt="Full Preview"
              class="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
