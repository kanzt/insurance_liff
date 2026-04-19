# AI Handoff: Insurance LIFF Project Status (V4.3.0: Policy Selection & Workflow Optimization)

## 📌 Project Overview
โปรเจกต์ระบบการยื่นคำขอเช็คเบี้ยประกันภัยผ่านแพลตฟอร์ม LINE LIFF App เวอร์ชัน V4.3.0 เน้นการเพิ่มประสิทธิภาพในกระบวนการ "ส่งเอกสารเพิ่มเติม" (Additional Document Submission) โดยการนำระบบค้นหารายการเดิมเข้ามาช่วยเชื่อมโยงข้อมูล เพื่อความถูกต้องและรวดเร็วสูงสุด

---

## 🟢 Current Status (อัปเดตสถานะ V4.3.0)

### 1. Strategic Policy Selection (New Workflow!)
- **PolicySearch Component**: พัฒนาระบบค้นหาข้อมูลกรมธรรม์เดิมด้วย ทะเบียนรถ, ชื่อลูกค้า หรือ เลขที่รายการ แบบ Real-time
- **Auto-fill Intelligence**: เมื่อเลือกรายการเดิม ระบบจะดึงข้อมูล **ตัวแทน (Agent), หมวดหมู่ประกัน (Category), วันหมดอายุ (Expiry Date) และ วันที่ตั้งแจ้งเตือน (Reminder Date)** มาใส่ในฟอร์มให้อัตโนมัติ
- **Real API Integration**: เชื่อมต่อกับ Backend ผ่าน API `/load-policies` โดยตรง พร้อมระบบรักษาความปลอดภัยผ่าน ID Token

### 2. Smart Form Reorganization
- **Priority-First Layout**: ปรับให้ต้องเลือก "วัตถุประสงค์การแจ้งงาน" (ใหม่/ต่ออายุ/ส่งเพิ่ม) เป็นอันดับแรก เพื่อกำหนดพฤติกรรมของฟอร์มในลำดับถัดไป
- **Field Locking Logic**: หากเป็นการส่งเอกสารเพิ่มเติม ระบบจะ **ล็อค (Disable)** ฟิลด์ "ตัวแทนผู้แจ้งงาน" และ "หมวดหมู่ประกัน" ทันที เพื่อให้แน่ใจว่าเอกสารที่ส่งเพิ่มจะถูกผูกติดกับงานเดิมอย่างถูกต้อง

### 3. UI/UX Refinement
- **Clean Selection Dropdown**: ปรับดีไซน์รายการค้นหาให้เน้น "ทะเบียนรถ" และ "ชื่อลูกค้า" เป็นหลัก พร้อมแสดงวันหมดอายุในตำแหน่งที่อ่านง่าย
- **Optimized Feedback**: ลบข้อความแจ้งเตือนที่ซ้ำซ้อนออก เพื่อให้หน้าฟอร์มดูสะอาดและเป็นมืออาชีพ (Premium Aesthetics)

### 4. Backend Synchronization
- **Original Policy Mapping**: เพิ่มการส่ง field `original_policy_id` ไปยัง API เมื่อมีการเลือกงานเดิม
- **Enhanced Reminder Logic**: รองรับการระบุ `reminder_type` (Slug) เพื่อให้ Backend เลือกเทมเพลตข้อความแจ้งเตือนได้ตรงตามเจตนาเดิมของรายการนั้นๆ

---

## 🛠 Backend Mapping (สรุปฟิลด์ที่ส่งให้เซิร์ฟเวอร์)

| Frontend Field | API Field | Note |
|---|---|---|
| `informerId` | `quote_agent_code` | [Locked for Additional] รหัสตัวแทน |
| `subCategoryId` | `sub_category_id` | [Locked for Additional] ID หมวดหมู่ |
| `submissionType` | `submission_type` | `new`, `additional`, `renewal` |
| `selectedPolicy.id` | `original_policy_id` | **(New)** ID งานเดิมสำหรับเอกสารเพิ่มเติม |
| `endDate` | `previous_policy_expiry_date` | วันหมดอายุกรมธรรม์เดิม |
| `reminderType` | `reminder_type` | **(New)** Slug ของประเภทเทมเพลตแจ้งเตือน |

---

## 🚀 Workflow สำหรับผู้รับช่วงต่อ

### การรันโปรเจกต์ (Local)
1. `npm install`
2. ตรวจสอบ `.env` ว่า `VITE_API_BASE_URL` ชี้ไปยัง Supabase Edge Functions ที่ถูกต้อง
3. `npm run dev`

### การจัดการ API ใหม่
- **GET `/load-policies`**: ต้องส่งข้อมูลกลับเป็น Array ในฟีลด์ `results` ตามโครงสร้างที่กำหนดใน `PolicySearch.jsx`
- **POST `/submit-policy`**: ต้องรองรับ Parameter `original_policy_id` เพื่ออนุญาตให้มีการอัปเดตงานเดิม

---

## 📝 งานที่ยังค้างอยู่ (Future Work)
- **Global Search Indexing**: พัฒนาประสิทธิภาพการค้นหาในกรณีที่รายการ Policy มีจำนวนมหาศาล (Server-side Search)
- **Image Compression**: (ยกยอดมาจาก V4.2) การบีบอัดรูปก่อนส่งเพื่อความไวสูงสุด

---
*Last Updated: 2024-04-19 (V4.3.0: Policy Selection & Workflow Optimization)*
