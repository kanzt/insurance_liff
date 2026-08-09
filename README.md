# 🛡️ Insurance LIFF: Document Submission System

ระบบแจ้งเช็คเบี้ยประกันภัยผ่าน LINE LIFF ที่ออกแบบมาเพื่อความรวดเร็วและใช้งานง่ายสำหรับตัวแทน พัฒนาด้วยเทคโนโลยีที่ทันสมัยที่สุดในปัจจุบัน

## 🚀 เทคโนโลยีที่ใช้
- **Frontend Framework**: [Preact](https://preactjs.com/) (Small, fast alternative to React)
- **Tooling**: [Vite](https://vitejs.dev/) (Next Generation Frontend Tooling)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (High-performance CSS framework)
- **Platform**: [LINE LIFF SDK](https://developers.line.biz/en/docs/liff/overview/)
- **Backend Service**: Supabase Edge Functions
*Last Updated: 2026-08-09 (V6.2.0: Vehicle Cascading & Explicit Vehicle Fields)*

## ✨ ฟีเจอร์หลัก
- **Vehicle Cascading Selection**: ระบบเลือกข้อมูลรถยนต์แบบแสดงผลต่อเนื่อง (ปี -> ยี่ห้อ -> รุ่น) เฉพาะหมวดหมู่ประกันรถยนต์
- **Non-blocking Background Upload**: ย้ายระบบอัปโหลดและบีบอัดรูปภาพไปรันเบื้องหลัง พร้อมรีเซ็ตฟอร์มทันที และแจ้งเตือนผ่าน Toast Notification
- **Concurrency & Race Condition Protection**: ล็อกปุ่มกดส่งและล็อกรายการค้นหาหากข้อมูลนั้นๆ กำลังประมวลผลการอัปโหลดอยู่เบื้องหลัง
- **Agent Verification**: ระบบตรวจสอบสิทธิ์ตัวแทนอัตโนมัติก่อนเข้าใช้งาน
- **Financial Tracking**: ระบบบันทึกเบี้ยประกันและยอดโอนจริง พร้อมช่องทางการชำระเงิน (เฉพาะแจ้งงานสำเร็จ)
- **Searchable Agent Selection**: กล่องค้นหาตัวแทนอัจฉริยะ (กรองตามชื่อหรือรหัสตัวแทน)
- **Searchable Dropdowns**: ระบบเลือก "รหัสแจ้งงาน" และ "บริษัทประกัน" แบบพิมพ์ค้นหาได้ เพื่อความรวดเร็ว
- **Smart Upload**: รองรับการลากไฟล์วาง (Drag & Drop) และการกด Ctrl+V เพื่อวางรูปภาพ
- **Automatic Reminder**: คำนวณวันแจ้งเตือนล่วงหน้าให้อัตโนมัติ (60 วันก่อนประกันหมด)
- **Form State Persistence**: บันทึกข้อมูลร่าง (Draft) อัตโนมัติ ป้องกันข้อมูลหายแม้แอปโหลดใหม่
- **Immersive Document Gallery**: ระบบดูรูปภาพเต็มหน้าจอระดับโปร พร้อมปุ่มเลื่อนดูภาพถัดไป/ย้อนกลับ และตัวเลขบอกลำดับภาพ (1/3)
- **Continuous Submission Flow**: รองรับการส่งงานหลายรายการต่อเนื่องโดยไม่ต้องโหลดหน้าเว็บใหม่
- **Smart Red-Plate Handling**: ระบบแยกแยะ "รถป้ายแดง" อัตโนมัติ เพื่อบันทึกข้อมูลชื่อลูกค้าแทนเลขทะเบียน ป้องกันข้อมูลผิดเพี้ยน
- **Responsive & Premium UI**: ดีไซน์ Glassmorphism ที่สวยงาม พร้อมโทนสี Slate ที่ดูเป็นมืออาชีพ รองรับทั้ง Mobile และ Desktop

## 🛠 การติดตั้ง (Installation)

1. **Clone project**
2. **ติดตั้ง Dependencies**
   ```bash
   npm install
   ```
   *(แนะนำให้ใช้ **Node.js 24** ขึ้นไปสำหรับระบบการ Deploy ล่าสุด)*
3. **ตั้งค่าตัวแปรสภาพแวดล้อม (Environment Variables)**
   - คัดลอกไฟล์ `.env.example` ไปเป็น `.env`
   - ระบุ `VITE_LIFF_ID` และ `VITE_API_BASE_URL` ของคุณ

## 💻 คำสั่งสำหรับนักพัฒนา (Development)
- **รัน Server สำหรับพัฒนา**: `npm run dev` (มีระบบ Hot Reload แก้โค้ดแล้วเปลี่ยนทันที)
- **Build สำหรับ Production**: `npm run build` (ไฟล์จะถูกรวมและย่อขนาดไว้ในโฟลเดอร์ `dist/`)

### 3. Power Gallery & Batch Flow (New! V3.8.0)
- **Document Gallery**: เปลี่ยน Modal รูปภาพแบบเดิมเป็น Gallery เต็มตัว (Solid Black Backdrop) ที่สามารถกดเลื่อนดูเอกสารทั้งหมดในหมวดหมู่นั้นๆ ได้ทันที รองรับ Keyboard Navigation (Arrow Keys) และปุ่มปิด Esc
- **Batch Submission**: เมื่อส่งข้อมูลสำเร็จ ระบบจะล้างข้อมูลเฉพาะส่วนสำคัญ (เอกสาร, ทะเบียน) และพาคุณกลับไปจุดเริ่มต้นเพื่อแจ้งงานต่อทันที โดยยังคงรักษาข้อมูล "ตัวแทน" และ "ประเภทงาน" ไว้เพื่อความเร็ว
- **Red Plate Logic**: เพิ่มโหมด "รถป้ายแดง" เพื่อรักษาความสะอาดของฐานข้อมูล โดยระบบจะส่ง `plate_number = "ป้ายแดง"` และนำชื่อที่กรอกไปบันทึกในคอลัมน์ `customer_name` แทนข้อมูลทะเบียน
- **Manual Reset**: เพิ่มปุ่ม "ล้างข้อมูล" (Reset) ที่มาพร้อมระบบยืนยัน (Confirmation) เพื่อความยืดหยุ่นในการเคลียร์ฟอร์ม
- **Refined Aesthetics**: ปรับปรุงระยะห่างและสีสันใหม่ (Slate Theme) ให้ดูเป็นระเบียบและพรีเมียมมากขึ้น
- **V4.4.0: Category Migration**: ปรับปรุงโครงสร้างหมวดหมู่ใหม่ โดยใช้ระบบ `/load-categories` แทน Sub-categories เพื่อลดความซับซ้อน และเพิ่มระบบ Smart Reset เมื่อเปลี่ยนวัตถุประสงค์งาน
- **V4.5.0: Searchable Dropdowns**: เพิ่มคอมโพเนนต์ `SearchableSelect` และ Refactor ระบบ API ให้เป็นศูนย์กลางที่ `api.js` เพื่อความเสถียรและดูแลรักษาง่าย
- **V4.6.0: Success Flow Enhancements**: เพิ่มฟิลด์รายละเอียดการเงิน (เบี้ยประกัน, ยอดโอนจริง) และระบบเลือกช่องทางการชำระเงินจาก API
- **V4.7.0: Agent ID Refactor & Installments**: ปรับปรุงโครงสร้าง API ให้ส่ง `agent_id` แทน `agent_code` และเพิ่มระบบรองรับการผ่อนชำระเงินสด (Installments)
- **V4.8.0: Additional Document Flow Hardening**: เพิ่มระบบล็อกฟิลด์ชื่อผู้เอาประกันและทะเบียนรถอัตโนมัติเมื่อเลือกส่งเอกสารเพิ่ม เพื่อความถูกต้องของข้อมูลและป้องกันความผิดพลาดในการแก้ไขงานเดิม
- **V4.9.0: Commission Tracking**: เพิ่มระบบบันทึกค่าคอมมิชชันตัวแทนผู้แจ้งงาน (%) ในส่วนงานสำเร็จ พร้อมคำอธิบายที่เชื่อมโยงกับชื่อตัวแทนจริง
- **V5.0.0: Quotation Flow Refactor**: ปรับปรุงระบบการส่งข้อมูลใหม่ทั้งหมด โดยเปลี่ยนไปใช้ Endpoint `/submit-quotation` และส่งเฉพาะฟิลด์ที่จำเป็นสำหรับการขอใบเสนอราคา เพื่อเตรียมพร้อมสำหรับการยกเครื่องระบบครั้งใหญ่ (Major Refactor)
- **V5.1.0: Reminder Restoration**: ปลดล็อกระบบการตั้งแจ้งเตือน (Reminder) ให้กลับมาใช้งานได้ตามปกติในทุกรูปแบบการส่งงาน รวมถึงส่วน "แจ้งงานสำเร็จ" เพื่อความยืดหยุ่นในการใช้งานของตัวแทน
- **V5.2.0: Update Quotation Flow**: เพิ่มระบบส่งเอกสารเพิ่มเติม (Additional Documents) โดยแยก Endpoint ไปที่ `/update-quotation` เพื่อการจัดการข้อมูลที่แม่นยำยิ่งขึ้น พร้อมระบบ Rename ไฟล์เอกสารให้อัตโนมัติใน Workflow นี้
- **V5.3.0: Reminder Locking**: ปรับปรุงระบบ Validation ให้ล็อกการตั้งแจ้งเตือนหากเลือกวัตถุประสงค์เป็น "แจ้งงานสำเร็จ"
- **V5.4.0: Conditional UI**: เปลี่ยนจากการล็อก (Lock) เป็นการซ่อน (Hide) ส่วนตั้งแจ้งเตือนทั้งหมดเมื่อเลือก "แจ้งงานสำเร็จ" เพื่อความสะอาดของอินเตอร์เฟซ
- **V5.4.1: UI Layout Update**: ปรับปรุงลำดับการแสดงผล โดยย้ายส่วน "หมายเหตุ / ข้อมูลเพิ่มเติม" ลงมาไว้ต่อจากส่วนการตั้งแจ้งเตือน เพื่อให้ Flow การกรอกข้อมูลลื่นไหลขึ้น
- **V5.4.2: UI Refining**: ซ่อน Checkbox "รถใหม่ป้ายแดง" เมื่อเลือกวัตถุประสงค์เป็น "ส่งเอกสารเพิ่ม"
- **V5.4.3: UI Refining**: ขยายการซ่อน Checkbox "รถใหม่ป้ายแดง" ให้ครอบคลุมถึงกรณี "แจ้งงานสำเร็จ"
- **V5.4.4: UI Cleanup**: นำฟิลด์ "ผลิตภัณฑ์" (Product) ออกจากหน้าฟอร์มหลัก เนื่องจากไม่จำเป็นต้องระบุในขั้นตอนการขอเช็คเบี้ยเบื้องต้น
- **V5.4.5: UI Layout Reordering**: ปรับปรุงลำดับการแสดงผลของส่วน "แจ้งงานสำเร็จ" (กรอบสีเขียว) โดยย้ายมาไว้ต่อจาก "วันที่ประกันเดิมหมดอายุ" เพื่อให้ Flow การกรอกข้อมูลเป็นไปตามลำดับความสำคัญและลดความซ้ำซ้อน
- **V5.4.6: UI Styling Standardization**: ปรับปรุงสไตล์ของฟิลด์ที่ถูกปิดใช้งาน (Disabled) ให้เป็นมาตรฐานเดียวกันทั้งระบบ โดยเปลี่ยนสีพื้นหลังฟิลด์วันหมดอายุให้เป็น bg-gray-100
- **V5.4.7: UI Layout Refinement**: ย้ายฟิลด์ "หมายเหตุ / ข้อมูลเพิ่มเติม" เข้าไปอยู่ภายในกรอบสีเขียวเมื่อเลือกวัตถุประสงค์เป็น "แจ้งงานสำเร็จ" เพื่อความเป็นระเบียบและ Flow ข้อมูลที่ชัดเจน
- **V5.4.8: Data Mapping Refactor**: ปรับปรุงการส่งข้อมูลใน `handleSubmit` โดยเปลี่ยน Key ของฟิลด์หมายเหตุจาก `notes` เป็น `policy_notes` เมื่อเลือก "แจ้งงานสำเร็จ" เพื่อให้ข้อมูลถูกบันทึกลงตาราง policies โดยตรงตามโครงสร้าง DB ใหม่
- **V5.4.9: State Separation for Policy Notes**: แยก State ของหมายเหตุออกจากกันระหว่าง `notes` (Quotation) และ `policyNotes` (Policy) เพื่อป้องกันการเขียนทับข้อมูลเดิมเมื่อเลือกรายการจากประวัติ
- **V5.5.0: Purpose Switch Refactor**: ล้างข้อมูลในฟอร์มทั้งหมด (Reset) ทุกครั้งที่มีการสลับ "วัตถุประสงค์การแจ้งงาน" เพื่อความถูกต้องของข้อมูลในแต่ละ Workflow
- **V5.6.0: Success Flow Optimization**: แยก Endpoint งานสำเร็จไปที่ `/submit-policy`, ยกเลิกการส่ง Reminder ในงานสำเร็จ และส่ง `product_id` เพื่อความแม่นยำของข้อมูล
- **V5.7.0: Tax Withholding & Note Integrity**: เพิ่มฟิลด์ `% หักภาษี (tax_rate)` พร้อมค่าเริ่มต้น 10%, แยก State หมายเหตุกรมธรรม์ (`policy_notes`) และปรับปรุง UI Flow ของงานสำเร็จ
- **V6.0.0: Structural Component Refactoring**: แยกโครงสร้างโค้ดออกเป็น Hooks (`useReferenceData`, `usePolicyFormState`, `usePolicySubmit`) และ Sub-components เพื่อความยืดหยุ่นในการขยายแอป
- **V6.1.0 - V6.1.12: Non-blocking Background Upload & Concurrency Protection**: ย้ายการยิง API อัปโหลดไปรันเบื้องหลัง, เพิ่ม Toast Notifications, ดูประวัติ session, ล็อกการส่งซ้ำซ้อน
- **V6.2.0: Vehicle Cascading & Explicit Vehicle Fields**: เพิ่มระบบเลือกปี ยี่ห้อ และรุ่นรถยนต์แบบ Cascading Dropdown พร้อมส่งข้อมูล `vehicle_year`, `vehicle_make`, `vehicle_model` แยกฟิลด์อิสระ




### 4. Automated CI/CD
- **GitHub Actions**: ตั้งค่าไฟล์ `.github/workflows/deploy.yml` ไว้สำหรับการ Deploy ไปที่ GitHub Pages โดยอัตโนมัติเมื่อมีการ Push ไปที่ Branch `main`
- **Base Path**: ตั้งค่า `base: '/insurance_liff/'` ใน `vite.config.js` เพื่อให้รองรับการรันใน Subdirectory ของ GitHub Pages

## 📦 การ Deploy (Deployment)

โปรเจกต์นี้ได้รับการตั้งค่าให้ Deploy ไปที่ **GitHub Pages** โดยอัตโนมัติผ่าน GitHub Actions

### ขั้นตอนการเตรียมการบน GitHub:
1. ไปที่เมนู **Settings > Secrets and variables > Actions** และเพิ่มตัวแปรดังนี้:
   - `VITE_LIFF_ID`
   - `VITE_API_BASE_URL`
2. ไปที่เมนู **Settings > Pages** และเลือก Build and deployment source เป็น **GitHub Actions**

---
*Last Updated: 2026-08-09 (V6.2.0: Vehicle Cascading & Explicit Vehicle Fields)*
*จัดทำและพัฒนาโดยทีม Antigravity*
