# AI Handoff: Insurance LIFF Project Status (V2: Modernized)

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

### 3. Resilience & Persistence (New! V3)
- **Session Recovery**: ระบบกู้คืนเซสชั่นอัจฉริยะที่จะทำการ `logout` และ `login` ให้อัตโนมัติหากพบว่า Token หมดอายุระหว่างการใช้งาน
- **Form State Persistence**: ใช้ `localStorage` เพื่อบันทึกข้อมูลที่ผู้ใช้พิมพ์ไว้ทั้งหมด (รวมถึงไฟล์ที่เลือกและเอเย่นต์ที่เลือก) เพื่อให้มั่นใจว่าข้อมูลไม่หายแม้แอปจะโหลดใหม่
- **Loop Breaker UI**: หากระบบกู้คืนอัตโนมัติไม่สำเร็จ จะแสดงหน้าจอ Error ที่ชัดเจนพร้อมปุ่ม **Manual Login** เพื่อป้องกันปัญหา Infinite Redirect Loop

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
*Last Updated: 2026-04-12 (V3: Persistence & Recovery)*
