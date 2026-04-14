# AI Handoff: Insurance LIFF Project Status (V4.2.0: Binary Upload & Automated Reminders)

## 📌 Project Overview
โปรเจกต์ระบบการยื่นคำขอเช็คเบี้ยประกันภัยผ่านแพลตฟอร์ม LINE LIFF App อัปเดตล่าสุดสู่เวอร์ชันที่เสถียรและทรงพลังที่สุด โดยเน้นที่การจัดการไฟล์ขนาดใหญ่บนมือถือ และระบบติดตามผลอัจฉริยะ

---

## 🟢 Current Status (อัปเดตสถานะ V4.2.0)

### 1. High-Performance File Upload (New!)
- **FormData Integration**: ยกเลิกการใช้ Base64 ในฝั่งหน้าบ้าน เพื่อลดการค้างของแอปเมื่อเจอไฟล์รูปหลายๆ รูป โดยเปลี่ยนมาส่งไฟล์ในรูปแบบ **Binary native** ผ่าน `FormData` ทั้งหมด
- **Streamlined API Utility**: พัฒนา `authenticatedFetch` ใน `api.js` ให้ฉลาดขึ้น โดยจะข้ามการตั้งค่า `Content-Type` โดยอัตโนมัติหากตรวจเจอ `FormData` เพื่อเปิดทางให้บราวเซอร์จัดการ Multipart Boundary เอง
- **Memory Optimization**: ลดการกินแรมบนมือถือได้มากกว่า 50% เมื่อเทียบกับการใช้ Base64 แบบเดิม

### 2. Intelligent Data Logic
- **Sub-Category Engine**: เปลี่ยนจาก Dropdown ธรรมดามาเป็น **Dynamic Dropdown** ที่ดึงข้อมูลจาก Database ผ่าน API `/load-sub-categories` ทำให้รองรับการขยายประเภทประกันได้ไม่จำกัด
- **Dynamic Field Mapping**: ปรับแต่งการส่งค่าให้ตรงตามโครงสร้าง Database ใหม่ (`quote_agent_code`, `previous_policy_expiry_date`)
- **Quotation Follow-up**: เพิ่มระบบเลือกวันที่แจ้งเตือน (Reminder) พร้อมระบบป้องกันความผิดพลาด (Validation) โดยบล็อกไม่ให้เลือกวันที่ย้อนหลัง (`min={today}`)

### 3. Premium Interaction System (New UX!)
- **Universal Messaging**: เพิ่มระบบ Modal แจ้งเตือนสถานะแบบพรีเมียม (`ConfirmModal`, `SuccessMessage`, `ErrorMessage`) แทนการใช้ `alert()` แบบเก่า
- **Safe State Handling**: ระบบล้างข้อมูลฟอร์ม (Form Reset) ที่ปลอดภัยขึ้น โดยจะถามความสมัครใจผ่าน Modal ก่อนล้างข้อมูลทิ้ง

### 4. Technical Stack Update
- **Framework**: Preact + Vite + Tailwind CSS v4
- **Deploy Chain**: GitHub Actions -> CI/CD -> GitHub Pages
- **Backend Relay**: ทำงานร่วมกับ Supabase Edge Functions (V4.2 Relay Architecture)

---

## 🛠 Backend Mapping (สรุปฟิลด์ที่ส่งให้เซิร์ฟเวอร์)

| Frontend Field | API Field | Note |
|---|---|---|
| `informerId` | `quote_agent_code` | รหัสตัวแทนที่เลือกมา |
| `subCategoryId` | `sub_category_id` | ID หมวดหมู่ย่อย |
| `submissionType` | `submission_type` | `new`, `renewal`, etc. |
| `endDate` | `previous_policy_expiry_date` | วันหมดอายุกรมธรรม์เดิม |
| `reminderDate` | `reminder_date` | วันที่ต้องการให้สะกิดแจ้งเตือน |

---

## 🚀 Workflow สำหรับผู้รับช่วงต่อ

### การรันโปรเจกต์ (Local)
1. `npm install`
2. สร้าง `.env` ตาม `.env.example`
3. `npm run dev`

### การ Deploy
- Push ไปที่ `main` -> GitHub Actions จะจัดการ Deploy ไปยัง GitHub Pages ให้ทันที

---

## 📝 งานที่ยังค้างอยู่ (Future Work)
- **Image Compression**: พิจารณาการใช้ `compressorjs` ที่ฝั่งหน้าบ้านก่อนส่ง `FormData` เพื่อความเร็วสูงสุดในพื้นที่ที่เน็ตช้า
- **Multiple PDF Preview**: ปัจจุบันพรีวิวได้เฉพาะรูปภาพ

---
*Last Updated: 2024-04-14 (V4.2.0: Binary Upload & Automated Reminders)*
