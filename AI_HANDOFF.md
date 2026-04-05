# AI Handoff: Insurance LIFF Project Status

## 📌 Project Overview
โปรเจกต์ระบบการยื่นคำขอเช็คเบี้ยประกันภัยผ่านแพลตฟอร์ม LINE LIFF App (สำหรับตัวแทน) ได้รับการอัปเกรดทั้งในด้านฟังก์ชันการใช้งาน (Features) และประสบการณ์ผู้ใช้ (UX/UI) อย่างสมบูรณ์ในฝั่ง Frontend เพื่อเพิ่มประสิทธิภาพการทำงานความปลอดภัยของระบบ และรองรับการแสดงผลข้ามอุปกรณ์ (Cross-device)

## 🟢 Current Status (สิ่งที่พัฒนาเรียบร้อยแล้วใน Frontend)
1. **Modern UX/UI Overhaul**: 
   - ปรับโฉมแอปพลิเคชันด้วยสไตล์ Glassmorphism ให้ความรู้สึกโปร่งสบายและทันสมัย บูรณาการระบบสีประจำองค์กร (Brand Color: `#178F46`) ตลอดทั้งแอปพลิเคชัน
   - นำ CSS Tailwind Forms plugin มาใช้เพื่อให้ Native UI elements สวยงาม รวมถึงใส่ Responsive Logic ซ่อนคำแนะนำ `(Ctrl+V)` เมื่อเปิดอ่านจากสมาร์ทโฟน
2. **Explicit Agent Verification Flow (สำคัญ)**:
   - ฟอร์มหน้าแรกจะถูกเริ่มต้นด้วยสถานะ `display: none;` ทั้งหมด ไม่ให้กดกรอกขอมูลได้กราบได้ที่ยังไม่ถูกอนุญาต
   - เมื่อ Login ผ่าน LIFF แล้ว โค้ดจะนำ `idToken` ไปยิงตรวจที่ `/verifyAgent` ก่อน
   - แสดงสถานะตาม Backend: รออนุมัติ (1) และ ไม่มีสิทธิ์ (3) จะทำการ Block หน้าจอไว้ทันที อนุมัติ (2) จึงค่อยปลดล็อคให้แบบฟอร์มแสดง
3. **Dynamic Agent Dropdown**:
   - เมื่อผู้ใช้งานได้รับการ `verifyAgent` สำเร็จ (Status = 2) ระบบจะยิงต่อไปที่ Endpoint `/loadAgents` เพื่อนำข้อมูล `{ results: [{ fullName: "...", agentId: "..." }] }` มาเติมเป็น Dropdown 
4. **Quotation Reminder & Native Datepickers**: 
   - เพิ่มฟังก์ชันแจ้งเตือนการออกใบเสนอราคาย้อนหลัง หากเช็คเบี้ยเร็วเกินกำหนด
   - คืนชีพ Native Datepicker (`<input type="date">`) ทำให้การเลือกวันทำได้อย่างเป็นธรรมชาติสูงสุดบนมือถือ
5. **Categorized File Uploads (Drag, Drop & Paste)**:
   - เพิ่มหมวดหมู่ย่อย 6 โซนแยกประเภท (พร้อมหมวดใหม่: "เบี้ยต่ออายุ / ใบเตือนต่ออายุ") เสริมความน่าใช้งาน
   - บนฝั่ง Desktop ผู้ใช้งานสามารถแคปเจอร์รูปแล้วกดวาง (`Ctrl+V`) ลงในกล่อง (Dropzone) ได้อย่างอิสระ
6. **Enhanced Object Payload Schema**:
   - เพิ่มช่องทาง "แจ้งเช็คเบี้ยต่ออายุ" ในแบบฟอร์มการเลือกประเภท `submission_type`
   - ปรับปรุง Data Payload ที่ถูกแพ็คและส่งไป Webhook / Edge Function ให้คลุมฟิลด์เตือนล่วงหน้าทั้งหมด

---

## 🛠 Backend Implementation Plan (Future Work / สำหรับ AI ผู้รับช่วงต่อ)
เพื่อรองรับฟอร์มใหม่ของฝั่ง Frontend ควรเตรียมการในฝั่ง Backend (Supabase + LINE API) ดังนี้:

### 1. Verification & Agent Load Endpoints (ด่วน)
*   **Endpoint:** `/verifyAgent` (POST)
    - ต้องรับ `idToken` แล้ว Decode ด้วยเครื่องมือที่ปลอดภัย จากนั้นค้นหาฐานข้อมูลเพื่อ Return `{ result: { liff_status: x } }` 
    - `1` = รอดำเนินการ, `2` = อนุมัติ, `3` = ไม่มีสิทธิ์/ตกรอบ
*   **Endpoint:** `/loadAgents` (GET)
    - สร้าง API ใหม่ส่งข้อมูลตัวแทนกลับเป็น Array ภายใต้ Key: `results` เพื่อเอามาวนลูปใส่ Select Element

### 2. Database Schema
ในตารางฐานข้อมูลหลักที่เก็บการส่งแบบฟอร์ม (เช่นตาราง `policy_submissions`) จะต้องมีคอลัมน์เพิ่ม:
*   `reminder_date` (Date / Timestamp): วันที่ที่ระบบจะต้องทำการแจ้งเตือนผู้ใช้งาน (ส่งมาจาก Payload Frontend)
*   `reminder_status` (String/Enum): เช่น Default คือ `pending`, เมื่อแจ้งแล้วเป็น `sent`, หรือ `cancelled`
*   `line_user_id` (String): **[IMPORTANT]** ควรชี้ให้ตรงกับ `idToken` ใน Edge Function เพื่อติดต่อยืนยันสิทธ์ Push Message ได้

### 3. Notification Engine (Cron Job)
ดำเนินการตั้งค่า Action รายวันเพื่อให้ระบบส่งข้อความอัตโนมัติภายใน Supabase:
*   **ใช้ `pg_cron`**: จัดเก็บ Extension ไว้ลุยสคริปต์รายวัน (เช่น รันเวลา 08:00 น. เพื่อ Query หาแถวที่ `reminder_date = CURRENT_DATE` และ status = pending)
*   **Supabase Edge Function (Notification Action)**:
    จับ Event การ Query ส่งไปหา Endpoint ของ **LINE Messaging API (Push Message)**
    - หลังยิงข้อความ Update `reminder_status = 'sent'` เสมอ

### 4. Edge Function (Receiving API Update)
*   ปรับปรุง Endpoint ของ `/submit-policy` ให้ทำการ Map array ข้อมูลที่ปรับปรุงใหม่ (เช่น `reminder_date`, `submission_type`) กระจายลงไปยัง Object ในฐานข้อมูลให้ครบทุก Fields และปลอดภัยอย่างเคร่งครัด
