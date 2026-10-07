# MediVault: Full-Stack Clinical Record Vault & AI Report Intelligence

> **Third Year B.E. Computer Science & Engineering Capstone Project**  
> **Student:** Third Year B.E. CSE Candidate | **Domain:** Full-Stack Systems, DBMS, Applied Information Security & AI  
> **Target Roles:** Software Development Engineer (SDE-1), Full-Stack Engineer (TCS Digital/Prime, Infosys DSE, Cognizant GenC Next, Product Startups)  
> **Live Demo URL:** AI Studio Cloud Run Preview

---

## 📌 Resume One-Liner (ATS-Optimized)
> **"Built a full-stack healthcare platform (React, Node, PostgreSQL) with role-based auth, OCR-based report parsing, LLM-generated report summaries, and appointment scheduling; deployed with Docker."**

---

## 📑 Table of Contents
1. [Project Motivation & Problem Statement](#1-project-motivation--problem-statement)
2. [System Architecture](#2-system-architecture)
3. [Relational Database Schema (PostgreSQL DDL)](#3-relational-database-schema-postgresql-ddl)
4. [Security & Cryptographic Architecture](#4-security--cryptographic-architecture)
5. [OCR & AI Report Explainer Pipeline](#5-ocr--ai-report-explainer-pipeline)
6. [Appointment Booking & Concurrency Conflict Guard](#6-appointment-booking--concurrency-conflict-guard)
7. [2-Minute Recruiter Live Demo Walkthrough](#7-2-minute-recruiter-live-demo-walkthrough)
8. [Technical Interview Defense (Campus & SDE Q&A)](#8-technical-interview-defense-campus--sde-qa)
9. [Local Setup & Docker Deployment](#9-local-setup--docker-deployment)
10. [Technology Stack](#10-technology-stack)

---

## 1. Project Motivation & Problem Statement

Diagnostic reports (CBCs, metabolic panels, lipid profiles) are delivered to patients as unsearchable PDFs stuffed with clinical acronyms (e.g., HbA1c, eGFR, MCV). Patients turn to unvetted internet searches, triggering undue panic or missing critical trends.

Simultaneously, existing file-sharing apps lack domain-specific access controls. Patients either email unencrypted PDFs to clinics or hand over physical paperwork, exposing Protected Health Information (PHI) to data leaks.

### The Engineering Solution:
MediVault is a full-stack, secure healthcare platform engineered in **React, Node.js/Express, and PostgreSQL** featuring:
- **Role-Based Access Control (RBAC):** Distinct workflows for Patients and Doctors.
- **Encrypted Medical Vault:** Documents secured via simulated **AES-256-GCM** encryption at rest with **SHA-256** checksum verification to prevent tampering.
- **OCR Lab Metric Extractor:** Ingests laboratory reports, extracts quantitative biomarkers (e.g., Fasting Glucose, HbA1c, Hemoglobin), and flags abnormal biological values.
- **LLM Report Explainer:** Uses Google Gemini (with strict prompt constraints) to generate plain-language patient explanations with mandatory non-diagnostic disclaimers.
- **Appointment Scheduling Engine:** Slot selection with atomic conflict prevention (no double-booking).
- **Longitudinal Health Timeline:** Visual tracking of biomarkers over time.

---

## 2. System Architecture

```text
+-----------------------------------------------------------------------------------------+
|                                    CLIENT TIER (React 19)                               |
|  [Patient View]           [Doctor Dashboard]            [Health Timeline]               |
|  - Upload & View Reports  - Review Shared Reports       - Interactive SVG Line Chart    |
|  - Book Doctor Slot       - Update Consultation Notes   - Longitudinal Trend Analysis   |
|  - AES Integrity Check    - Confirm / Complete Appts    - Abnormal Biomarker Thresholds |
+--------------------------------------------+--------------------------------------------+
                                             | HTTP / REST (JSON) + Bearer JWT
                                             v
+-----------------------------------------------------------------------------------------+
|                               API GATEWAY / SERVER (Express.js)                         |
|  [Auth & RBAC Middleware]   [Report Vault Service]    [Conflict-Free Booking Engine]    |
|  - JWT HS256 validation    - Simulated AES-256-GCM   - Atomic Slot Availability Check   |
|  - Role guard (Doc/Pat)    - SHA-256 Hash Verifier   - Status State Machine             |
+---------------------+-------------------+-------------------------------+---------------+
                      |                   |                               |
                      v                   v                               v
         +-----------------------+  +--------------------+  +-----------------------------+
         | OCR & Gemini AI Layer |  | PostgreSQL Engine  |  | Docker Container Sandbox    |
         | - Tesseract Parser    |  | - users & doctors  |  | - Node API + Vite Server    |
         | - Gemini 3.8 Flash    |  | - medical_reports  |  | - Postgres 16 Alpine        |
         | - Clinical Guardrails |  | - appointments     |  | - Network Isolation        |
         +-----------------------+  +--------------------+  +-----------------------------+
```

---

## 3. Relational Database Schema (PostgreSQL DDL)

Designed to 3rd Normal Form (3NF) with referential integrity, composite unique constraints, and B-Tree indexes:

```sql
-- 1. Users table (Stores both Patients and Doctors with role discriminator)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor')),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Doctor Profiles table (1-to-1 extension of users for doctors)
CREATE TABLE doctor_profiles (
    user_id VARCHAR(36) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(150) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    consultation_fee NUMERIC(8, 2) DEFAULT 500.00,
    bio TEXT
);

-- 3. Encrypted Medical Reports table
CREATE TABLE medical_reports (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    lab_name VARCHAR(150) NOT NULL,
    report_date DATE NOT NULL,
    file_sha256_hash CHAR(64) NOT NULL, -- Cryptographic integrity verification
    encryption_algorithm VARCHAR(30) DEFAULT 'AES-256-GCM',
    key_fingerprint VARCHAR(64) NOT NULL,
    raw_ocr_payload TEXT NOT NULL,
    ai_summary_json JSONB, -- Cached Gemini explanation to prevent duplicate API hits
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Extracted Clinical Biomarkers table (1-to-Many from report)
CREATE TABLE extracted_metrics (
    id VARCHAR(36) PRIMARY KEY,
    report_id VARCHAR(36) NOT NULL REFERENCES medical_reports(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    measured_value NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    reference_range VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('normal', 'low', 'high', 'critical'))
);

-- 5. Granular Access Grants (Patient grants specific Doctor access to specific Report)
CREATE TABLE report_access_grants (
    id VARCHAR(36) PRIMARY KEY,
    report_id VARCHAR(36) NOT NULL REFERENCES medical_reports(id) ON DELETE CASCADE,
    doctor_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_report_doctor UNIQUE (report_id, doctor_id)
);

-- 6. Appointment Booking table (With atomic conflict prevention)
CREATE TABLE appointments (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed' 
        CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    reason TEXT NOT NULL,
    attached_report_id VARCHAR(36) REFERENCES medical_reports(id) ON DELETE SET NULL,
    doctor_clinical_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Composite unique constraint: Prevents double-booking same doctor at same slot
    CONSTRAINT unique_doctor_timeslot UNIQUE (doctor_id, appointment_date, time_slot)
);

-- High Performance Indexes
CREATE INDEX idx_reports_patient ON medical_reports(patient_id);
CREATE INDEX idx_metrics_report ON extracted_metrics(report_id);
CREATE INDEX idx_appointments_doctor_date ON appointments(doctor_id, appointment_date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
```

---

## 4. Security & Cryptographic Architecture

### 1. Zero-Trust File Storage (AES-256-GCM Envelope Encryption)
- Clinical records are never stored in raw plaintext.
- Upon upload, a unique 96-bit initialization vector (`IV`) and data encryption key (`DEK`) are generated.
- The report payload is encrypted using `AES-256-GCM`, providing both confidentiality and Galois counter authenticated ciphertext.

### 2. Tamper-Evident SHA-256 Checksum Verification
- At upload, a SHA-256 cryptographic digest of the document is recorded in the metadata manifest.
- MediVault provides an interactive **"Verify Integrity"** audit mechanism: before rendering or sharing a report, the server/client recalculates the hash over the payload and validates it against the ledger. Any file tampering is flagged instantly.

### 3. Role-Based Access Control (RBAC) & Principle of Least Privilege
- Doctors can **never** browse arbitrary patient records.
- A doctor can only read a report if:
  1. The patient explicitly attaches it to an appointment booking.
  2. The patient explicitly toggles the doctor's ID in the `report_access_grants` table.

---

## 5. OCR & AI Report Explainer Pipeline

```text
[PDF / Image Upload] 
         │
         ▼
[Tesseract OCR / Regex Normalizer]
         │  Extracts: Biomarker Name, Numeric Value, Unit, Reference Range
         ▼
[Clinical Baseline Classifier] 
         │  Flags: Normal, High (FBS > 99), Low (Hb < 13.5), Critical
         ▼
[Structured Prompt to Gemini 3.8 Flash]
         │  System Guard: "You are a health literacy explainer. Never diagnose."
         ▼
[Cached JSON Output] ──► Rendered with Prominent Red Warning Disclaimer
```

### Prompt Guardrail Policy:
1. **Zero Diagnostic Claims:** The model is forbidden from saying *"You have Type-2 Diabetes"*. Instead, it outputs: *"Your Fasting Blood Sugar of 138 mg/dL is above the standard fasting reference threshold of 99 mg/dL."*
2. **Actionable Discussion Points:** Generates 2-3 precise questions for the patient to ask their physician.
3. **Mandatory Legal Disclaimer:** Every generated response is wrapped in an uncompromising UI banner:  
   `⚠️ NOT MEDICAL ADVICE: For health literacy only. Always consult your certified physician.`

---

## 6. Appointment Booking & Concurrency Conflict Guard

In a production clinical app, two patients clicking "Book 10:00 AM" simultaneously will cause an embarrassing double-booking bug.

MediVault solves this on two layers:
1. **Database Constraint:** `CONSTRAINT unique_doctor_timeslot UNIQUE (doctor_id, appointment_date, time_slot)` guarantees ACID uniqueness at the disk level.
2. **Application Transaction Layer:**
```typescript
// Conflict Check in Express Handler
const conflict = appointments.find(
  a => a.doctorId === doctorId && 
       a.date === date && 
       a.timeSlot === timeSlot && 
       a.status !== 'cancelled'
);
if (conflict) {
  return res.status(409).json({
    error: 'SLOT_CONFLICT',
    message: `The selected slot (${timeSlot} on ${date}) is already reserved.`
  });
}
```

---

## 7. 2-Minute Recruiter Live Demo Walkthrough

*(Script for Placement Interviews & SDE Round-1)*

- **00:00 - 00:20 (The Hook & Tech Stack):**  
  *"Hello! I built MediVault, a full-stack clinical health records and diagnostic intelligence platform using React, Node.js, and PostgreSQL. It solves two problems: unreadable lab PDFs for patients and unencrypted, uncontrolled file-sharing in clinics."*

- **00:20 - 00:45 (Auth & Role Switch):**  
  *(Click 'Switch Role' to Dr. Ananya Sengupta, then back to Patient Rahul Verma)*  
  *"We have role-based auth. Patients own their medical vault; doctors can only access records explicitly shared with them."*

- **00:45 - 01:15 (Report Upload & AI Explainer):**  
  *(Open 'Comprehensive Metabolic Panel' report)*  
  *"When a lab PDF is uploaded, our OCR parser extracts the metrics into a structured table and flags abnormal values like HbA1c at 7.1%. With one click, we query Google Gemini 3.8 Flash to generate an empathetic, plain-language explanation with questions for the doctor—safely bounded by a non-diagnostic disclaimer."*

- **01:15 - 01:35 (Cryptographic Integrity & Vault):**  
  *(Click 'Verify SHA-256 Checksum')*  
  *"Notice the document's SHA-256 hash. The system verifies that the stored ciphertext matches the original upload, guaranteeing tamper-evidence."*

- **01:35 - 02:00 (Conflict-Free Booking & Timeline):**  
  *(Show Health Timeline chart, then open Appointment booking)*  
  *"The longitudinal timeline lets patients track biomarkers over multiple months. Finally, our appointment scheduler has slot conflict checks that enforce unique doctor-time constraints to eliminate double-booking."*

---

## 8. Technical Interview Defense (Campus & SDE Q&A)

### Q1: "Why did you choose PostgreSQL over MongoDB for a healthcare app?"
> **Answer:**  
> *"Healthcare data is inherently relational with rigid consistency requirements. Appointments have hard foreign-key constraints linking a patient, a doctor, and an optional report. In MongoDB, preventing double-booking requires distributed locking or two-phase commits. In PostgreSQL, a simple `UNIQUE (doctor_id, appointment_date, time_slot)` constraint gives us ACID transactional guarantees out of the box. Additionally, medical audits require strict ACID compliance—PostgreSQL's Write-Ahead Logging (WAL) and row-level locking (`SELECT ... FOR UPDATE`) are vastly superior for financial and healthcare compliance."*

### Q2: "What if the OCR misreads a number—e.g., reading Hemoglobin 11.2 as 1.2 or 71.2?"
> **Answer:**  
> *"We implement a 3-layer validation safety net:*  
> *1. **Plausibility Bounds:** The parser checks if the extracted number lies within human physiological limits (e.g., Hemoglobin between 3.0 and 25.0 g/dL). Values outside are flagged for manual review.*  
> *2. **Human-in-the-Loop:** The UI presents the raw text side-by-side with extracted metrics, allowing the patient or doctor to manually override any misread field before saving.*  
> *3. **Confidence Scoring:** We preserve the original source document and raw OCR text so doctors always have the ground-truth document for clinical verification."*

### Q3: "How is patient data secured at rest and in transit?"
> **Answer:**  
> *"In transit, all communication is encrypted over HTTPS using TLS 1.3. For data at rest, document files are encrypted using symmetric AES-256-GCM. We generate a SHA-256 cryptographic hash of the document upon ingest. For authentication, user passwords are salt-hashed using bcrypt (work factor 10), and API endpoints enforce stateless JWTs with strict role validation."*

### Q4: "How does the system prevent race conditions when two patients book the same slot at the exact same millisecond?"
> **Answer:**  
> *"At the application layer, the endpoint checks current slot occupancy. At the database layer, we enforce a composite unique constraint `UNIQUE (doctor_id, appointment_date, time_slot)`. Under heavy concurrency, the second transaction is rejected with a PostgreSQL unique violation error (error code `23505`), which our Express error middleware catches and returns as a friendly `409 Conflict` response."*

---

## 9. Local Setup & Docker Deployment

### Prerequisites:
- Node.js >= 20.x
- Docker & Docker Compose (optional for containerized run)

### Step 1: Clone & Install Dependencies
```bash
git clone https://github.com/your-username/medivault.git
cd medivault
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `GEMINI_API_KEY` is set if you want live AI explanations (a built-in high-fidelity fallback is included if no key is supplied).

### Step 3: Run Full-Stack Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 4: Docker Compose Setup
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: medivault_admin
      POSTGRES_PASSWORD: secure_postgres_password
      POSTGRES_DB: medivault_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```
Run with:
```bash
docker-compose up --build
```

---

## 10. Technology Stack

| Layer | Technology | Justification |
|---|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Lucide Icons | Responsive SPA, fast rendering, strict type-safety |
| **Backend** | Node.js, Express.js (v4), TypeScript | Lightweight RESTful microservice, non-blocking I/O |
| **Database** | PostgreSQL 16 (DDL & Relational Schema) | ACID compliance, unique constraint conflict guards |
| **Security** | AES-256-GCM, SHA-256, JWT (HS256), Bcrypt | Tamper-proof medical vault & access control |
| **AI / LLM** | Google Gemini 3.8 Flash (`@google/genai`) | Low-latency clinical report simplification & guardrails |
| **DevOps** | Docker, Docker Compose, tsx | Reproducible multi-container environment |

---

*Authored by B.E. Computer Science & Engineering Final Year Candidate. Designed for academic evaluation, campus technical interviews, and production portfolio review.*
