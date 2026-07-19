# AI Handoff: Insurance LIFF Project Status (V6.1.0: Non-blocking UI & Structural Refactoring)

## 📌 Project Overview
โปรเจกต์ระบบการยื่นคำขอเช็คเบี้ยประกันภัยผ่านแพลตฟอร์ม LINE LIFF App เวอร์ชัน V6.0.0 เน้นการปรับปรุงโครงสร้างโค้ด (Refactoring) โดยแยกส่วน `PolicyForm.jsx` ออกเป็น Hooks และ Components ย่อย เพื่อความง่ายในการดูแลรักษาและรองรับการขยายตัวในอนาคต

---

### 🌟 0. Structural Component Refactoring (New! V6.0.0)
- **Logic Extraction (Custom Hooks)**: ดึง Logic ที่ซับซ้อนใน `PolicyForm.jsx` ออกมาเป็น 3 Hooks หลัก:
  - `useReferenceData`: จัดการการดึงข้อมูล Master Data ทั้งหมดผ่าน API (Categories, Products, Agents, Companies)
  - `usePolicyFormState`: จัดการ State ของฟอร์ม, การเชื่อมต่อ LocalStorage (Draft), และฟังก์ชัน Reset
  - `usePolicySubmit`: จัดการการสร้าง `FormData` และการยิง API `submitPolicy` ตามประเภทการทำรายการ (New, Additional, Success)
- **UI Component Splitting**: แยกส่วน UI ที่ยาวมากใน `PolicyForm.jsx` ออกเป็น Component ย่อยตาม Section:
  - `PurposeSelector`, `PolicySearchSection`, `BasicInfoSection`, `ReminderSection`, `SuccessFlowSection`, `AttachmentSection`
- **Main Component Cleanup**: `PolicyForm.jsx` เปลี่ยนหน้าที่เป็นเพียง Orchestrator ที่เรียกใช้ Hooks และ Render UI Components เท่านั้น
  - **Prop Reduction**: ลดความซ้ำซ้อนของการส่ง Props โดยส่ง `state`, `setters`, และ `actions` เป็น Object เข้าไปใน Component ย่อยแทนการส่งตัวแปรเดี่ยวแยกบรรทัด ทำให้โค้ดฝั่ง Render สะอาดและอ่านง่ายขึ้นมาก

---

### 1. Non-blocking UI Upload (New! V6.1.0)
- **Background Processing**: ย้ายกระบวนการบีบอัดรูปภาพและยิง API อัปโหลดข้อมูล (`doBackgroundSubmit`) ไปรันเบื้องหลัง (Background) เพื่อไม่ให้บล็อคการทำงานของ UI
- **Instant Form Reset**: เมื่อกดปุ่ม "ยืนยัน" ระบบจะเคลียร์ฟอร์มและรีเซ็ตทันที (`actions.handleReset(false)`) ทำให้ผู้ใช้สามารถเริ่มกรอกรายการถัดไปได้ทันทีโดยไม่ต้องรอโหลด
- **Upload Toast Notification**: ยกเลิกการใช้ Loading Overlay แบบเต็มจอและ Modal แจ้งเตือนความสำเร็จ เปลี่ยนเป็นระบบ Toast Notification ขนาดเล็กที่มุมขวาล่าง 
- **Retry Mechanism**: หากการอัปโหลดเบื้องหลังผิดพลาด ผู้ใช้สามารถกดปุ่ม "ลองใหม่อีกครั้ง" จาก Toast ได้ทันที ระบบจะใช้ State ที่ Capture ไว้เพื่อยิง API ใหม่โดยที่ผู้ใช้ไม่ต้องกรอกข้อมูลซ้ำ
- **Performance Feedback**: แสดงระยะเวลาที่ใช้ในการประมวลผลการอัปโหลด (`elapsedTime`) ตรงใน Toast แจ้งงานสำเร็จ

---

### 1. Success Flow Enhancements (New!)
- **Financial Fields**: เพิ่มช่องกรอก `premium_amount` (เบี้ยประกันตามใบเสนอราคา) และระบบเลือกโหมดระหว่าง `actual_paid` (ยอดโอนจริง) หรือ `installment_months` (ผ่อนชำระ)
- **Installment Support**: หากเลือกช่องทาง "ผ่อนเงินสด" ระบบจะแสดงช่องเลือกจำนวนงวด (1-12 เดือน) แทนช่องยอดโอนเงิน
- **Payment Methods Integration**: เพิ่ม Dropdown เลือกช่องทางการชำระเงินที่ดึงข้อมูลจาก API `/load-payment-methods` แบบ Searchable
- **Agent ID Refactor**: เปลี่ยนการส่งค่า `quote_agent_code` เป็น `quoted_by` และ `submit_agent_code` เป็น `submitted_by` เพื่อให้ตรงกับมาตรฐาน DB
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
  - **V5.4.5: UI Layout Reordering**: ปรับปรุงลำดับการแสดงผลของส่วน "แจ้งงานสำเร็จ" (กรอบสีเขียว) โดยย้ายมาไว้ต่อจาก "วันที่ประกันเดิมหมดอายุ" เพื่อให้ Flow การกรอกข้อมูลเป็นไปตามลำดับความสำคัญและลดความซ้ำซ้อน
  - **V5.4.6: UI Styling Standardization**: ปรับปรุงสไตล์ของฟิลด์ที่ถูกปิดใช้งาน (Disabled) ให้เป็นมาตรฐานเดียวกันทั้งระบบ โดยเปลี่ยนสีพื้นหลังฟิลด์วันหมดอายุให้เป็น bg-gray-100
