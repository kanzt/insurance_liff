# Changelog

All notable changes to the **Insurance LIFF** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

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
