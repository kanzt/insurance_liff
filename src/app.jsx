import { useState, useEffect } from 'preact/hooks';
import liff from '@line/liff';
import { PolicyForm } from './components/PolicyForm';

export function App() {
  const [profile, setProfile] = useState(null);
  const [liffStatus, setLiffStatus] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const liffId = import.meta.env.VITE_LIFF_ID;
  const baseApiUrl = import.meta.env.VITE_API_BASE_URL;

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
      const response = await fetch(`${baseApiUrl}/verify-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

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
         <div class="text-sm bg-red-50 p-3 rounded-lg border border-red-100 mb-6 text-center shadow-inner text-red-600">
           {profile && `👤 เข้าสู่ระบบด้วย LINE: ${profile.displayName} `}<br/>
           <span class="font-semibold">❌ {error}</span>
         </div>
       );
    }
    
    if (profile) {
      if (liffStatus === 1) {
        return (
          <div class="text-sm text-brand-600 bg-brand-50 p-3 rounded-lg border border-brand-100 mb-6 text-center shadow-inner">
            👤 เข้าสู่ระบบด้วย LINE: <b>{profile.displayName}</b> <br/>
            <span class="text-orange-600 mt-1 block font-semibold">⏳ บัญชีของคุณอยู่ระหว่างรอแอดมินอนุมัติ</span>
          </div>
        );
      } else if (liffStatus === 3) {
        return (
          <div class="text-sm text-brand-600 bg-brand-50 p-3 rounded-lg border border-brand-100 mb-6 text-center shadow-inner">
            👤 เข้าสู่ระบบด้วย LINE: <b>{profile.displayName}</b> <br/>
            <span class="text-red-500 mt-1 block font-semibold">❌ ไม่มีสิทธิ์ใช้งานระบบ หรือยังไม่เคยลงทะเบียน</span>
          </div>
        );
      } else if (liffStatus === 2) {
        return (
          <div class="text-sm text-brand-600 bg-brand-50 p-3 rounded-lg border border-brand-100 mb-6 text-center shadow-inner">
             👤 เข้าสู่ระบบด้วย LINE: <b>{profile.displayName}</b>
          </div>
        );
      } else if (liffStatus !== null) {
        return (
          <div class="text-sm text-brand-600 bg-brand-50 p-3 rounded-lg border border-brand-100 mb-6 text-center shadow-inner">
            👤 เข้าสู่ระบบด้วย LINE: <b>{profile.displayName}</b> <br/>
            <span class="text-red-500 mt-1 block font-semibold">❌ ไม่สามารถใช้งานระบบได้ กรุณาติดต่อแอดมิน</span>
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div class="bg-white/90 backdrop-blur-xl border border-white/40 rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8">
      <h2 class="text-2xl font-bold mb-6 text-center">
        <span class="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-green-500">ส่งเอกสารเช็คเบี้ย</span>
        📄
      </h2>

      {renderProfileBox()}

      {!isLoading && !error && liffStatus === 2 && (
        <PolicyForm idToken={idToken} baseApiUrl={baseApiUrl} />
      )}
    </div>
  );
}
