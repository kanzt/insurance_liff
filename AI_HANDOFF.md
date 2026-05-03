# AI Handoff: Insurance LIFF Project Status (V4.5.0: Searchable Dropdowns & API Refactoring)

## 📌 Project Overview
โปรเจกต์ระบบการยื่นคำขอเช็คเบี้ยประกันภัยผ่านแพลตฟอร์ม LINE LIFF App เวอร์ชัน V4.5.0 เน้นการเพิ่มประสิทธิภาพการใช้งานด้วย Searchable Dropdowns และการปรับปรุงโครงสร้างโค้ด API ให้เป็นระเบียบ

---

## 🟢 Current Status (อัปเดตสถานะ V4.5.0)

### 1. Searchable Dropdowns (New!)
- **SearchableSelect Component**: สร้างคอมโพเนนต์ใหม่สำหรับ Dropdown ที่สามารถพิมพ์ค้นหาได้ รองรับการกรองข้อมูลแบบ Real-time
- **Reporting Code Search**: ปรับปรุงส่วน "รหัสแจ้งงาน" ให้ค้นหาได้จากทั้งชื่อตัวแทนและรหัส
- **Insurance Company Search**: ปรับปรุงส่วน "บริษัทประกันภัย" ให้พิมพ์ค้นหาชื่อบริษัทได้ทันที

### 2. API Refactoring & Cleanup
- **Centralized API Helpers**: รวมการเรียก API ทั้งหมดไว้ที่ `src/utils/api.js` เพื่อความง่ายในการบำรุงรักษา
- **Endpoint Update**: เปลี่ยนเส้นทางโหลดบริษัทประกันเป็น `/load-insurance-companies` ตามโครงสร้างใหม่
- **Simplified Fetch**: ตัดพารามิเตอร์ `idToken` ออกจากฟังก์ชัน Helper เนื่องจาก `authenticatedFetch` ดึงจาก SDK ได้เองอัตโนมัติ

### 3. Stability & Fixes
- **State Restoration**: แก้ไขปัญหา ReferenceError ของ `selectedPolicy` และ `templates` ที่หายไปจากการ Refactor
- **Code Consistency**: ปรับคอมโพเนนต์ `AgentSearch` และ `PolicySearch` ให้ใช้ Helper Functions มาตรฐาน

### 2. UI/UX Synchronization
- **Agent Verification**: ระบบตรวจสอบสิทธิ์ตัวแทนอัตโนมัติก่อนเข้าใช้งาน
- **Policy Timeline Management**: เพิ่มการบันทึกวันเริ่มคุ้มครองและวันหมดอายุอัตโนมัติ (1 ปี) สำหรับงานที่แจ้งสำเร็จแล้ว
- **Closer Attribution**: เพิ่มระบบเลือกผู้ปิดการขาย (Submit Agent) สำหรับบันทึกผลงานตัวจริง
- **Company Selection Cache**: ระบบเลือกบริษัทประกันพร้อม Caching 24 ชั่วโมงเพื่อลดการเรียก API
- **PolicyForm Update**: ปรับปรุงส่วนการเลือกหมวดหมู่ให้รองรับข้อมูลใหม่ พร้อมระบบ Auto-fill ที่เชื่อมโยงกับ `category_id`
- **PolicySearch Support**: เพิ่มการรองรับการแสดงผลชื่อหมวดหมู่ผ่าน `categoryName`

---

## 🛠 Backend Mapping (สรุปฟิลด์ที่ส่งให้เซิร์ฟเวอร์)

| Frontend Field | API Field | Note |
|---|---|---|
| `informerId` | `quote_agent_code` | [Locked for Additional] รหัสตัวแทน |
| `categoryId` | `category_id` | **(Updated)** ID หมวดหมู่หลัก |
| `submissionType` | `submission_type` | `new`, `additional`, `renewal` |
| `selectedPolicy.id` | `original_policy_id` | ID งานเดิมสำหรับเอกสารเพิ่มเติม |
| `endDate` | `previous_policy_expiry_date` | วันหมดอายุกรมธรรม์เดิม |
| `reminderType` | `reminder_type` | Slug ของประเภทเทมเพลตแจ้งเตือน |
| `policyStartDate` | `policy_start_date` | วันเริ่มคุ้มครอง (เฉพาะแจ้งงานสำเร็จ) |
| `policyExpiryDate` | `policy_expiry_date` | วันหมดความคุ้มครอง (เฉพาะแจ้งงานสำเร็จ) |
| `submitAgentCode` | `submit_agent_code` | รหัสแจ้งงาน (เฉพาะแจ้งงานสำเร็จ) |
| `companyId` | `company_id` | ID บริษัทประกัน (เฉพาะแจ้งงานสำเร็จ) |
| `companyName` | `company_name` | ชื่อบริษัทประกัน (เฉพาะแจ้งงานสำเร็จ) |

---

## 🚀 Workflow สำหรับผู้รับช่วงต่อ

### การจัดการ API ใหม่
- **GET `/load-categories`**: ต้องส่งกลับข้อมูลในรูปแบบ `{"results": [{ "category_id": "xxx", "categoryName": "xxx" }]}`
- **POST `/submit-policy`**: เปลี่ยนการรับค่าจาก `sub_category_id` เป็น `category_id`

---
*Last Updated: 2026-05-03 (V4.5.0: Searchable Dropdowns & API Refactoring)*
