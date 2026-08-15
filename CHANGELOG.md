# Changelog

All notable changes to the **Insurance LIFF** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-08-15

### Added
- **Issued Policies Endpoint Integration (`GET /load-policies`)**:
  - Added `searchPolicies` in `src/utils/api.js` to query closed/issued insurance policies for renewals.
  - Enhanced `PolicySearch.jsx` with `searchMode="policies"` to search issued policies for renewals and `searchMode="quotations"` for new quotes and additional document uploads.
  - Rendered rich policy card items in search results showing policy ID (`policyId`, e.g. `P202608001`), insurer company, product, and policy expiry date.
  - Linked selected policy record in `BasicInfoSection.jsx` with badge indicator (`🛡️ P202608001`) and auto-populated previous expiry date (`policyExpiryDate`).
  - Extracted and forwarded `previous_policy_id` (`policyId`) in `usePolicySubmit.js` to `POST /submit-quotation` establishing clear renewal lineage.

- **Quotation Sub-Type Switcher**: Added sub-intent pill switcher (`✨ งานใหม่ (New)` vs `🔄 งานต่ออายุ (Renewal)`) under the Quotation workflow in `PurposeSelector.jsx`.
- **License Plate Transfer Resolution (สลับป้ายทะเบียนใส่คันใหม่)**:
  - Enabled 1-click `🚗✨ สลับป้ายใส่คันใหม่` resolution when searching an existing plate that has been transferred to a different vehicle.
  - Automatically resets old vehicle cascade data, bypasses duplicate quotation locking, and appends a `[หมายเหตุ: สลับป้ายทะเบียนจากคันเดิม]` tag.
  - Provides a 1-click cancel button to revert plate transfer mode if needed.
- **Dynamic Renewal Dropzone Prioritization**:
  - Automatically re-orders and visually highlights **"เบี้ยต่ออายุ / ใบเตือนต่ออายุ"** and **"กรมธรรม์เดิม"** dropzones with `แนะนำสำหรับงานต่ออายุ` badges when in Renewal mode.
- **1-Click Renewal Reminder Presets**:
  - Added quick reminder calculation chips (`60 วัน`, `45 วัน (แนะนำ)`, `30 วัน`, `15 วัน` before expiry) in `ReminderSection.jsx`.
  - Added subtle 1-click reminder prompt when an expiration date is provided in renewal mode.
- **Cross-Year Historical Policy Search**:
  - Enhanced `PolicySearch.jsx` and `BasicInfoSection.jsx` to perform unrestricted cross-year searches for renewals while preserving current-year duplicate filtering for new quotations.
- **Backend Renewal API Integration**:
  - Integrated `GET /load-quotation-types` in `api.js` and cached in `useReferenceData.js` for dynamic sub-type options.
  - Attached `quotation_type_id` and `previous_policy_id` into FormData in `usePolicySubmit.js` for `POST /submit-quotation` and `POST /update-quotation`.
  - Added `quotationTypeName` badges (`งานใหม่` / `งานต่ออายุ`) to search result cards in `PolicySearch.jsx`.
- **Dynamic Action Button Labels**:
  - Submit button dynamically indicates intent (`ส่งข้อมูลเช็คเบี้ย`, `ส่งข้อมูลเช็คเบี้ยต่ออายุ`, or `ส่งข้อมูลแจ้งงานสำเร็จ`).


## [1.0.0] - 2026-08-15

### Added
- **Core Insurance Quotation Workflows**:
  - **New Quotation (`quotation`)**: Request insurance quotations with vehicle/customer details and attached documents via `POST /submit-quotation`.
  - **Additional Documents (`additional_docs`)**: Submit supplemental files for existing quotation records via `POST /update-quotation`.
  - **Success Job (`success`)**: Submit closed policies with financial information, insurer, product, agent commission, withholding tax, and payment methods via `POST /submit-policy`.
- **100% Semantic String Slug Primary Keys**: Standardised all master data entities to use meaningful string slugs (`'viriyah'`, `'srikrung'`, `'motor_class1'`, `'motor'`, `'cash'`, `'credit_card'`, `'cash_installment'`, `'follow_case'`, `'1+++'` – `'6'`) without numeric auto-increment IDs.
- **Cascading Vehicle Selection**: Dynamic Year $\rightarrow$ Make $\rightarrow$ Model cascading selection for Motor insurance (`categoryId === 'motor'`) via Edge Functions (`/load-vehicle-years`, `/load-vehicle-makes`, `/load-vehicle-models`).
- **Non-blocking Background Upload**: Form resets immediately on submission, while file compression and multipart upload run in the background.
- **Upload Toast Indicators & Session Drawer**: Floating stack of live upload progress toasts and a session history drawer with in-place retry support.
- **Concurrency & Duplicate Protection**:
  - Automatically disables submit button and warns when a registration is actively being uploaded (`status === 'loading'`).
  - Real-time duplicate registration soft-block for quotations created within the current Gregorian year (`/load-quotations?year=YYYY`).
  - Search combobox locks items currently in the upload queue with a `⏳ Processing` label.
- **Smart Registration Combobox**: Unified registration search with auto-detection for existing records and automatic workflow switching.
- **Form State Isolation & Auto-Reset**:
  - Auto-resets all fields upon category change while preserving Submission Purpose and Informing Agent.
  - Full reset on Submission Purpose switch to prevent cross-contamination between workflows.
  - Strict state separation between Quotation comments (`notes`) and Policy notes (`policyNotes` / `policy_notes`).
- **Draft Persistence**: Auto-saves form progress to LocalStorage (`insurance_liff_form_draft`) to prevent accidental data loss.
- **Interactive Document Gallery**: Fullscreen image preview modal with keyboard navigation (Arrow keys, Escape) and page index indicator.
- **Clipboard & Multiple Attachments**: Support for multi-file Drag & Drop and `Ctrl+V` clipboard image pasting with automatic append.
- **Renewal Reminders**: Automated 60-day renewal reminder calculation with customizable notification templates.
- **Authentication & Centralized API**:
  - LIFF SDK integration with Bearer ID token attachment via `authenticatedFetch`.
  - Automatic session recovery and re-authentication on 401/403 responses.
