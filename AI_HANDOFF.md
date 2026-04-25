# AI Handoff: Insurance LIFF Project Status (V4.4.0: Category Migration & API Cleanup)

## 📌 Project Overview
โปรเจกต์ระบบการยื่นคำขอเช็คเบี้ยประกันภัยผ่านแพลตฟอร์ม LINE LIFF App เวอร์ชัน V4.4.0 เน้นการปรับปรุงโครงสร้างข้อมูลหมวดหมู่ (Category Migration) โดยการเปลี่ยนจากการใช้ Sub-Categories เป็น Categories โดยตรง เพื่อลดความซับซ้อนของข้อมูล

---

## 🟢 Current Status (อัปเดตสถานะ V4.4.0)

### 1. Category Migration (New!)
- **Load Categories API**: เปลี่ยนการดึงข้อมูลจาก `/load-sub-categories` เป็น `/load-categories`
- **Dynamic Field Mapping**: ปรับให้ใช้ `category_id` และ `categoryName` เป็นฟิลด์หลักแทนโครงสร้างเดิม
- **Submission Payload**: อัปเดตการส่งข้อมูลไปยัง API `/submit-policy` โดยใช้ Key `category_id` แทน `sub_category_id`

### 2. UI/UX Synchronization
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

---

## 🚀 Workflow สำหรับผู้รับช่วงต่อ

### การจัดการ API ใหม่
- **GET `/load-categories`**: ต้องส่งกลับข้อมูลในรูปแบบ `{"results": [{ "category_id": "xxx", "categoryName": "xxx" }]}`
- **POST `/submit-policy`**: เปลี่ยนการรับค่าจาก `sub_category_id` เป็น `category_id`

---
*Last Updated: 2024-04-25 (V4.4.0: Category Migration & API Cleanup)*
