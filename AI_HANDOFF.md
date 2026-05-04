# AI Handoff: Insurance LIFF Project Status (V4.6.0: Success Flow Enhancements)

## 📌 Project Overview
โปรเจกต์ระบบการยื่นคำขอเช็คเบี้ยประกันภัยผ่านแพลตฟอร์ม LINE LIFF App เวอร์ชัน V4.6.0 เน้นการขยายข้อมูลในส่วน "แจ้งงานสำเร็จ" (Success Flow) ให้ครอบคลุมด้านการเงินและช่องทางการชำระเงิน

---

### 1. Success Flow Enhancements (New!)
- **Financial Fields**: เพิ่มช่องกรอก `premium_amount` (เบี้ยประกันตามใบเสนอราคา) และ `actual_paid` (ยอดโอนจริง) พร้อมระบบตรวจสอบค่าว่าง
- **Payment Methods Integration**: เพิ่ม Dropdown เลือกช่องทางการชำระเงินที่ดึงข้อมูลจาก API `/load-payment-methods` แบบ Searchable
- **UI Reordering**: จัดลำดับฟิลด์ในส่วนงานสำเร็จใหม่เพื่อให้สอดคล้องกับขั้นตอนการทำงานจริง (บริษัทประกัน -> ประเภทงาน -> การเงิน)

### 2. Searchable Dropdowns
- **SearchableSelect Component**: คอมโพเนนต์มาตรฐานสำหรับทุก Dropdown ในระบบ รองรับการค้นหาและ Highlight ข้อความ
- **Reporting Code Search**: ค้นหารหัสแจ้งงาน (Submit Agent) ได้ทันที

### 3. API & Persistence
- **fetchPaymentMethods**: เพิ่ม Helper ใน `api.js` สำหรับโหลดข้อมูลช่องทางชำระเงิน
- **Draft Persistence**: อัปเดตระบบ LocalStorage ให้บันทึกค่าเบี้ยและช่องทางชำระเงินอัตโนมัติ ป้องกันข้อมูลหาย

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
| `companyName` | `company_name` | ชื่อบริษัทประกัน |
| `premiumAmount` | `premium_amount` | ราคาเบี้ยประกัน (เฉพาะแจ้งงานสำเร็จ) |
| `paymentMethodId` | `payment_method_id` | ID ช่องทางการชำระเงิน (เฉพาะแจ้งงานสำเร็จ) |
| `actualPaid` | `actual_paid` | ยอดเงินที่โอนจริง (เฉพาะแจ้งงานสำเร็จ) |

---

## 🚀 Workflow สำหรับผู้รับช่วงต่อ

### การจัดการ API ใหม่
- **GET `/load-categories`**: ต้องส่งกลับข้อมูลในรูปแบบ `{"results": [{ "category_id": "xxx", "categoryName": "xxx" }]}`
- **POST `/submit-policy`**: เปลี่ยนการรับค่าจาก `sub_category_id` เป็น `category_id`

---
*Last Updated: 2026-05-04 (V4.6.0: Success Flow Enhancements)*
