# AI Handoff: Insurance LIFF Project Status

## 📌 Project Overview
โปรเจกต์ระบบการยื่นคำขอเช็คเบี้ยประกันภัยผ่านแพลตฟอร์ม LINE LIFF App (สำหรับตัวแทน) ได้รับการอัปเกรดทั้งในด้านฟังก์ชันการใช้งาน (Features) และประสบการณ์ผู้ใช้ (UX/UI) อย่างสมบูรณ์ในฝั่ง Frontend เพื่อเพิ่มประสิทธิภาพการทำงานและรองรับการแสดงผลข้ามอุปกรณ์ (Cross-device)

## 🟢 Current Status (สิ่งที่พัฒนาเรียบร้อยแล้วใน Frontend)
1. **Modern UX/UI Overhaul**: 
   - ปรับโฉมแอปพลิเคชันด้วยสไตล์ Glassmorphism ให้ความรู้สึกโปร่งสบายและทันสมัย
   - บูรณาการระบบสีประจำองค์กร (Brand Color: `#178F46`) ตลอดทั้งแอปพลิเคชัน
   - นำ CSS Tailwind Forms plugin มาใช้เพื่อให้ Native UI elements สวยงาม รวมถึงใส่ Responsive Logic ซ่อนคำแนะนำ `(Ctrl+V)` เมื่อเปิดอ่านจากสมาร์ทโฟน
2. **Quotation Reminder & Native Datepickers**: 
   - เพิ่มฟังก์ชันแจ้งเตือนการออกใบเสนอราคาย้อนหลัง หากเช็คเบี้ยเร็วเกินกำหนด
   - คืนชีพ Native Datepicker (`<input type="date">`) ทำให้การเลือกวันใช้งานจริงบน iOS / Android ทำได้อย่างเป็นธรรมชาติสูงสุด พร้อมแปลงโฉมไอคอนปฏิทินให้กลมกลืนกับหน้าเว็บ
3. **Categorized File Uploads (Drag, Drop & Paste)**:
   - เพิ่มหมวดหมู่การจัดเก็บรูปภาพ 6 โซนแยกประเภท (พร้อมหมวดใหม่: "เบี้ยต่ออายุ / ใบเตือนต่ออายุ") เสริมความน่าใช้งานด้วยสัญลักษณ์อีโมจิ
   - บนฝั่ง Desktop ผู้ใช้งานสามารถแคปเจอร์รูปแล้วกดวาง (`Ctrl+V`) ลงในกล่อง (Dropzone) ได้อย่างอิสระ
4. **Enhanced Object Payload Schema**:
   - เพิ่มช่องทาง "แจ้งเช็คเบี้ยต่ออายุ" ในแบบฟอร์มการเลือกประเภท  `submission_type` อย่างชัดเจน
   - ปรับปรุง Data Payload ที่ถูกแพ็คและส่งไป Webhook / Edge Function ให้คลุมฟิลด์ใหม่ทั้งหมด

---

## 🛠 Backend Implementation Plan (Future Work / สำหรับ AI ผู้รับช่วงต่อ)
เพื่อรองรับฟอร์มใหม่ของฝั่ง Frontend ควรเตรียมการในฝั่ง Backend (Supabase + LINE API) ดังนี้:

### 1. Database Schema
ในตารางฐานข้อมูลหลักที่เก็บการส่งแบบฟอร์ม (เช่นตาราง `policy_submissions`) จะต้องมีคอลัมน์เพิ่ม:
*   `reminder_date` (Date / Timestamp): วันที่ที่ระบบจะต้องทำการแจ้งเตือนผู้ใช้งาน (ส่งมาจาก Payload Frontend)
*   `reminder_status` (String/Enum): เช่น Default คือ `pending`, เมื่อแจ้งแล้วเป็น `sent`, หรือ `cancelled`
*   `line_user_id` (String): **[IMPORTANT]** ควร verify/decode ค่า `idToken` ใน Edge Function เพื่อดึงข้อมูล `User ID` ของบัญชี LINE มาเก็บไว้ใช้ติดต่อยืนยันสิทธ์การรับข้อความส่วนตัว (Push Message) กลับไปหาผู้ส่งต้นทาง

### 2. Notification Engine (Cron Job)
ดำเนินการตั้งค่า Action รายวันเพื่อให้ระบบส่งข้อความอัตโนมัติภายใน Supabase:
*   **ใช้ `pg_cron`**: จัดเก็บ Extension ไว้ลุยสคริปต์รายวัน (เช่น รันเวลา 08:00 น. เพื่อ Query หาแถวที่ `reminder_date = CURRENT_DATE` และ status = pending)
*   **Supabase Edge Function (Notification Action)**:
    จับ Event การ Query ส่งไปหา Endpoint ของ **LINE Messaging API (Push Message)**
    ```json
    {
       "to": "[line_user_id จากโควตาที่ต้องส่งวันนี้]",
       "messages": [
           {
               "type": "text",
               "text": "📢 ถึงเวลาออกใบเสนอราคาสำหรับรถ ทะเบียน [plate_number] แล้วครับ! สามารถเช็คเบี้ยได้เลย"
           }
       ]
    }
    ```
    หลังยิงข้อความด้วย API บังคับให้ update `reminder_status = 'sent'` ด้วยทุกครั้งเพื่อกันการส่งข้อความซ้ำลูป

### 3. Edge Function (Receiving API Update)
*   รื้อฟื้น Endpoint ฟังก์ชันอัปเดตปัจจุบัน (`/submit-policy`) ให้ทำการ Map array ข้อมูลที่ปรับปรุงใหม่ (อย่างเช่น `reminder_date`, การเลือก `submission_type` ฝั่งต่ออายุ) กระจายลงไปยัง Object ในฐานข้อมูลให้ครบทุก Fields และปลอดภัยอย่างเคร่งครัด
