# 🛡️ Insurance LIFF: Document Submission System

ระบบแจ้งเช็คเบี้ยประกันภัยผ่าน LINE LIFF ที่ออกแบบมาเพื่อความรวดเร็วและใช้งานง่ายสำหรับตัวแทน พัฒนาด้วยเทคโนโลยีที่ทันสมัยที่สุดในปัจจุบัน

## 🚀 เทคโนโลยีที่ใช้
- **Frontend Framework**: [Preact](https://preactjs.com/) (Small, fast alternative to React)
- **Tooling**: [Vite](https://vitejs.dev/) (Next Generation Frontend Tooling)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (High-performance CSS framework)
- **Platform**: [LINE LIFF SDK](https://developers.line.biz/en/docs/liff/overview/)
- **Backend Service**: Supabase Edge Functions
*Last Updated: 2026-04-12 (V3.7.1: Power Gallery & Batch Flow)*

## ✨ ฟีเจอร์หลัก
- **Agent Verification**: ระบบตรวจสอบสิทธิ์ตัวแทนอัตโนมัติก่อนเข้าใช้งาน
- **Searchable Agent Selection**: กล่องค้นหาตัวแทนอัจฉริยะ (กรองตามชื่อหรือรหัสตัวแทน)
- **Smart Upload**: รองรับการลากไฟล์วาง (Drag & Drop) และการกด Ctrl+V เพื่อวางรูปภาพ
- **Automatic Reminder**: คำนวณวันแจ้งเตือนล่วงหน้าให้อัตโนมัติ (60 วันก่อนประกันหมด)
- **Form State Persistence**: บันทึกข้อมูลร่าง (Draft) อัตโนมัติ ป้องกันข้อมูลหายแม้แอปโหลดใหม่
- **Immersive Document Gallery**: ระบบดูรูปภาพเต็มหน้าจอระดับโปร พร้อมปุ่มเลื่อนดูภาพถัดไป/ย้อนกลับ และตัวเลขบอกลำดับภาพ (1/3)
- **Continuous Submission Flow**: รองรับการส่งงานหลายรายการต่อเนื่องโดยไม่ต้องโหลดหน้าเว็บใหม่
- **Responsive & Premium UI**: ดีไซน์ Glassmorphism ที่สวยงาม พร้อมโทนสี Slate ที่ดูเป็นมืออาชีพ รองรับทั้ง Mobile และ Desktop

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

### 3. Power Gallery & Batch Flow (New! V3.7.1)
- **Document Gallery**: เปลี่ยน Modal รูปภาพแบบเดิมเป็น Gallery เต็มตัว (Solid Black Backdrop) ที่สามารถกดเลื่อนดูเอกสารทั้งหมดในหมวดหมู่นั้นๆ ได้ทันที รองรับ Keyboard Navigation (Arrow Keys) และปุ่มปิด Esc
- **Batch Submission**: เมื่อส่งข้อมูลสำเร็จ ระบบจะล้างข้อมูลเฉพาะส่วนสำคัญ (เอกสาร, ทะเบียน) และพาคุณกลับไปจุดเริ่มต้นเพื่อแจ้งงานต่อทันที โดยยังคงรักษาข้อมูล "ตัวแทน" และ "ประเภทงาน" ไว้เพื่อความเร็ว
- **Manual Reset**: เพิ่มปุ่ม "ล้างข้อมูล" (Reset) ที่มาพร้อมระบบยืนยัน (Confirmation) เพื่อความยืดหยุ่นในการเคลียร์ฟอร์ม
- **Refined Aesthetics**: ปรับปรุงระยะห่างและสีสันใหม่ (Slate Theme) ให้ดูเป็นระเบียบและพรีเมียมมากขึ้น

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
