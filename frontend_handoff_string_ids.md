# 📢 Frontend Handoff: Master Data String/Slug IDs Refactoring

Hello Frontend Agent! 👋

The Backend has officially refactored 4 Master Data tables from **numeric auto-increment IDs** (`1, 2, 3...`) to **semantic String Slug IDs** (e.g. `'motor'`, `'approved'`, `'cash'`, `'kbank'`). 

This change ensures consistent IDs across environments, improves code readability, and makes form payloads self-documenting.

---

## 🛠️ Summary of Changes

| Entity | Old ID Type (Numeric) | New String Slug ID | Possible Values |
| :--- | :---: | :---: | :--- |
| **LIFF Status** (`liff_status`) | `1, 2, 3` | `string` | `'pending'`, `'approved'`, `'rejected'` |
| **Insurance Category** (`insurance_category`) | `1, 2` | `string` | `'motor'`, `'non_motor'` |
| **Payment Method** (`payment_method`) | `1, 2, 3` | `string` | `'cash'`, `'credit_card'`, `'cash_installment'` |
| **Bank** (`bank`) | `1, 2, 3...` | `string` | `'kbank'`, `'scb'`, `'bbl'`, `'ktb'`, `'bay'`, `'ttb'`, `'gsb'` |

---

## 📋 API Impact & Required Frontend Adjustments

### 1. `POST /verify-agent`
- **Old Response:** `{ "liffStatusId": 2 }`
- **New Response:** `{ "liffStatusId": "approved" }`
- ⚠️ **Action Needed:** Update any status checks in your Auth/Protected Route guard:
  ```js
  // Old: if (res.result.liffStatusId === 2)
  // New:
  if (res.result.liffStatusId === 'approved') {
    // Grant access
  }
  ```

---

### 2. `GET /load-insurance-categories`
- **Old Response:** `[ { "categoryId": 1, "categoryName": "Motor" } ]`
- **New Response:** `[ { "categoryId": "motor", "categoryName": "ประกันรถยนต์ (Motor)" } ]`
- ⚠️ **Action Needed:** If select options or category tabs use `categoryId`, expect strings `"motor"` and `"non_motor"`.

---

### 3. `GET /load-payment-methods`
- **Old Response:** `[ { "paymentMethodId": 1, "paymentMethodName": "เงินสด" } ]`
- **New Response:** `[ { "paymentMethodId": "cash", "paymentMethodName": "ชำระเงินสดเต็มจำนวน" } ]`
- ⚠️ **Action Needed:** Select options for payment methods now use `"cash"`, `"credit_card"`, `"cash_installment"`.

---

### 4. `POST /submit-quotation` (Submission Payload)
- **Parameter:** `category_id`
- **Payload Value:** Send `"motor"` or `"non_motor"` (e.g. `formData.append('category_id', 'motor')`).

---

### 5. `POST /submit-policy` (Submission Payload)
- **Parameter:** `payment_method_id`
- **Payload Value:** Send `"cash"`, `"credit_card"`, or `"cash_installment"`.

---

### 6. `GET /load-quotation` & `GET /load-policy` (Data Display)
- `categoryId` in response array items will now return `"motor"` or `"non_motor"`.
- `paymentMethodId` (in policy items) will return `"cash"`, `"credit_card"`, or `"cash_installment"`.

---

## ✅ Summary Checklist for Frontend Developer
- [x] Update LIFF status verification check to compare against `'approved'` instead of `2`.
- [x] Verify dropdown selection state bindings for Category and Payment Method to accept string values.
- [x] Test form submission flow for `submit-quotation` and `submit-policy`.
