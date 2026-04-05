# AI Handoff: Quotation Reminder Feature

## 📌 Context
ในหน้าแอปพลิเคชันรูปแบบ LIFF ได้มีการเพิ่ม UI สำหรับให้ผู้ใช้ (ตัวแทน) "ตั้งเตือนให้ออกใบเสนอราคาล่วงหน้า" ในกรณีที่เช็คเบี้ยเร็วเกินไป (มากกว่า 60-90 วันก่อนกรมธรรม์หมดอายุ) ซึ่งยังไม่สามารถออกเสนอราคาได้ ณ วันที่กดส่ง

*   **สิ่งที่พัฒนาแล้วใน Frontend:**
    1. เพิ่ม Checkbox ขอรับการแจ้งเตือน
    2. เพิ่ม Date Picker เพื่อรับค่า `reminder_date` (และถ้ากรอก `end_date` ไว้แล้ว จะคำนวณหักลบ 60 วันเป็น Default ให้)
    3. ปรับ Logic การ Build JSON Payload ใน method `POST` โดยส่งไปหา Edge Function พร้อม key ใหม่คือ `reminder_date`

## 🛠 Backend Implementation Plan (Future Work / สำหรับ AI ตัวต่อไปที่จะมาทำแพทช์หน้า)
สำหรับการพัฒนาระบบหลังบ้านมารองรับฟีเจอร์นี้ ขอแนะนำให้ดำเนินการดังต่อไปนี้:

### 1. Database Schema (Supabase)
ในตารางที่เก็บข้อมูลการขอเช็คเบี้ย (เช่นตาราง `policy_submissions`) จะต้องเพิ่มโครงสร้างเพื่อจัดเก็บรายละเอียดการแจ้งเตือน:
*   `reminder_date` (Date / Timestamp): เก็บวันที่ที่ระบบจะต้องทำการแจ้งเตือนผู้ใช้งาน (ส่งมาจาก Payload Frontend)
*   `reminder_status` (String/Enum): สถานะของการเตือน สร้างค่า Default เป็น `pending` (รอแจ้งเตือน), และมีสถานะ `sent` (แจ้งเตือนแล้ว), หรือ `cancelled` (ปิดคิว)
*   `line_user_id` (String): [IMPORTANT] จำเป็นต้องใช้ verify method เพื่อ decode ค่า `idToken` ใน Edge Function เพื่อดึงหา `User ID` ของบัญชี LINE คนนั้นๆ มาเก็บไว้ เพื่อใช้โยงผูกสำหรับสิทธิ์ในการรับข้อความส่วนตัว (Push Message) กลับไปหา

### 2. Notification Engine (Cron Job)
รันเป็น scheduled service เพื่อส่งข้อความได้อัตโนมัติ โดยไม่ต้องอาศัย Make.com ใช้ Supabase ให้จบในตัวเลย
*   **ใช้ `pg_cron`**: ติดตั้ง extension `pg_cron` บันทึกใน PostgreSQL สั่งสคริปต์รายวัน (เช่น รันทุกเวลา 08:00 น.)
    ```sql
    -- ตัวอย่างการดึงคิวประจำวัน (Concept)
    SELECT * FROM policy_submissions 
    WHERE reminder_date = CURRENT_DATE 
    AND reminder_status = 'pending';
    ```
*   **Supabase Edge Function (Notification Action)**:
    สร้าง Endpoint ฟังก์ชันใหม่ที่โดน Trigger จาก cron-job ด้านบน 
    เมื่อดึงข้อมูลรายชื่อคิวได้ ให้ยิง Message ไปยัง **LINE Messaging API (Push Message)**
    ```json
    {
       "to": "[line_user_id จาก policy_submissions]",
       "messages": [
           {
               "type": "text",
               "text": "📢 ถึงเวลาออกใบเสนอราคาสำหรับรถ ทะเบียน [plate_number] แล้วครับ! เตรียมประสานงานได้เลย"
           }
       ]
    }
    ```
    หลังยิง API เสร็จ อย่าลืม update `reminder_status = 'sent'` ให้กับแถวที่ยิงสำเร็จด้วย

### 3. Edge Function (Receiving API Update)
*   แก้ไข Payload schema ในไฟล์ Edge Function ปัจจุบัน (`/submit-policy`) ให้รองรับการ map key ชื่อ `reminder_date` ไปลง Database อย่างปลอดภัย 
*   อย่าลืม Decode `idToken` ด้วย lib ของ LINE หรือ Supabase Auth เสมอ
