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
  const [loginRequired, setLoginRequired] = useState(false);
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

      if (response.status === 401 || response.status === 403) {
        setLoginRequired(true);
        setError("เซสชั่นหมดอายุหรือการยืนยันตัวตนล้มเหลว");
        return;
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
          <div class="flex items-center gap-2 text-red-600 mb-2">
            <span class="text-xl">⚠️</span>
            <span class="font-bold">เกิดข้อผิดพลาด</span>
          </div>
          <p class="text-sm text-red-500 mb-4">{error}</p>
          {loginRequired && (
            <button
              onClick={() => {
                if (!liff.isInClient()) liff.logout();
                liff.login();
              }}
              class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg"
            >
              🔑 ล็อกอินเข้าสู่ระบบใหม่
            </button>
          )}
          {profile && !loginRequired && <div class="text-xs text-red-400 mt-2">👤 LINE: {profile.displayName}</div>}
        </div>
      );
    }

    if (profile) {
      if (liffStatus === 1) {
        return (
          <div class="text-sm text-brand-600 bg-brand-50 p-3 rounded-lg border border-brand-100 mb-6 text-center shadow-inner">
            👤 เข้าสู่ระบบด้วย LINE: <b>{profile.displayName}</b> <br />
            <span class="text-orange-600 mt-1 block font-semibold">⏳ บัญชีของคุณอยู่ระหว่างรอแอดมินอนุมัติ</span>
          </div>
        );
      } else if (liffStatus === 2) {
        return (
          <div class="text-sm text-brand-600 bg-brand-50 p-3 rounded-lg border border-brand-100 mb-6 text-center shadow-inner">
            👤 เข้าสู่ระบบด้วย LINE: <b>{profile.displayName}</b>
          </div>
        );
      } else {
        return (
          <div class="text-sm text-brand-600 bg-brand-50 p-3 rounded-lg border border-brand-100 mb-6 text-center shadow-inner">
            👤 เข้าสู่ระบบด้วย LINE: <b>{profile.displayName}</b> <br />
            <span class="text-red-500 mt-1 block font-semibold">❌ ไม่มีสิทธิ์ใช้งานระบบ กรุณาติดต่อแอดมิน</span>
          </div>
        );
      }
    }

    return null;
  };

  return (
    <>
      <div class="bg-white/90 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8">
        <h2 class="text-2xl font-bold mb-6 text-center">
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-green-500">ส่งเอกสารเช็คเบี้ย</span>
          📄
        </h2>

        {renderProfileBox()}

        {!isLoading && !error && liffStatus === 2 && (
          <PolicyForm idToken={idToken} baseApiUrl={baseApiUrl} onOpenGallery={(data) => setGalleryData(data)} />
        )}
      </div>

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
