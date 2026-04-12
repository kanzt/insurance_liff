# 🛡️ Insurance LIFF: Document Submission System

ระบบแจ้งเช็คเบี้ยประกันภัยผ่าน LINE LIFF ที่ออกแบบมาเพื่อความรวดเร็วและใช้งานง่ายสำหรับตัวแทน พัฒนาด้วยเทคโนโลยีที่ทันสมัยที่สุดในปัจจุบัน

## 🚀 เทคโนโลยีที่ใช้
- **Frontend Framework**: [Preact](https://preactjs.com/) (Small, fast alternative to React)
- **Tooling**: [Vite](https://vitejs.dev/) (Next Generation Frontend Tooling)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (High-performance CSS framework)
- **Platform**: [LINE LIFF SDK](https://developers.line.biz/en/docs/liff/overview/)
- **Backend Service**: Supabase Edge Functions
*Last Updated: 2026-04-12 (V3: Persistence & Recovery)*

## ✨ ฟีเจอร์หลัก
- **Agent Verification**: ระบบตรวจสอบสิทธิ์ตัวแทนอัตโนมัติก่อนเข้าใช้งาน
- **Searchable Agent Selection**: กล่องค้นหาตัวแทนอัจฉริยะ (กรองตามชื่อหรือรหัสตัวแทน)
- **Smart Upload**: รองรับการลากไฟล์วาง (Drag & Drop) และการกด Ctrl+V เพื่อวางรูปภาพ
- **Automatic Reminder**: คำนวณวันแจ้งเตือนล่วงหน้าให้อัตโนมัติ (60 วันก่อนประกันหมด)
- **Session Recovery & Auto-save**: ป้องกันข้อมูลหายด้วยระบบบันทึกร่าง (Draft) อัตโนมัติและระบบกู้คืนเซสชั่นเมื่อ Token หมดอายุ
- **Responsive Design**: พรีเมียมและสวยงาม รองรับทั้ง Mobile และ Desktop

## 🛠 การติดตั้ง (Installation)

1. **Clone project**
2. **ติดตั้ง Dependencies**
   ```bash
   npm install
   ```
   *(แนะนำให้ใช้ **Node.js 24** ขึ้นไปสำหรับระบบการ Deploy ล่าสุด)*
3. **ตั้งค่าตัวแปรสภาพแวดล้อม (Environment Variables)**
   - คัดลอกไฟล์ `.env.example` ไปเป็น `.env`
   - ระบุ `VITE_LIFF_ID` และ `VITE_API_BASE_URL` ของคุณ

## 💻 คำสั่งสำหรับนักพัฒนา (Development)
- **รัน Server สำหรับพัฒนา**: `npm run dev` (มีระบบ Hot Reload แก้โค้ดแล้วเปลี่ยนทันที)
- **Build สำหรับ Production**: `npm run build` (ไฟล์จะถูกรวมและย่อขนาดไว้ในโฟลเดอร์ `dist/`)

### 3. Resilience & Persistence (New! V3)
- **Session Recovery**: ระบบกู้คืนเซสชั่นอัจฉริยะที่จะทำการ `logout` และ `login` ให้อัตโนมัติหากพบว่า Token หมดอายุระหว่างการใช้งาน
- **Form State Persistence**: ใช้ `localStorage` เพื่อบันทึกข้อมูลที่ผู้ใช้พิมพ์ไว้ทั้งหมด (รวมถึงไฟล์ที่เลือกและเอเย่นต์ที่เลือก) เพื่อให้มั่นใจว่าข้อมูลไม่หายแม้แอปจะโหลดใหม่
- **Loop Breaker UI**: หากระบบกู้คืนอัตโนมัติไม่สำเร็จ จะแสดงหน้าจอ Error ที่ชัดเจนพร้อมปุ่ม **Manual Login** เพื่อป้องกันปัญหา Infinite Redirect Loop

### 4. Automated CI/CD
- **GitHub Actions**: ตั้งค่าไฟล์ `.github/workflows/deploy.yml` ไว้สำหรับการ Deploy ไปที่ GitHub Pages โดยอัตโนมัติเมื่อมีการ Push ไปที่ Branch `main`
- **Base Path**: ตั้งค่า `base: '/insurance_liff/'` ใน `vite.config.js` เพื่อให้รองรับการรันใน Subdirectory ของ GitHub Pages

## 📦 การ Deploy (Deployment)

โปรเจกต์นี้ได้รับการตั้งค่าให้ Deploy ไปที่ **GitHub Pages** โดยอัตโนมัติผ่าน GitHub Actions

### ขั้นตอนการเตรียมการบน GitHub:
1. ไปที่เมนู **Settings > Secrets and variables > Actions** และเพิ่มตัวแปรดังนี้:
   - `VITE_LIFF_ID`
   - `VITE_API_BASE_URL`
2. ไปที่เมนู **Settings > Pages** และเลือก Build and deployment source เป็น **GitHub Actions**

---
*จัดทำและพัฒนาโดยทีม Antigravity*
