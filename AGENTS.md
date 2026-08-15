# 🤖 AGENTS.md — Project Rules & AI Agent Guidelines

> **Project**: Insurance LIFF (Document Submission & Quotation System)  
> **Current Version**: `V1.0.0` (Initial Release)  
> **Target Platform**: LINE LIFF App (Mobile & Web)  
> **Architecture**: Preact + Vite + Tailwind CSS v4 + Supabase Edge Functions  

---

## 🎯 1. Project Purpose & Scope

Insurance LIFF is a high-speed, mobile-first LINE LIFF web application designed for insurance agents to request quotations, submit additional documents, and record closed policies. 

### Core Workflows:
1. **New Quotation (`quotation`)**: Submit vehicle/insured information and attached documents to request insurance premiums (`POST /submit-quotation`).
2. **Additional Documents (`additional_docs`)**: Attach supplemental files to an existing quotation record (`POST /update-quotation`).
3. **Success Job (`success`)**: Record closed policies, financial figures (premium, actual paid / installments), withholding tax, agent commission, and issue reminders (`POST /submit-policy`).

---

## 🏗️ 2. Technology Stack & Environment

| Layer | Technology | Key Constraints / Notes |
|---|---|---|
| **Framework** | **Preact** (`preact@^10.29.1`) | Use Preact conventions (e.g. `class` attribute in JSX, `h` from `preact`). Small, ultra-fast bundle footprint. |
| **Build Tooling** | **Vite** (`vite@^8.0.4`) | Base path configured as `/insurance_liff/` in `vite.config.js` for GitHub Pages hosting. Node.js 24+ recommended. |
| **Styling** | **Tailwind CSS v4** (`@tailwindcss/vite`) | CSS-first configuration. Use consistent palette (Slate, Brand teal/cyan gradient, Amber warnings, Emerald success). |
| **Platform SDK** | **LINE LIFF SDK** (`@line/liff@^2.28.0`) | Handles user identity and Bearer ID Tokens. External browser fallback via `liff.login()`. |
| **Backend API** | **Supabase Edge Functions** | REST endpoints with Bearer Token verification. |

---

## 📐 3. System Architecture & Code Organization

The codebase strictly enforces **Separation of Concerns** using Custom Hooks and modular Sub-components.

```
src/
├── App.jsx                     # Top-level LIFF init, auth guard, toast & gallery modals
├── main.jsx                    # Preact entry point
├── components/
│   ├── PolicyForm.jsx          # Main Orchestrator component (NO direct business logic)
│   ├── PolicyForm/
│   │   ├── PurposeSelector.jsx     # Quotation vs Additional Docs vs Success switch
│   │   ├── BasicInfoSection.jsx    # Plate search, agent, category, vehicle cascading
│   │   ├── ReminderSection.jsx     # Renewal reminder date & template selection
│   │   ├── SuccessFlowSection.jsx  # Financial fields, company, product, commission, tax
│   │   └── AttachmentSection.jsx   # Drag & drop uploaders and file lists
│   ├── AgentSearch.jsx         # Debounced agent lookup combobox
│   ├── Dropzone.jsx            # Multi-file drag-and-drop & clipboard paste (Ctrl+V)
│   ├── PolicySearch.jsx        # Quotation search combobox with active status indicators
│   └── SearchableSelect.jsx    # Reusable fuzzy-search dropdown
├── hooks/
│   ├── useReferenceData.js     # Master data loading & 24h caching
│   ├── usePolicyFormState.js   # Form state, Draft persistence, Reset & Switching logic
│   ├── usePolicySubmit.js      # Non-blocking submission, compression, retry mechanism
│   └── useVehicleData.js       # Cascading vehicle years, makes, and models
└── utils/
    └── api.js                  # Centralized HTTP client with Bearer token & session recovery
```

---

## 📜 4. Core Engineering Rules & Invariants

All agents and contributors **MUST** follow these non-negotiable rules:

### 1. 100% Semantic String Slug Primary Keys
- **Rule**: Never use numeric IDs (e.g. `1, 2, 3`) for Master Data. All master data entities must use semantic string slugs:
  - Categories: `'motor'`, `'non_motor'`
  - Companies: `'viriyah'`, `'dhipaya'`, `'bangkok'`, `'tokiomarine'`
  - Products: `'motor_class1'`, `'motor_class2'`, `'motor_compulsory'`
  - Payment Methods: `'cash'`, `'credit_card'`, `'cash_installment'`
  - Broker Channels: `'srikrung'`, `'direct'`
  - Member Levels: `'1+++'`, `'1++'`, `'1+'`, `'1'`, `'2'`, `'3'`, `'4'`, `'5'`, `'6'`
  - Templates: `'follow_case'`, `'quotation_confirm'`, `'check_transfer'`
