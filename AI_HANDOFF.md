# AI Handoff: Insurance LIFF Project Status (V5.4.2: UI Refining)

## 📌 Project Overview
โปรเจกต์ระบบการยื่นคำขอเช็คเบี้ยประกันภัยผ่านแพลตฟอร์ม LINE LIFF App เวอร์ชัน V4.6.0 เน้นการขยายข้อมูลในส่วน "แจ้งงานสำเร็จ" (Success Flow) ให้ครอบคลุมด้านการเงินและช่องทางการชำระเงิน

---

### 1. Success Flow Enhancements (New!)
- **Financial Fields**: เพิ่มช่องกรอก `premium_amount` (เบี้ยประกันตามใบเสนอราคา) และระบบเลือกโหมดระหว่าง `actual_paid` (ยอดโอนจริง) หรือ `installment_months` (ผ่อนชำระ)
- **Installment Support**: หากเลือกช่องทาง "ผ่อนเงินสด" ระบบจะแสดงช่องเลือกจำนวนงวด (1-12 เดือน) แทนช่องยอดโอนเงิน
- **Payment Methods Integration**: เพิ่ม Dropdown เลือกช่องทางการชำระเงินที่ดึงข้อมูลจาก API `/load-payment-methods` แบบ Searchable
- **Agent ID Refactor**: เปลี่ยนการส่งค่า `quote_agent_code` เป็น `quote_agent_id` และ `submit_agent_code` เป็น `submit_agent_id` เพื่อให้ตรงกับมาตรฐาน DB
- **UI Reordering**: จัดลำดับฟิลด์ในส่วนงานสำเร็จใหม่เพื่อให้สอดคล้องกับขั้นตอนการทำงานจริง (บริษัทประกัน -> ประเภทงาน -> การเงิน)

### 1. Submission Flow Refactor (New! V5.0.0 - V5.2.0)
- **New Endpoints**: 
  - `POST /submit-quotation`: สำหรับการขอใบเสนอราคาใหม่
  - `POST /update-quotation`: สำหรับการส่งเอกสารเพิ่มเติม (Additional Documents)
  - `GET /load-quotations`: สำหรับค้นหาประวัติงานเดิม
- **Payload Optimization**: ลดจำนวนฟิลด์ที่ส่งไปยัง Backend ให้เหลือเฉพาะข้อมูลพื้นฐานสำหรับการขอใบเสนอราคา (Minimal Payload) เพื่อรองรับการปรับปรุงระบบครั้งใหญ่

### 2. Reminder Restoration (New! V5.1.0)
- **Full Availability**: ปลดล็อกให้สามารถตั้งแจ้งเตือน (Reminder) ได้ในทุกรูปแบบการส่งงาน รวมถึง "แจ้งงานสำเร็จ" (Success Flow) เพื่อให้ตัวแทนสามารถตั้งการเตือนต่ออายุในปีถัดไปได้ทันที
- **UI Restoration**: แสดงส่วนวันหมดอายุประกันเดิมและเมนูการตั้งแจ้งเตือนกลับมาให้ใช้งานได้ปกติในทุกกรณี

### 3. Data Integrity & Validation (V4.8.0 - V5.3.0)
- **Additional Document Hardening**: เมื่อเลือกวัตถุประสงค์เป็น "ส่งเอกสารเพิ่ม" ระบบจะล็อกฟิลด์ "ชื่อผู้เอาประกัน" และ "ทะเบียนรถ" (Read-only) เพื่อป้องกันการแก้ไขข้อมูลที่ไม่ตรงกับรายการเดิมที่เลือกมา
- **Smart Field Locking**: 
  - ใช้ระบบ Dynamic Locking ที่ทำงานร่วมกับ `submissionType` เพื่อรักษาความถูกต้องของข้อมูล (Data Consistency) ตลอด Workflow
  - **Reminder UI Hiding (New!)**: เมื่อเลือกวัตถุประสงค์เป็น "แจ้งงานสำเร็จ" ระบบจะซ่อนส่วนการตั้งแจ้งเตือนไปเลย (Hide instead of Lock) เพื่อให้ UI กระชับและลดความซับซ้อนในขั้นตอนการขายที่จบไปแล้ว

### 3. Commission Tracking (New! V4.9.0)
- **Agent Commission**: เพิ่มช่องกรอก `commission_percent` ในส่วนงานสำเร็จ เพื่อระบุ % คอมมิชชันที่ตัวแทนผู้แจ้งงานจะได้รับ
- **Contextual Description**: แสดงชื่อตัวแทนในคำอธิบายฟิลด์เพื่อให้ผู้กรอกทราบชัดเจนว่าคอมมิชชันนี้เป็นของใคร

### 4. Searchable Dropdowns
- **SearchableSelect Component**: คอมโพเนนต์มาตรฐานสำหรับทุก Dropdown ในระบบ รองรับการค้นหาและHighlight ข้อความ
- **Reporting Code Search**: ค้นหารหัสแจ้งงาน (Submit Agent) ได้ทันที

### 4. API & Persistence
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
| `quotationId` | `quotation_id` | ID รายการเดิม (เฉพาะส่งเอกสารเพิ่ม) |
| `informerId` | `quote_agent_id` | รหัสตัวแทนผู้แจ้งงาน |
| `categoryId` | `category_id` | ID หมวดหมู่หลัก |
| `plate_number` | `plate_number` | ทะเบียนรถ |
| `customer_name` | `customer_name` | ชื่อผู้เอาประกัน |
| `endDate` | `previous_policy_expiry_date` | วันหมดอายุกรมธรรม์เดิม |
| `reminder_date` | `reminder_date` | วันที่ตั้งแจ้งเตือน |
| `reminder_type` | `reminder_type` | ประเภทการแจ้งเตือน |
| `notes` | `notes` | หมายเหตุ / ข้อมูลเพิ่มเติม |
| `files` | `files` | ไฟล์เอกสารแนบทั้งหมด |

> [!IMPORTANT]
> ฟิลด์อื่นๆ เช่น `product_id`, `submission_type`, และข้อมูลในส่วน "แจ้งงานสำเร็จ" ถูกระงับการส่งชั่วคราวเพื่อรอการ Refactor ใหญ่

---

## 🚀 Workflow สำหรับผู้รับช่วงต่อ

### การจัดการ API ใหม่
- **GET `/load-categories`**: ต้องส่งกลับข้อมูลในรูปแบบ `{"results": [{ "category_id": "xxx", "categoryName": "xxx" }]}`
- **GET `/load-quotations`**: ค้นหารายการใบเสนอราคาเดิม
- **POST `/submit-quotation`**: ส่งข้อมูลขอใบเสนอราคาใหม่
- **POST `/update-quotation`**: อัปเดตข้อมูล/ส่งเอกสารเพิ่ม (ต้องมี `quotation_id`)

---
*Last Updated: 2026-05-10 (V5.4.2: UI Refining)*
