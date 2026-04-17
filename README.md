# FabricaTech MES — Industrial Intelligence Dashboard

![Status](https://img.shields.io/badge/Status-Online-brightgreen?style=flat-square) ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

**Live Demo:** [https://abhaanisha.github.io/fabricatech-mes/](https://abhaanisha.github.io/fabricatech-mes/)

A high-fidelity Human-Machine Interface (HMI) simulating a real-world **Manufacturing Execution System (MES)**. Developed as an academic submission for **MN204 HMI** at the Indian Institute of Science.

---

## 🎓 Academic Details

| Field | Detail |
|---|---|
| **Course** | MN204 — Human-Machine Interface |
| **Professor** | Dr. Pradipta Biswas, IISc |
| **Submitted By** | Abha Singh Sardar · SR No. 27086 |

---

## 🔐 Login Credentials

Use any of the following pre-authorized credentials at the Safety Checkpoint:

| Employee ID | Access Code | Role |
|---|---|---|
| **A27086** | `Shift#1A` | Senior Operations (Day Shift) |
| **B99452** | `Auth#99B` | Plant Manager |
| **C10293** | `Ctrl!44C` | QA Auditor |
| **M44556** | `Maint@12M` | Maintenance Lead |

> New operators can self-register via the **New Operator Registration** portal. Registered accounts are immediately usable at login.

---

## 🗺️ Application Flow

The HMI follows a strict, linear industrial workflow across **7 distinct pages**:

![Application Flow](hmi_flow.png)

### Step-by-Step

1. **Safety Checkpoint (Login)** — Operator enters a 6-character Employee ID and an Access Code with live validation. Unauthorized access is blocked.

2. **New Operator Registration** — New operators fill a multi-field registration form with real-time field-by-field validation:
   - Name (letters only), Email (`@fabtech.com` domain), 10-digit phone
   - Hierarchical dropdowns: Department → Role (roles are filtered by department)
   - Unique Employee ID, and a strict password (6–12 chars, must contain uppercase, lowercase, numeral, and special character)

3. **Production Dashboard** — The command center. Displays live-updating KPIs (OEE, Availability, Performance, Quality Yield), real-time machine telemetry (temperature, line speed, vibration), the active Shift Jobs Queue, and predictive failure alerts.

4. **Work Order Creation** — Operator assigns a production job by inputting a Part Number, Batch Code (validated format), and selecting a priority level (Low / Medium / High / Critical). The job is added to the Shift Queue.

5. **Quality Assurance Audit** — Operator selects a pending Work Order and submits an inspection result (Pass/Fail), selecting a defect classification and adding inspection notes (max 200 chars, live character counter). A failed job immediately locks the target machine.

6. **Safety Control — LOTO** — All machine lockouts triggered by failed QA audits are listed here. Operators physically verify and then click "Resolve & Unlock" to clear the LOTO tag and bring the machine back online.

7. **Shift Analytics Report** — A live-calculated summary of the full shift: units loaded, quality yield %, QA rejects, cycle time, and a telemetry snapshot with animated progress bars.

8. **Help & FAQ** — Available to all users (authenticated or not). Explains login flow, the standard workflow, LOTO resolution, and theme switching.

---

## 🚀 Tech Stack

- **Framework:** React 18 + TypeScript (Vite)
- **Styling:** Tailwind CSS + custom design tokens
- **Animation:** Vanta.js (Net effect — Login & Registration pages only)
- **State:** React hooks (`useState`, `useEffect`, `useRef`)
- **Icons:** Lucide React

---

*Built iteratively for MN204 HMI · Indian Institute of Science*
