import { useState, useEffect } from 'preact/hooks';
import liff from '@line/liff';
import { PolicyForm } from './components/PolicyForm';
import { authenticatedFetch } from './utils/api';

export function App() {
  const [profile, setProfile] = useState(null);
  const [liffStatus, setLiffStatus] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { title, message, onConfirm }
  const [galleryData, setGalleryData] = useState(null); // { urls: [], index: 0 }

  const liffId = import.meta.env.VITE_LIFF_ID;
  const baseApiUrl = import.meta.env.VITE_API_BASE_URL;

  // Handle keyboard navigation for the gallery
  useEffect(() => {
    if (!galleryData) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') setGalleryData(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryData]);

  const nextImage = () => {
    if (!galleryData) return;
    setGalleryData(prev => ({
      ...prev,
      index: (prev.index + 1) % prev.urls.length
    }));
  };

  const prevImage = () => {
    if (!galleryData) return;
    setGalleryData(prev => ({
      ...prev,
      index: (prev.index - 1 + prev.urls.length) % prev.urls.length
    }));
  };

  // Lock body scroll when gallery is open
  useEffect(() => {
    if (galleryData) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [galleryData]);

  useEffect(() => {
    async function init() {
      try {
        await liff.init({ liffId });

        if (liff.isLoggedIn()) {
          const userProfile = await liff.getProfile();
          setProfile(userProfile);

          const token = liff.getIDToken();
          setIdToken(token);

          await verifyAgentAccess(token, userProfile.displayName);
        } else {
          liff.login();
        }
      } catch (err) {
        console.error("LIFF Init Error:", err);
        setError("เชื่อมต่อ LINE ไม่สำเร็จ");
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  async function verifyAgentAccess(token, displayName) {
    try {
      const response = await authenticatedFetch(`${baseApiUrl}/verify-agent`, {
        method: 'POST',
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error(`ยืนยันตัวตนล้มเหลว (${response.status})`);
      }
      
      const data = await response.json();
      const status = data.result ? data.result.liffStatusId : null;
      setLiffStatus(status);
    } catch (err) {
      console.error("Error verifying agent:", err);
      setError("เชื่อมต่อระบบตรวจสอบสิทธิ์ขัดข้อง");
    }
  }

  // UI helpers handling the different login/verification states
  const renderProfileBox = () => {
    if (isLoading) {
      return <div class="text-sm text-brand-600 bg-brand-50 p-3 rounded-lg border border-brand-100 mb-6 text-center shadow-inner">กำลังเชื่อมต่อระบบ...</div>;
    }

    if (error) {
      return (
        <div class="bg-red-50 p-4 rounded-xl border border-red-100 mb-6 shadow-inner">
          <div class="flex items-center gap-1.5 text-red-600 mb-2">
            <span class="text-xl">⚠️</span>
            <span class="font-bold">&nbsp;เกิดข้อผิดพลาด</span>
          </div>
          <p class="text-sm text-red-500 mb-4">{error}</p>
          {profile && <div class="text-xs text-red-400 mt-2">👤 LINE: {profile.displayName}</div>}
        </div>
      );
    }

    if (profile) {
      if (liffStatus === 1) {
        return (
          <div class="text-sm text-brand-600 bg-brand-50 p-3 rounded-lg border border-brand-100 mb-6 text-center shadow-inner">
            👤&nbsp;เข้าสู่ระบบด้วย LINE:&nbsp;<b>{profile.displayName}</b> <br />
            <span class="text-orange-600 mt-1 block font-semibold">⏳&nbsp;บัญชีของคุณอยู่ระหว่างรอแอดมินอนุมัติ</span>
          </div>
        );
      } else if (liffStatus === 2) {
        return (
          <div class="text-sm text-brand-600 bg-brand-50 p-3 rounded-lg border border-brand-100 mb-6 text-center shadow-inner">
            👤&nbsp;เข้าสู่ระบบด้วย LINE:&nbsp;<b>{profile.displayName}</b>
          </div>
        );
      } else {
        return (
          <div class="text-sm text-brand-600 bg-brand-50 p-3 rounded-lg border border-brand-100 mb-6 text-center shadow-inner">
            👤&nbsp;เข้าสู่ระบบด้วย LINE:&nbsp;<b>{profile.displayName}</b> <br />
            <span class="text-red-500 mt-1 block font-semibold">❌&nbsp;ไม่มีสิทธิ์ใช้งานระบบ กรุณาติดต่อแอดมิน</span>
          </div>
        );
      }
    }

    return null;
  };

  return (
    <>
      <div class="bg-white/90 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8">
        <h2 class="text-2xl font-bold mb-6 text-center text-slate-800">
          ส่งเอกสารเช็คเบี้ย&nbsp;📄
        </h2>

        {renderProfileBox()}

        {!isLoading && !error && liffStatus === 2 && (
          <PolicyForm 
            idToken={idToken} 
            baseApiUrl={baseApiUrl} 
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
            setSuccessMessage={setSuccessMessage}
            setErrorMessage={setErrorMessage}
            setConfirmModal={setConfirmModal}
            onOpenGallery={(data) => setGalleryData(data)} 
          />
        )}
      </div>

      {/* Full-screen Loading Overlay */}
      {isSubmitting && (
        <div class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/60 backdrop-blur-md transition-all duration-300">
          <div class="relative flex items-center justify-center mb-6">
            <div class="absolute inset-0 bg-brand-500/20 rounded-full blur-2xl animate-pulse-slow"></div>
            <div class="w-20 h-20 border-4 border-brand-100 border-t-brand-500 rounded-full animate-spin"></div>
            <div class="absolute w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              <span class="text-2xl">⚡</span>
            </div>
          </div>
          <div class="text-center space-y-2">
            <h3 class="text-xl font-bold text-brand-800 animate-pulse">กำลังส่งข้อมูล...</h3>
            <p class="text-sm text-gray-500 max-w-[250px] mx-auto px-4">
              กรุณารอสักครู่ ระบบกำลังอัปโหลดเอกสารและประมวลผลข้อมูลกรมธรรม์ของคุณ
            </p>
          </div>
          <div class="mt-8 flex gap-1">
            <div class="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div class="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div class="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successMessage && (
        <div class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
            <div class="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
              ✅
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">{successMessage.title}</h3>
            <p class="text-slate-600 mb-6 whitespace-pre-line text-sm">{successMessage.description}</p>
            <button 
              type="button"
              onClick={() => setSuccessMessage(null)}
              class="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-green-500/30 active:scale-[0.98]"
            >
              ตกลง / กรอกรายการถัดไป
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorMessage && (
        <div class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
            <div class="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner border border-red-100">
              ❌
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">แจ้งเตือน</h3>
            <p class="text-slate-600 mb-6 text-sm">{errorMessage}</p>
            <button 
              type="button"
              onClick={() => setErrorMessage(null)}
              class="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-xl transition-all active:scale-[0.98] border border-slate-200"
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
            <div class="w-16 h-16 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner border border-brand-100">
              ♻️
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">{confirmModal.title}</h3>
            <p class="text-slate-600 mb-6 text-sm">{confirmModal.message}</p>
            <div class="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => setConfirmModal(null)}
                class="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-xl transition-all active:scale-[0.98] border border-slate-200"
              >
                ยกเลิก
              </button>
              <button 
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                class="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-brand-500/30 active:scale-[0.98]"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Image Gallery Modal */}
      {galleryData && (
        <div
          class="fixed inset-0 z-[1000] flex items-center justify-center bg-black p-0 transition-opacity animate-in fade-in duration-200 select-none"
          onClick={() => setGalleryData(null)}
        >
          {/* Close Symbol Close Button */}
          <span
            class="absolute top-4 right-6 text-white text-5xl font-bold cursor-pointer hover:text-gray-300 z-[1020] drop-shadow-md"
            onClick={() => setGalleryData(null)}
          >
            &times;
          </span>

          {/* Navigation Arrows */}
          {galleryData.urls.length > 1 && (
            <>
              <button
                type="button"
                class="absolute left-0 top-0 bottom-0 w-20 flex items-center justify-center text-white/50 hover:text-white transition-all z-[1010] bg-gradient-to-r from-black/50 to-transparent group"
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
              >
                <span class="text-6xl font-light transform group-active:scale-90 transition-transform">‹</span>
              </button>
              <button
                type="button"
                class="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-center text-white/50 hover:text-white transition-all z-[1010] bg-gradient-to-l from-black/50 to-transparent group"
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
              >
                <span class="text-6xl font-light transform group-active:scale-90 transition-transform">›</span>
              </button>

              {/* Counter Indicator */}
              <div class="absolute bottom-10 left-0 right-0 flex justify-center z-[1010]">
                <div class="bg-black/40 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-medium border border-white/20">
                  {galleryData.index + 1} / {galleryData.urls.length}
                </div>
              </div>
            </>
          )}

          {/* Modal Image */}
          <div class="w-full h-full flex items-center justify-center p-4">
            <img
              key={galleryData.urls[galleryData.index]} // Key forces re-render/animation on change
              src={galleryData.urls[galleryData.index]}
              alt={`Preview ${galleryData.index + 1}`}
              class="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
