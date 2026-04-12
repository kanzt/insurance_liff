# AI Handoff: Insurance LIFF Project Status (V3.8.0: Red Plate Support)

## 📌 Project Overview
โปรเจกต์ระบบการยื่นคำขอเช็คเบี้ยประกันภัยผ่านแพลตฟอร์ม LINE LIFF App ได้รับการอัปเกรดครั้งใหญ่จากระบบ HTML ไฟล์เดียว ไปสู่โครงสร้าง **Modern Frontend Architecture** โดยใช้ **Vite + Preact** เพื่อความปลอดภัย ความเร็วในการโหลด และการดูแลรักษาโค้ดในระยะยาว

## 🟢 Current Status (อัปเดตสถานะปัจจุบัน)

### 1. Architecture & Security (New!)
- **Framework**: เปลี่ยนมาใช้ [Preact](https://preactjs.com/) (ขนาดจิ๋วแต่ทรงพลัง) ร่วมกับ [Vite](https://vitejs.dev/)
- **Environment Variables**: ย้ายค่าคอนฟิกสำคัญ (`LIFF_ID`, `API_URL`) ออกจากโค้ดไปไว้ในไฟล์ **`.env`** โดยใช้ `VITE_` Prefix
- **Security Check**: อัปเดต `.gitignore` เพื่อป้องกันการเผลอ Push ไฟล์ `.env` ขึ้น Git และสร้าง `.env.example` ไว้ให้แล้ว

### 2. UI/UX Enhancements
- **Tailwind CSS v4**: อัปเกรดเป็นเวอร์ชันล่าสุด โดยทำการ Build ทรัพยากรทั้งหมดให้เล็กลง (Bundle size < 6KB zipped)
- **Glassmorphism Design**: คงสไตล์ที่หรูหราด้วย `backdrop-blur` และสีแบรนด์ `#178F46`
- **Agent Search Combobox**: เปลี่ยนจาก Dropdown ธรรมดาเป็น **Searchable Combobox** ที่ค้นหาได้ทั้งชื่อและรหัสตัวแทน พร้อมระบบ Highlight ข้อความที่ค้นหา
- **Dropzone Component**: รวมศูนย์ Logic การอัปโหลดไฟล์ไว้ที่ Component เดียวกัน รองรับการ Drag & Drop และการกด Ctrl+V เพื่อวางรูปภาพ

### 3. Power Gallery & Batch Flow (New! V3.8.0)
- **Document Gallery Architecture**: ย้ายการจัดการ Modal ขึ้นไปที่ระดับ Root (`App.jsx`) เพื่อแก้ปัญหา Stacking Context และ Backdrop-blur รองรับการแสดงผลแบบ Gallery เต็มหน้าจอ (Solid Black Background) พร้อมระบบนำทาง (Next/Prev)
- **State-based Reset Flow**: เมื่อส่งงานสำเร็จ ระบบจะเรียก `handleReset(false)` เพื่อเคลียร์ข้อมูลเฉพาะ Job-specific data แต่ยังคง Agent context ไว้เพื่อช่วยให้ตัวแทนส่งงานชุด (Batch) ได้รวดเร็วขึ้น
- **Smart Red-Plate Logic**: เพิ่มฟีเจอร์ "รถป้ายแดง" เพื่อรักษา Data Integrity โดยระบบจะส่ง `plate_number = "ป้ายแดง"` (Const) และนำค่าที่ผู้ใช้กรอก (ชื่อ/เลขตัวถัง) ไปเก็บไว้ที่คอลัมน์ `customer_name` แทน เพื่อป้องกันข้อมูลปนกันในฐานข้อมูล
- **Form Resilience**: ย้ายการบันทึก Draft ไปที่ `useEffect` ชุดเดียวที่เฝ้าสังเกต State หลักทั้งหมด และเพิ่มระบบ Confirmation ก่อนล้างข้อมูลด้วยปุ่ม Reset
- **UI Optimization**: ปรับโทนสีจาก Gradient เป็น Elegant Slate และจัดการช่องว่าง (JSX Whitespace) ด้วย `&nbsp;` เพื่อความเป๊ะของการแสดงผลบนทุก Device

### 4. Automated CI/CD
- **GitHub Actions**: ตั้งค่าไฟล์ `.github/workflows/deploy.yml` ไว้สำหรับการ Deploy ไปที่ GitHub Pages โดยอัตโนมัติเมื่อมีการ Push ไปที่ Branch `main`
- **Base Path**: ตั้งค่า `base: '/insurance_liff/'` ใน `vite.config.js` เพื่อให้รองรับการรันใน Subdirectory ของ GitHub Pages

---

## 🛠 Backend Status (ความคืบหน้าฝั่งเซิร์ฟเวอร์)

โปรเจกต์นี้ทำงานร่วมกับ Supabase Edge Functions:
1. **Endpoint: `/verify-agent` (POST)**: ตรวจสอบสิทธิ์โดยใช้ `Authorization: Bearer <idToken>`
2. **Endpoint: `/load-agents` (GET)**: คืนค่ารายชื่อตัวแทนในรูปแบบ `{ results: [...] }`
3. **Endpoint: `/submit-policy` (POST)**: รับ Payload สำหรับบันทึกข้อมูลและไฟล์รูปภาพ

---

## 🚀 Workflow สำหรับผู้รับช่วงต่อ

### การรันโปรเจกต์ (Local Development)
1. `npm install` (แนะนำให้ใช้ **Node.js 24**)
2. สร้างไฟล์ `.env` ตามตัวอย่างใน `.env.example`
3. `npm run dev`

### การ Deploy (Production)
1. **GitHub Secrets**: อย่าลืมเพิ่มตัวแปร `VITE_LIFF_ID` และ `VITE_API_BASE_URL` ใน Repository Secrets บน GitHub
2. **GitHub Pages settings**: ตั้งค่า Build Source ให้เป็น **GitHub Actions**

## 📝 งานที่ยังค้างอยู่ (Future Work)
- **Notification Engine**: การตั้งค่า `pg_cron` ใน Supabase เพื่อส่ง LINE Push Message แจ้งเตือนในวันที่ `reminder_date` (ตามแผนเดิมใน V1)
- **PDF Preview**: หากมีการอัปโหลดไฟล์ PDF อาจพิจารณาเพิ่มตัว Preview เล็กๆ ใน Dropzone (ปัจจุบันพรีวิวเฉพาะรูปภาพ)

---
*Last Updated: 2026-04-12 (V3.8.0: Batch Flow & Red Plate Support)*