- **Compatibility**: Provide fallback handling when parsing incoming API responses (`categoryId || category_id`).

### 2. PolicyForm is Strictly an Orchestrator
- `PolicyForm.jsx` **must only orchestrate**. Do not write direct API calls, large state objects, or complex validations inside `PolicyForm.jsx`.
- Always pass state, setters, and actions cleanly as grouped objects (`state={state} setters={setters} actions={actions}`) to child sections.

### 3. Non-blocking UI Upload Pattern
- When the user submits, call `actions.handleReset(false)` immediately to clear the UI so the user can enter the next job without delay.
- The actual compression, FormData building, and upload must execute in the background via `doBackgroundSubmit`.
- Toast notifications (`uploadToasts`) and session history (`uploadHistory`) track progress, duration, retry attempts, and errors.

### 4. Concurrency & Race Condition Protection
- Prevent duplicate submissions for the same registration plate while an upload is pending (`status === 'loading'`).
- The Submit button must be disabled with a notice: *"This registration is currently being processed..."*.
- Search dropdowns must disable and tag pending items with `⏳ Processing`.

### 5. Form State Isolation & Reset Invariants
- **Category Switch**: When the category changes (`handleCategoryChange`), clear the whole form **except** `submissionType` and informing agent (`informerId`/`informerName`). Default category is `'motor'`.
- **Purpose Switch**: When switching submission purpose (`submissionType`), perform a full reset to avoid data cross-contamination between workflows.
- **Notes State Separation**: Strictly separate `notes` (quotation comments) from `policyNotes` (`policy_notes` for success/policy records) to prevent state pollution.

### 6. Cascading Vehicle Selection
- For motor insurance (`categoryId === 'motor'`), cascading selection must occur sequentially:
  $$\text{Year} \rightarrow \text{Make} (\text{filtered by Year}) \rightarrow \text{Model} (\text{filtered by Make \& Year})$$
- Vehicle data must be submitted as independent explicit fields (`vehicle_year`, `vehicle_make`, `vehicle_model`).

### 7. Centralized API & Authentication
- All network requests must go through `authenticatedFetch` in `src/utils/api.js`.
- Always append the LIFF ID token via `Authorization: Bearer <token>`.
- Automatically recover from `401`/`403` status codes by redirecting to LIFF login (with local draft preserved in `localStorage`).

---

## 🗄️ 5. Backend API & Payload Contract

| Frontend State Key | FormData Field | Required Workflow | Notes |
|---|---|---|---|
| `quotationId` | `quotation_id` | Additional Docs | ID of the existing quotation |
| `informerId` | `quoted_by` | All | Informing agent ID |
| `categoryId` | `category_id` | All | Semantic string slug (e.g. `'motor'`) |
| `referenceInput` | `plate_number` | All | Plate number or "ป้ายแดง" |
| `customerName` | `customer_name` | All | Insured customer name |
| `vehicleYear` | `vehicle_year` | Motor only | Vehicle year (e.g. `'2024'`) |
| `vehicleMake` | `vehicle_make` | Motor only | Vehicle make (e.g. `'toyota'`) |
| `vehicleModel` | `vehicle_model` | Motor only | Vehicle model (e.g. `'yaris_cross'`) |
| `endDate` | `previous_policy_expiry_date` | Quotation, Success | Expiry date string |
| `reminderDate` | `reminder_date` | When reminder active | Formatted YYYY-MM-DD |
| `reminderType` | `reminder_type` | When reminder active | Template slug |
| `notes` | `notes` | Quotation, Additional | Quotation notes |
| `policyNotes` | `policy_notes` | Success only | Policy record notes |
| `submitAgentCode` | `submitted_by` | Success only | Closing agent ID |
| `companyId` | `company_id` | Success only | Insurer slug (e.g. `'viriyah'`) |
| `productId` | `product_id` | Success only | Sub-job product slug (e.g. `'motor_class1'`) |
| `premiumAmount` | `premium_amount` | Success only | Total quoted premium |
| `actualPaid` | `actual_paid` | Success (Full pay) | Transferred amount |
| `installmentMonths`| `installment_months` | Success (Installment) | Installment count (1-12) |
| `paymentMethodId` | `payment_method_id` | Success only | Payment method slug |
| `brokerChannelId` | `broker_channel_id` | Success only | Broker channel slug |
| `commissionPercent`| `commission_percent`| Success only | Agent commission rate % |
| `taxRate` | `tax_rate` | Success only | Withholding tax rate % (Default: 10) |
| `files` | `files` | All | Multipart attached documents |

---

## 🔄 6. Release, Versioning & Documentation Rules

