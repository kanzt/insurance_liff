# 🛡️ Insurance LIFF: Document Submission System

ระบบแจ้งเช็คเบี้ยประกันภัย ส่งเอกสารเพิ่มเติม และแจ้งงานสำเร็จผ่าน LINE LIFF พัฒนาด้วยเทคโนโลยี Modern Web สำหรับตัวแทนประกันภัย

[![Version](https://img.shields.io/badge/version-v1.1.0-teal.svg)](CHANGELOG.md)
[![Preact](https://img.shields.io/badge/Preact-10.29.1-673ab8.svg)](https://preactjs.com/)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4.2-38bdf8.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.0.4-646cff.svg)](https://vitejs.dev/)

---

## 🚀 เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend Framework**: [Preact](https://preactjs.com/) — เล็ก กะทัดรัด ประสิทธิภาพสูง
- **Tooling**: [Vite](https://vitejs.dev/) — Fast Bundler พร้อม Hot Module Replacement
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) — CSS-first engine
- **Platform SDK**: [LINE LIFF SDK](https://developers.line.biz/en/docs/liff/overview/) — จัดการ Identity และ Bearer Token
- **Backend Service**: Supabase Edge Functions — REST APIs พร้อม Bearer ID Token Auth

---

## ✨ ฟีเจอร์หลัก (Key Features)

- **Smart Record-Type Detection**: ระบบค้นหาคู่ขนานอัจฉริยะในโหมดต่ออายุ แยกแยะระหว่าง **กรมธรรม์เดิม (`policyId`)** สำหรับเปิดเคสต่ออายุรอบใหม่ (`POST /submit-quotation`) กับ **เคสเช็คเบี้ยเดิม (`quotationId`)** สำหรับส่งเอกสารเพิ่ม/แก้ไข (`POST /update-quotation`) พร้อมติด Badge แสดงผลชัดเจน
- **Issued Policies Renewal Integration (`GET /load-policies`)**: เชื่อมต่อการค้นหากรมธรรม์เดิมที่ปิดการขายแล้วในระบบ แสดงเลข `policyId` (เช่น `P202608001`), บริษัทประกันเดิม, วันหมดอายุเดิม และผูก `previous_policy_id` ส่งไปใน `POST /submit-quotation`
- **Quotation Sub-Type Switcher**: สลับโหมดการเช็คเบี้ยได้อย่างรวดเร็วระหว่าง `✨ งานใหม่` และ `🔄 งานต่ออายุ`

- **Smart Plate Transfer Resolution**: รองรับกรณีลูกค้าสลับป้ายทะเบียนเดิมมาใส่รถคันใหม่ด้วยปุ่มกด 1-Click `🚗✨ สลับป้ายใส่คันใหม่` ล้างข้อมูลรถเดิมและข้ามระบบล็อกเช็คเบี้ยซ้ำ
- **Dynamic Renewal Dropzone Priority**: จัดลำดับช่องแนบไฟล์ตามความสำคัญของงานต่ออายุ (ดัน `ใบเตือนต่ออายุ` และ `กรมธรรม์เดิม` ขึ้นบนสุด)
- **1-Click Renewal Reminder Presets**: คำนวณวันแจ้งเตือนล่วงหน้าได้ทันที (15, 30, 45, 60 วันก่อนหมดอายุ)

- **Vehicle Cascading Selection**: ระบบเลือกข้อมูลรถยนต์แบบต่อเนื่อง (ปี $\rightarrow$ ยี่ห้อ $\rightarrow$ รุ่น) สำหรับประกันรถยนต์
- **Non-blocking Background Upload**: บีบอัดและอัปโหลดข้อมูลเบื้องหลัง พร้อมรีเซ็ตฟอร์มทันที และแสดงผลผ่าน Toast Stack Notification
- **Concurrency & Race Condition Protection**: ล็อกปุ่มกดส่งและล็อกรายการค้นหาเมื่อทะเบียนรถนั้นๆ อยู่ระหว่างประมวลผล
- **Smart Plate Search & Workflow Switching**: ค้นหาทะเบียนรถเดิมอัตโนมัติ พร้อมสลับโหมดส่งเอกสารเพิ่มให้อัตโนมัติ
- **Agent Verification**: ตรวจสอบสิทธิ์ตัวแทนอัตโนมัติก่อนเข้าใช้งาน
- **Financial & Commission Tracking**: บันทึกเบี้ยประกัน, ยอดโอนจริง / จำนวนงวดผ่อน, หักภาษี ณ ที่จ่าย และค่าคอมมิชชันตัวแทน
- **Draft Persistence**: บันทึกข้อมูลร่างอัตโนมัติลง LocalStorage ป้องกันข้อมูลสูญหาย
- **Full-Screen Document Gallery**: ระบบดูตัวอย่างเอกสารแบบเต็มหน้าจอพร้อม Keyboard Navigation
- **Clipboard & Multiple Attachments**: รองรับการ Drag & Drop และการกด `Ctrl+V` วางรูปภาพแบบต่อท้าย (Append)

---

## 🛠 การติดตั้ง & ตั้งค่า (Installation & Setup)

### 1. ติดตั้ง Dependencies
```bash
npm install
```
*(แนะนำให้ใช้ **Node.js 24+**)*

### 2. ตั้งค่าตัวแปรสภาพแวดล้อม (Environment Variables)
คัดลอกไฟล์ `.env.example` เป็น `.env` และระบุค่า:
```env
VITE_LIFF_ID=your_liff_id_here
VITE_API_BASE_URL=https://your-supabase-project.functions.supabase.co
```

---

## 💻 คำสั่งสำหรับนักพัฒนา (Development)

| คำสั่ง | รายละเอียด |
|---|---|
| `npm run dev` | รัน Local Development Server (Hot Reload) |
| `npm run build` | รวมไฟล์และย่อขนาดสำหรับ Production ไว้ในโฟลเดอร์ `dist/` |
| `npm run preview` | พรีวิวไฟล์ Build ในเครื่อง |

---

## 📦 การ Deploy (Deployment)

โปรเจกต์นี้ตั้งค่า CI/CD Deploy ไปที่ **GitHub Pages** อัตโนมัติผ่าน GitHub Actions (`.github/workflows/deploy.yml`):

1. ตั้งค่า Secrets ใน GitHub Repository (**Settings > Secrets and variables > Actions**):
   - `VITE_LIFF_ID`
   - `VITE_API_BASE_URL`
2. ตั้งค่า GitHub Pages (**Settings > Pages**):
   - Build and deployment source: **GitHub Actions**
3. เมื่อ Push โค้ดไปที่ Branch `main` ระบบจะทำการ Build และ Deploy ให้อัตโนมัติ

---

## 📚 เอกสารเพิ่มเติม (Documentation)

- 📜 **[CHANGELOG.md](CHANGELOG.md)**: ประวัติการเปลี่ยนแปลงและ Release Notes แต่ละเวอร์ชัน
- 🤖 **[AGENTS.md](AGENTS.md)**: กฎเกณฑ์การพัฒนา โครงสร้างสถาปัตยกรรม และ API Payload Contracts สำหรับ AI Agents และผู้ร่วมพัฒนา

---
*จัดทำและดูแลรักษาโดยทีม Antigravity*
