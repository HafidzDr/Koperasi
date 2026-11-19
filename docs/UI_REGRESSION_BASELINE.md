# Business Logic & Regression Baseline — Nusantara Maju

**Project:** Nusantara Maju  
**Audit Phase:** PHASE UI-REDESIGN-00 — Task G  
**Current Baseline Commit:** `cc5e3b9` on `feat/phase-7-shu-management`  
**Test Suite Status:** 19 Test Files, 330 Tests Passed (100% PASS)  
**TypeScript Typecheck:** 0 Errors  
**ESLint Quality Check:** 0 Warnings  
**Vite Build:** Clean Production Output  
**Status:** COMPLETE & RECORDED

---

## 1. Core Zustand Stores & Business Invariants

The application contains 8 core Zustand stores. Any future UI redesign **must treat all store business logic, action signatures, and validation schemas as strictly immutable**.

```
+-----------------------------------------------------------------------------------+
|                              8 CORE ZUSTAND STORES                                |
+-----------------------+------------------------+----------------------------------+
| 1. authStore          | 4. savingsStore        | 7. businessUnitStore             |
| 2. configStore        | 5. loanStore           | 8. shuStore                      |
| 3. toastStore         | 6. membershipStore     |                                  |
+-----------------------+------------------------+----------------------------------+
```

### 1.1 `authStore.ts` (Authentication & RBAC Authority)
- **Primary State:** `currentRole: Role`, `currentUser: UserContext`.
- **Protected Actions:** `setRole(role: Role)`, `resetToDefault()`.
- **Roles Governed:**
  - Authenticated: `member`, `staff`, `finance`, `manager`, `super_admin`, `auditor`, `cooperative_chair`, `supervisor`.
  - Public Contexts: `public_visitor`, `applicant`.
- **Invariant:** Role switching triggers reactive re-evaluation of all permitted navigation items, action buttons, and route access checks without page reloading.

### 1.2 `configStore.ts` (Platform Configuration & Active Modules)
- **Primary State:** `config: PlatformConfig` (name, address, contact, activeModules, legal numbers).
- **Protected Actions:** `updateConfig(partial)`, `toggleModule(key)`, `resetConfig()`.
- **Active Business Modules:** `savings`, `loans`, `installments`, `business_units`, `shu`, `meetings`, `notifications`, `reports`, `audit_trail`.
- **Invariant:** Modular architecture allows business modules to be activated/deactivated; routing and navigation must dynamically hide inactive modules fail-closed.

### 1.3 `membershipStore.ts` (Membership Registry & Lifecycle)
- **Primary State:** `applications: MemberApplication[]`, `members: MemberRecord[]`, `savingsConfig`.
- **Lifecycle Machine:**
  `submitted` -> `under_review` (verified by Staff) -> `approved` (by Manager) -> `active` (Member Record created).
- **Strict Invariants:**
  - Simpanan Pokok and Simpanan Wajib input validation rejects empty strings, zero, or negative numbers.
  - Member ID generation follows format `MBR-YYYY-XXXX`.

### 1.4 `savingsStore.ts` (Savings Ledger & Fail-Closed SoD)
- **Primary State:** `accounts: SavingsAccount[]`, `transactions: SavingsTransaction[]`.
- **Fail-Closed Principle:**
  - Every deposit and withdrawal creates an immutable ledger entry.
  - Withdrawals cannot exceed available `simpananSukarela` balance.
  - High-value transactions require Segregation of Duties (Staff/Teller input -> Finance Officer verification -> Manager approval).

### 1.5 `loanStore.ts` (Loan Underwriting & Installment Tracking)
- **Primary State:** `products: LoanProduct[]`, `applications: LoanApplication[]`, `loans: LoanRecord[]`.
- **3-Tier Underwriting Machine:**
  `submitted` -> `under_review` (Staff verification) -> `recommended` (Finance Officer credit analysis) -> `approved` (Manager plafond authorization) -> `disbursed` (Finance Officer disbursement).
- **Installment Invariants:**
  - Exact flat interest calculation: $\text{Bunga} = \text{Pokok} \times \text{SukuBunga} \times (\text{Tenor} / 12)$.
  - Monthly payment: $(\text{Pokok} + \text{Bunga}) / \text{Tenor}$.
  - Late fee calculation: 0.5% per day applied strictly after a 3-day grace period.

### 1.6 `businessUnitStore.ts` (Business Units & Economic Participation)
- **Primary State:** `businessUnits: BusinessUnit[]`, `transactions: BusinessUnitTransaction[]`.
- **Data Privacy Invariant (Phase 6.1 Remediation):**
  - Member actor can only view their own economic participation records.
  - Fallback member IDs (e.g. `DEMO-ID-0001`) are forbidden when unauthenticated.
  - Net surplus dynamically contributes to the annual SHU calculation pool.

### 1.7 `shuStore.ts` (SHU Lifecycle, Allocation Invariants & Distribution)
- **Primary State:** `fiscalYears: FiscalYearRecord[]`, `activeFiscalYearId`, `allocationConfigs`, `memberShuRecords`.
- **Mathematical Invariant (Phase 7.2 Strict Enforcement):**
  $$\sum \text{Allocation Percentages} = \text{Cadangan} + \text{JasaModal} + \text{JasaAnggota} + \text{Pendidikan} + \text{Sosial} + \text{Pengurus} = 100.00\%$$
  Any configuration sum $\ne 100\%$ must fail-closed and be rejected with a descriptive validation error.
