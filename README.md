# 🛡️ Insurance LIFF: Document Submission System

ระบบแจ้งเช็คเบี้ยประกันภัยผ่าน LINE LIFF ที่ออกแบบมาเพื่อความรวดเร็วและใช้งานง่ายสำหรับตัวแทน พัฒนาด้วยเทคโนโลยีที่ทันสมัยที่สุดในปัจจุบัน

## 🚀 เทคโนโลยีที่ใช้
- **Frontend Framework**: [Preact](https://preactjs.com/) (Small, fast alternative to React)
- **Tooling**: [Vite](https://vitejs.dev/) (Next Generation Frontend Tooling)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (High-performance CSS framework)
- **Platform**: [LINE LIFF SDK](https://developers.line.biz/en/docs/liff/overview/)
- **Backend Service**: Supabase Edge Functions

## ✨ ฟีเจอร์หลัก
- **Agent Verification**: ระบบตรวจสอบสิทธิ์ตัวแทนอัตโนมัติก่อนเข้าใช้งาน
- **Searchable Agent Selection**: กล่องค้นหาตัวแทนอัจฉริยะ (กรองตามชื่อหรือรหัสตัวแทน)
- **Smart Upload**: รองรับการลากไฟล์วาง (Drag & Drop) และการกด Ctrl+V เพื่อวางรูปภาพ
- **Automatic Reminder**: คำนวณวันแจ้งเตือนล่วงหน้าให้อัตโนมัติ (60 วันก่อนประกันหมด)
- **Responsive Design**: พรีเมียมและสวยงาม รองรับทั้ง Mobile และ Desktop

## 🛠 การติดตั้ง (Installation)

1. **Clone project**
2. **ติดตั้ง Dependencies**
   ```bash
   npm install
   ```
3. **ตั้งค่าตัวแปรสภาพแวดล้อม (Environment Variables)**
   - คัดลอกไฟล์ `.env.example` ไปเป็น `.env`
   - ระบุ `VITE_LIFF_ID` และ `VITE_API_BASE_URL` ของคุณ

## 💻 คำสั่งสำหรับนักพัฒนา (Development)
- **รัน Server สำหรับพัฒนา**: `npm run dev` (มีระบบ Hot Reload แก้โค้ดแล้วเปลี่ยนทันที)
- **Build สำหรับ Production**: `npm run build` (ไฟล์จะถูกรวมและย่อขนาดไว้ในโฟลเดอร์ `dist/`)

## 📦 การ Deploy (Deployment)

โปรเจกต์นี้ได้รับการตั้งค่าให้ Deploy ไปที่ **GitHub Pages** โดยอัตโนมัติผ่าน GitHub Actions

### ขั้นตอนการเตรียมการบน GitHub:
1. ไปที่เมนู **Settings > Secrets and variables > Actions** และเพิ่มตัวแปรดังนี้:
   - `VITE_LIFF_ID`
   - `VITE_API_BASE_URL`
2. ไปที่เมนู **Settings > Pages** และเลือก Build and deployment source เป็น **GitHub Actions**

---
*จัดทำและพัฒนาโดยทีม Antigravity*