### 1. Read CHANGELOG.md Before Starting Work
- Before starting any work on the project, read [CHANGELOG.md](file:///Users/11515079/Work/antigravity/insurance_liff/CHANGELOG.md) first to understand the project's history, what has already been implemented, and what should be done next.
- This initial review is required only once at the beginning of the project/task lifecycle and does not need to be repeated before every individual change.

### 2. CHANGELOG.md Language & Integrity
- **English Only**: [CHANGELOG.md](file:///Users/11515079/Work/antigravity/insurance_liff/CHANGELOG.md) must be written in English only. Any additions or modifications to [CHANGELOG.md](file:///Users/11515079/Work/antigravity/insurance_liff/CHANGELOG.md) must use English.
- **Preserve Existing Details**: When updating [CHANGELOG.md](file:///Users/11515079/Work/antigravity/insurance_liff/CHANGELOG.md), preserve all existing details unless the user explicitly instructs you to remove them. Add new information without deleting, weakening, or contradicting existing information.
- **Identifier Preservation**: Preserve all code identifiers, API endpoints, field names, version numbers, and examples exactly as they currently appear.
- **Structure & Incremental Updates**: Preserve the existing Markdown structure and section hierarchy as much as reasonably possible. Make documentation updates incrementally and only modify the sections relevant to the current change. Do not overwrite or rewrite unrelated sections of the file. Do not remove historical information merely to simplify or reorganize the changelog.

### 3. Semantic Versioning (SemVer)
- Follow Semantic Versioning (SemVer) for the project. The project starts at version `v1.0.0`. Increment the version progressively as changes are introduced.
- Never reset, decrease, or reuse an older version number.
- Select the appropriate version increment based on the scope and impact of each change:
  - **Major (`X.0.0`)**: For breaking or incompatible changes.
  - **Minor (`1.X.0`)**: For backward-compatible new features or significant functionality.
  - **Patch (`1.0.X`)**: For backward-compatible bug fixes, documentation fixes, and other small changes.

### 4. Update CHANGELOG.md for Every Version Change
- Whenever the project version is updated, update [CHANGELOG.md](file:///Users/11515079/Work/antigravity/insurance_liff/CHANGELOG.md) accordingly.
- The changelog entry must document the new version and the relevant changes introduced in that version.
- Continue updating [CHANGELOG.md](file:///Users/11515079/Work/antigravity/insurance_liff/CHANGELOG.md) for every version update unless the user explicitly instructs you not to update it.
- Never update the project version without updating [CHANGELOG.md](file:///Users/11515079/Work/antigravity/insurance_liff/CHANGELOG.md), unless the user explicitly requests an exception.

### 5. Keep README.md Synchronized
- Whenever [CHANGELOG.md](file:///Users/11515079/Work/antigravity/insurance_liff/CHANGELOG.md) is updated, update [README.md](file:///Users/11515079/Work/antigravity/insurance_liff/README.md) accordingly.
- **Thai Language**: [README.md](file:///Users/11515079/Work/antigravity/insurance_liff/README.md) must be written in Thai.
- **Content Requirements**: [README.md](file:///Users/11515079/Work/antigravity/insurance_liff/README.md) must remain synchronized with the current project state and version, including:
  - The project's technology stack.
  - The project's main features.
  - Project installation instructions.
  - Project usage instructions.
  - An overview of changes for each project version.
- When a new version is released, update the version history in [README.md](file:///Users/11515079/Work/antigravity/insurance_liff/README.md) so that it reflects the corresponding information in [CHANGELOG.md](file:///Users/11515079/Work/antigravity/insurance_liff/CHANGELOG.md).
- Keep the README changes focused on the current project state and relevant documentation updates. Do not unnecessarily rewrite unrelated sections.

### 6. Documentation Synchronization Workflow
When introducing a change that affects the project version, follow this strict sequential order:
1. **Review CHANGELOG**: Review the existing [CHANGELOG.md](file:///Users/11515079/Work/antigravity/insurance_liff/CHANGELOG.md).
2. **Determine SemVer Increment**: Determine the appropriate SemVer increment (Major, Minor, or Patch).
3. **Update Version**: Update the project version without decreasing or resetting it.
4. **Update CHANGELOG.md (English)**: Update [CHANGELOG.md](file:///Users/11515079/Work/antigravity/insurance_liff/CHANGELOG.md) in English while preserving all existing information and structure.
5. **Update README.md (Thai)**: Update [README.md](file:///Users/11515079/Work/antigravity/insurance_liff/README.md) in Thai to reflect the current project state and version.
6. **Verify Consistency**: Verify that the version, changelog, and README are consistent with each other. Avoid modifying unrelated documentation or historical records.
7. **Verify Build**: Always run `npm run build` locally before pushing to ensure zero JSX or Tailwind v4 bundle errors.
8. **CI/CD Deployment**: Merges to `main` trigger `.github/workflows/deploy.yml` to publish to GitHub Pages.
