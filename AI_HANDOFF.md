# Insurance LIFF App 📄

โปรเจกต์นี้เป็น Web Application แบบหน้าเดียว (Single Page Application) ที่พัฒนาเพื่อใช้เป็น **LINE LIFF App** สำหรับให้ผู้ใช้งาน (ลูกค้า หรือตัวแทน) ส่งข้อมูลและเอกสารเพื่อ "เช็คเบี้ยประกัน" 

## 🛠 เทคโนโลยีที่ใช้
- **HTML/JS (Vanilla)** 
- **Tailwind CSS** (ผ่าน CDN) สำหรับจัดการ UI
- **LINE LIFF SDK** (`liff.init`) ควบคุมการเข้าสู่ระบบผ่าน LINE และดึงข้อมูล Profile
- **Supabase Edge Functions** เป็น Backend API สำหรับดึงข้อมูลตัวแทนและรับข้อมูลฟอร์ม

## ✅ สิ่งที่ทำไปแล้ว (Current State)
1. **การเชื่อมต่อ LINE LIFF**: 
   - ตั้งค่า `myLiffId` เรียบร้อย (`2009445757-eTSIMGmL`)
   - ระบบเช็คสถานะล็อกอิน, เรียกใช้ `liff.login()` หากยังไม่เข้าระบบ และแสดงชื่อผู้ใช้ LINE หลังจากล็อกอินสำเร็จ
2. **ดึงข้อมูลตัวแทนผู้แจ้งงาน (Agent Dropdown)**:
   - ตอนเปิดหน้าเว็บ จะมีการยิง `GET` ไปที่ Supabase API (`/submit-policy`) เพื่อดึงรายชื่อ Agent มาแสดงใน Dropdown (`<select id="informer_id">`) แบบอัตโนมัติ
3. **การปรับฟอร์มตามหมวดหมู่ (Dynamic Form)**:
   - หากเลือก **ประกันรถยนต์** (Motor) ➡️ ช่องให้กรอกจะเป็น "ทะเบียนรถ"
   - หากเลือก **ประกันอื่นๆ** (Non-Motor) ➡️ ช่องให้กรอกจะเปลี่ยนเป็น "ชื่อผู้เอาประกัน"
4. **จัดการอัปโหลดไฟล์ (File Upload to Base64)**:
   - ผู้ใช้แนบไฟล์ได้หลายไฟล์ และระบบจะแปลงไฟล์ (Pdf, Image) เป็น `Base64` พร้อมระบุ `fileName` และ `mimeType` เพื่อส่งไปพร้อมกับ Payload
5. **การส่งข้อมูล (Form Submission)**:
   - เมื่อกดส่งฟอร์ม ระบบจะจัดเตรียม Payload ข้อมูล (รวม `idToken` ของผู้ใช้จาก LIFF) และยิง `POST` ไปยัง Supabase API (`/submit-policy`)
   - มีระบบล็อกปุ่ม ลดการซ้ำซ้อนขณะโหลด
   - หากส่งสำเร็จ (บนเบราว์เซอร์ LINE) หน้าต่าง LIFF จะปิดเองอัตโนมัติ 

## 🚀 แนวทางต่อยอดและสิ่งที่สามารถทำต่อไปได้ (Next Steps)
หากต้องการให้ AI นำไปพัฒนาต่อ สามารถหยิบหัวข้อต่อไปนี้ไปดำเนินการได้เลย:

1. **ปรับปรุง Backend / Supabase Integration**:
   - การจัดการไฟล์แบบตรงเข้า Storage (Direct Upload) แทนการส่ง Base64 ผ่าน JSON (เนื่องจากการส่ง Base64 อาจจะเจอปัญหา Payload size limit ของ API ถ้าไฟล์ใหญ่เกินไป)
2. **การพัฒนา UI/UX และ Validation**:
   - เพิ่ม Loading Skeleton ขณะที่กำลังโหลดรายชื่อ Agent
   - เพิ่มการตรวจสอบขนาดไฟล์จำกัด (File Size Limit Validation) และรูปแบบข้อความแสดงข้อผิดพลาด (Error Handling) ให้แจ้งเตือนผู้ใช้ชัดเจนขึ้นก่อนยิง API Request
   - เพิ่มการ Preview หรือแสดงชื่อไฟล์ที่ผู้ใช้เลือก เพื่อยืนยันเอกสารที่อัปโหลดก่อนกดปุ่มส่ง
3. **Refactor Code (หากสเกลโปรเจกต์จะใหญ่ขึ้น)**:
   - แยกไฟล์ Script (JS) และ สไตล์ (CSS) ออกเป็นไฟล์แยก
   - หากมีแบบฟอร์มซับซ้อนขึ้น อาจจะพิจารณาใช้ Framework แต่ถ้าโปรเจกต์ยังใช้เพียงสำหรับรับข้อมูลธรรมดา รูปแบบ Vanilla HTML+JS ก็เพียงพอและโหลดเร็ว
4. **Environment Variables Configs**:
   - ปัจจุบันตัวแปร `myLiffId` และ `apiUrl` ถูกระบุไว้ในไฟล์เดียวเลย (Hardcoded) ควรพิจารณาหาวิธีจัดการแยก Config นี้ออกไปเพื่อให้สลับระหว่าง Development / Production ได้ง่ายขึ้นในอนาคต

---
> 🤖 **Note for AI Agent**: 
> This is a straightforward HTML+JS LIFF App. 
> To test or debug, focus on `index.html`. API endpoint is `https://bgmmrxczsikxcgwayomc.supabase.co/functions/v1/submit-policy`.
> Payload schema for form submission requires `idToken`, `informer_id`, `category_id`, properties mapped from inputs (`plate_number` or `customer_name`), `end_date`, and `files` array encoded in Base64 `[{base64, fileName, mimeType}]`. Ensure these are aligned with the Supabase Edge function logic if making changes.