- **V5.4.7: UI Layout Refinement**: ย้ายฟิลด์ "หมายเหตุ / ข้อมูลเพิ่มเติม" เข้าไปอยู่ภายในกรอบสีเขียวเมื่อเลือกวัตถุประสงค์เป็น "แจ้งงานสำเร็จ" เพื่อความเป็นระเบียบและ Flow ข้อมูลที่ชัดเจน
- **V5.4.8: Data Mapping Refactor**: ปรับปรุงการส่งข้อมูลใน `handleSubmit` โดยเปลี่ยน Key ของฟิลด์หมายเหตุจาก `notes` เป็น `policy_notes` เมื่อเลือก "แจ้งงานสำเร็จ" เพื่อให้ข้อมูลถูกบันทึกลงตาราง policies โดยตรงตามโครงสร้าง DB ใหม่ พร้อมเปิดการส่งฟิลด์ข้อมูลการเงินทั้งหมดที่เคยระงับไว้
- **V5.4.9: State Separation for Policy Notes**: แยก State ของหมายเหตุออกจากกันระหว่าง `notes` (Quotation) และ `policyNotes` (Policy) เพื่อป้องกันการเขียนทับข้อมูลเดิมเมื่อเลือกรายการจากประวัติ พร้อมปรับปรุงการบันทึกลง LocalStorage และการส่ง API ให้แยกคีย์กันชัดเจน
- **V5.5.0: Purpose Switch Refactor**: ปรับปรุง Logic การเปลี่ยน "วัตถุประสงค์การแจ้งงาน" ให้ทำการล้างข้อมูล (Full Reset) ทุกครั้งที่มีการสลับโหมด เพื่อป้องกันข้อมูลตกค้างข้าม Workflow โดยใช้มาตรฐานเดียวกับปุ่มล้างข้อมูล
  - **V5.7.0: Tax Withholding & Note Integrity**:
    - **Tax Rate Field**: เพิ่มช่องกรอก `% หักภาษี (tax_rate)` ต่อจากคอมมิชชัน โดยกำหนดค่าเริ่มต้นเป็น 10% เพื่อรองรับการคำนวณภาษีหัก ณ ที่จ่าย
    - **Note Separation**: แยก State ของ `policy_notes` ออกจาก `notes` อย่างเด็ดขาด ป้องกันข้อมูลจากประวัติงานเดิมเขียนทับหมายเหตุที่กรอกใหม่ในงานสำเร็จ
    - **UI Flow Reordering**: ย้ายกรอบสีเขียว (Success Container) มาแสดงต่อจาก "วันที่ประกันเดิมหมดอายุ" เพื่อลำดับการกรอกที่เป็นธรรมชาติมากขึ้น

### 3. Financial & Commission Tracking (New! V5.7.0)
- **Agent Commission**: ช่องกรอก `commission_percent` สำหรับระบุค่าตอบแทนตัวแทน
- **Tax Withholding**: ช่องกรอก `tax_rate` สำหรับระบุ % หักภาษี ณ ที่จ่าย (Default: 10%)
- **Contextual Description**: แสดงชื่อตัวแทนในคำอธิบายฟิลด์เพื่อให้ผู้กรอกทราบชัดเจน

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
| `informerId` | `quoted_by` | รหัสตัวแทนผู้แจ้งงาน |
| `categoryId` | `category_id` | ID หมวดหมู่หลัก |
| `plate_number` | `plate_number` | ทะเบียนรถ |
| `customer_name` | `customer_name` | ชื่อผู้เอาประกัน |
| `endDate` | `previous_policy_expiry_date` | วันหมดอายุกรมธรรม์เดิม |
| `reminder_date` | `reminder_date` | วันที่ตั้งแจ้งเตือน |
| `reminder_type` | `reminder_type` | ประเภทการแจ้งเตือน |
| `notes` | `notes` | หมายเหตุ / ข้อมูลเพิ่มเติม |
| `policy_notes` | `policy_notes` | หมายเหตุสำหรับงานสำเร็จ (เฉพาะ Success) |
| `submitAgentCode` | `submitted_by` | รหัสผู้แจ้งงาน/ผู้ปิดการขาย (เฉพาะ Success) |
| `commission_percent` | `commission_percent` | % คอมมิชชันตัวแทน (เฉพาะ Success) |
| `tax_rate` | `tax_rate` | % หักภาษี (เฉพาะ Success) |
| `product_id` | `product_id` | ID ประเภทงานย่อย (เฉพาะ Success) |
| `files` | `files` | ไฟล์เอกสารแนบทั้งหมด |

> [!IMPORTANT]
> ฟิลด์ข้อมูลการเงินทั้งหมด และ `product_id` จะถูกส่งไปยัง `/submit-policy` เมื่อเลือกวัตถุประสงค์เป็น "แจ้งงานสำเร็จ" เท่านั้น

---

## 🚀 Workflow สำหรับผู้รับช่วงต่อ

### การจัดการ API ใหม่
- **GET `/load-categories`**: ต้องส่งกลับข้อมูลในรูปแบบ `{"results": [{ "category_id": "xxx", "categoryName": "xxx" }]}`
- **GET `/load-quotations`**: ค้นหารายการใบเสนอราคาเดิม
- **POST `/submit-quotation`**: ส่งข้อมูลขอใบเสนอราคาใหม่
- **POST `/update-quotation`**: อัปเดตข้อมูล/ส่งเอกสารเพิ่ม (ต้องมี `quotation_id`)
- **POST `/submit-policy`**: ส่งข้อมูลแจ้งงานสำเร็จ (Success Job)

---
*Last Updated: 2026-07-19 (V6.1.0: Non-blocking UI Upload)*
