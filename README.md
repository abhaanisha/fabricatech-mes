# FabricaTech MES — Industrial Intelligence Dashboard

![FabricaTech MES](https://img.shields.io/badge/Status-Online-brightgreen?style=flat-square) ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

**Live Demo:** [FabricaTech MES](https://abhaanisha.github.io/fabricatech-mes/)

This project is a high-fidelity Human-Machine Interface (HMI) modeling modern Manufacturing Execution Systems (MES). It was designed and developed as an academic assignment for **MN204 HMI**.

## 🎓 Academic Details
* **Course:** MN204 HMI (Human-Machine Interface)
* **Professor:** Dr. Pradipta Biswas, PhD (Associate Professor, Indian Institute of Science)
* **Submitted By:** Abha Singh Sardar (SR. No. 28076)
* **Institution:** Indian Institute of Science (IISc)

## 🔒 Authorized User Credentials
To access the dashboard, operators must clear the initial OSHA Safety Checkpoint using one of the following whitelisted credentials. The `Employee ID` requires an exact 6-character uppercase format.

| Employee ID | Access Code (Password) | Role / Shift Alignment |
| :--- | :--- | :--- |
| **A28076** | **`Shift#1A`** | Senior Operations (Day Shift) |
| **B99452** | **`Auth&99B`** | Plant Manager (Swing Shift) |
| **C10293** | **`Ctrl!44C`** | QA Auditor (Night Shift) |
| **M44556** | **`Maint@12M`** | Maintenance Lead |
| **T88771** | **`Test$77T`** | Test Engineer |

## 🛠️ Application Workflow

The application simulates a strict industrial production pipeline:

1. **Authentication (Safety Checkpoint):** Operators must validate their credentials and pass robust password policies prior to line access.
2. **Dashboard (Production Core):** The primary view offering real-time dynamic machine telemetry, active automated queue monitoring, and predictive failure alerts.
3. **Assigning Jobs (Work Orders):** Operators build and queue new Work Orders, dictating priority scheduling and target part metrics.
4. **Quality Assurance (Auditing):** Parts generated must pass a strict audit. Failed jobs automatically engage safety overrides.
5. **Safety Control (LOTO Management):** If a machine is locked out due to a failed QA audit, engineers must navigate here to resolve the hazard physically, clear the LOTO tag, and free up the system.
6. **Shift Report (Live Analytics):** A live recalculating summary of production run efficiencies driven by real historical data over the course of the shift.

---
*Built iteratively using React, Vite, and TailwindCSS.*