- **Distribution Safeguard:**
  Dividends cannot be paid out until the fiscal year status has transitioned: `DRAF` -> `DIHITUNG` -> `DISETUJUI_RAT` -> `DIBAGIKAN`.

### 1.8 `toastStore.ts` (Feedback & Notifications)
- Queue of temporary UI toast notifications (`success`, `danger`, `warning`, `info`) with auto-dismiss timers.

---

## 2. Test Suite & Baseline Execution Verification

An automated verification of all quality gates was performed prior to compiling this report:

### 2.1 Vitest Automated Test Suite Results
```
 Test Files  19 passed (19)
      Tests  330 passed (330)
   Duration  12.50s
```

#### Detailed Test Coverage Matrix:
1. `src/tests/rbac.test.ts` (14 tests) — RBAC authority checks and action permissions.
2. `src/tests/menuVisibility.test.ts` (11 tests) — Navigation item visibility across roles.
3. `src/tests/shuCalculations.test.ts` (24 tests) — SHU mathematical formulas and allocation sums.
4. `src/tests/shuLifecycleAndSoD.test.ts` (28 tests) — SoD verification across fiscal year stages.
5. `src/tests/shuPersistenceAndRecovery.test.ts` (15 tests) — Store rehydration and schema validation.
6. `src/tests/shuComponents.test.tsx` (7 tests) — SHU UI tabs and interaction workflows.
7. `src/tests/membership.test.ts` (28 tests) — Registration lifecycle and state transitions.
8. `src/tests/memberProfilePortal.test.tsx` (5 tests) — Member digital ID and profile viewer.
9. `src/tests/savings.test.ts` (76 tests) — Deposit, withdrawal, and ledger validations.
10. `src/tests/savingsAdmin.test.tsx` (6 tests) — Admin savings queues and approvals.
11. `src/tests/savingsPortal.test.tsx` (5 tests) — Member savings pocket views and modals.
12. `src/tests/loanCalculations.test.ts` (10 tests) — Flat interest, tenor, and installment math.
13. `src/tests/loanRbacAndPrivacy.test.ts` (5 tests) — Privacy and actor-isolated queries.
14. `src/tests/loanDisbursementAndInstallments.test.ts` (14 tests) — Disbursement and repayments.
15. `src/tests/loanLifecycle.test.ts` (28 tests) — 3-tier loan review and status changes.
16. `src/tests/loanComponents.test.tsx` (4 tests) — Public and member loan UI components.
17. `src/tests/businessUnits.test.ts` (36 tests) — Unit creation, revenue, and participation.
18. `src/tests/businessUnitsComponents.test.tsx` (7 tests) — Business unit management UI tabs.
19. `src/tests/platformSettings.test.tsx` (7 tests) — Savings config validation and error states.

### 2.2 TypeScript Typecheck
- Command: `tsc --noEmit`
- Result: **0 errors**.

### 2.3 ESLint Linting
- Command: `eslint "src/**/*.{ts,tsx}" --max-warnings 0`
- Result: **0 warnings, 0 errors**.

### 2.4 Production Build
- Command: `vite build`
- Result: **Exit Code 0 (Successful compilation)**.

### 2.5 Responsive Verification Script
- Command: `node scripts/verify_responsive.js`
- Result: **All 16 viewport scenarios passed with 0 horizontal overflow and 0 element clipping (320px to 1920px)**.

---

## 3. Strict Redesign Regression Boundaries

During future UI redesign phases, the following rules are non-negotiable:
1. **Separation of Visual and Functional Scope:** Visual changes must NOT alter data sources, state models, business logic, calculations, validations, or SoD workflows. Specific findings regarding static mock data (e.g. `recentTransactions` in `MemberDashboardView.tsx`) are recorded as functional backlog items and must NOT be modified during the visual redesign.
2. **Never alter store state structures or action signatures.**
3. **Never modify Zod validation schemas** (e.g. loan application criteria, savings input restrictions, SHU 100% allocation invariant).
4. **Never bypass RBAC or SoD permission gates** (e.g. `canPerformAction`, `canAccessRoute`).
5. **Never hardcode member demo identities** into UI components (respect the Phase 6.1 privacy remediation).
6. **Never change existing test files** to accommodate sloppy UI changes; the UI must conform to existing test assertions.
7. **Strict Brand Consistency:** Brand identity is exclusively **Nusantara Maju**. Do not introduce "PT Nusantara Maju" or make "Koperasi" part of the logo/brand mark.
8. **Maintain 100% test pass rate** (330/330 tests) at the end of every redesign stage.

---

## 4. Change Log — Regression Baseline Remediation (v1.1)

| Section | Correction Implemented | Rationale |
| :--- | :--- | :--- |
| **Section 3.1** | Added explicit rule separating visual styling from functional data changes; prohibited modifying static mock data bindings during visual redesign. | Scope containment and regression protection. |
| **Section 3.7** | Added strict brand naming rule for **Nusantara Maju** in regression boundaries. | Brand consistency compliance. |
| **Section 2** | Confirmed all 19 test suites, typecheck, lint, build, and responsive checks pass 100% at baseline commit `cc5e3b9`. | Verified engineering baseline. |

