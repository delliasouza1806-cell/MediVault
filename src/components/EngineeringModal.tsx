import React, { useState } from 'react';
import {
  X,
  Terminal,
  Database,
  ShieldCheck,
  Cpu,
  BookOpen,
  Copy,
  Check,
  Layers,
  Code2,
  FileCheck2,
  Lock,
} from 'lucide-react';

interface EngineeringModalProps {
  onClose: () => void;
}

export const EngineeringModal: React.FC<EngineeringModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'pitch' | 'qa' | 'schema' | 'security' | 'resume'>('pitch');
  const [copiedResume, setCopiedResume] = useState(false);

  const resumeBullet =
    'Built a full-stack healthcare platform (React, Node, PostgreSQL) with role-based auth, OCR-based report parsing, LLM-generated report summaries, and appointment scheduling; deployed with Docker.';

  const handleCopyResume = () => {
    navigator.clipboard.writeText(resumeBullet);
    setCopiedResume(true);
    setTimeout(() => setCopiedResume(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  B.E. Computer Science & Engineering
                </span>
                <span className="text-xs text-slate-400">Campus Placements & SDE-1 Technical Defense</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">MediVault Engineering Architecture & Defense</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-slate-800 bg-slate-950/40 flex items-center space-x-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('pitch')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 ${
              activeTab === 'pitch'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>2-Min Recruiter Pitch</span>
          </button>

          <button
            onClick={() => setActiveTab('qa')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 ${
              activeTab === 'qa'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Placement Interview Q&A (TCS / Infosys / Startups)</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 ${
              activeTab === 'schema'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>PostgreSQL DDL & Schemas</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AES & SHA-256 Security</span>
          </button>

          <button
            onClick={() => setActiveTab('resume')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 ${
              activeTab === 'resume'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Resume & ATS Keywords</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: 2-MINUTE RECRUITER PITCH */}
          {activeTab === 'pitch' && (
            <div className="space-y-4">
              <div className="bg-slate-800/50 border border-slate-700/80 rounded-xl p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  Target Timing: 120 Seconds Flat
                </span>
                <h3 className="text-sm font-bold text-white mt-1">
                  How to Walk Through MediVault in an Interview
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Designed for campus placement technical panels (TCS Prime/Digital, Infosys DSE, Cognizant GenC Next, Wipro Turbo) and SDE-1 hiring managers.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                {/* 0 - 20s */}
                <div className="bg-slate-800/30 border border-slate-700/60 p-4 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-indigo-400 font-bold">
                    <span>0:00 - 0:20 | The Problem & The Stack</span>
                    <span className="font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded">Intro</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    "I built <strong>MediVault</strong>, a full-stack healthcare platform using <strong>React, Node/Express, and PostgreSQL</strong>. It solves two critical real-world problems: diagnostic PDF reports are confusing for patients, and sharing medical files over unencrypted channels causes serious privacy leaks."
                  </p>
                </div>

                {/* 20 - 45s */}
                <div className="bg-slate-800/30 border border-slate-700/60 p-4 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-indigo-400 font-bold">
                    <span>0:20 - 0:45 | Role-Based Access Control (RBAC) & Secure Vault</span>
                    <span className="font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded">Security</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    "We have two roles: Patient and Doctor. I merged my secure file-sharing project directly into the medical reports module. Patients own their files, which are encrypted at rest with <strong>AES-256-GCM</strong> and verified via <strong>SHA-256 checksums</strong>. Doctors can only see reports explicitly granted to them."
                  </p>
                </div>

                {/* 45 - 80s */}
                <div className="bg-slate-800/30 border border-slate-700/60 p-4 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-indigo-400 font-bold">
                    <span>0:45 - 1:20 | OCR Extraction & Gemini Report Explainer</span>
                    <span className="font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded">AI & Extraction</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    "When a report is uploaded, OCR extracts clinical parameters like <em>Fasting Blood Sugar</em> and <em>HbA1c</em> into a structured relational table, flagging out-of-range values. We then pass this to <strong>Google Gemini 3.8 Flash</strong> to generate plain-language explanations with clear questions for the doctor—safeguarded by strict non-diagnostic disclaimers."
                  </p>
                </div>

                {/* 80 - 120s */}
                <div className="bg-slate-800/30 border border-slate-700/60 p-4 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-indigo-400 font-bold">
                    <span>1:20 - 2:00 | Conflict-Free Booking & Health Timeline</span>
                    <span className="font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded">Full-Stack Core</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    "To make it a true production app, we have appointment scheduling with <strong>atomic slot conflict checks</strong> preventing double-booking, and a longitudinal health timeline tracking biomarkers over multiple months. The entire app is dockerized for seamless deployment."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PLACEMENT INTERVIEW DEFENSE Q&A */}
          {activeTab === 'qa' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {/* Q1 */}
                <div className="bg-slate-800/40 border border-slate-700/70 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-teal-300">
                    Q1: "Why PostgreSQL over MongoDB for a healthcare and appointment platform?"
                  </h4>
                  <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
                    <p>
                      <strong>Core DBMS Answer:</strong> "Healthcare data has rigid relational constraints and requires strict ACID compliance. Appointment booking is a classic concurrency problem: two patients booking the same doctor slot at the same second must not result in double-booking."
                    </p>
                    <p className="text-slate-400">
                      "In PostgreSQL, a composite unique constraint <code>UNIQUE (doctor_id, appointment_date, time_slot)</code> enforces this at the storage engine level with row-level locking. In MongoDB, preventing double-booking requires distributed locking or multi-document transactions with higher overhead. Also, medical audits require relational integrity with Foreign Keys and CASCADE rules."
                    </p>
                  </div>
                </div>

                {/* Q2 */}
                <div className="bg-slate-800/40 border border-slate-700/70 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-teal-300">
                    Q2: "What if the OCR misreads a clinical value (e.g. 11.2 as 1.2 or 71.2)?"
                  </h4>
                  <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
                    <p>
                      <strong>Engineering Safety Guard:</strong> "We built a 3-tier validation pipeline:
                    </p>
                    <ul className="list-disc pl-5 text-slate-400 space-y-1">
                      <li><strong>Physiological Range Filters:</strong> Biological bounds check (e.g., human hemoglobin cannot be 0.2 or 80.0 g/dL). Extreme anomalies are flagged for manual review.</li>
                      <li><strong>Human-in-the-Loop Review:</strong> The extracted table is displayed next to the raw OCR text so the user or doctor can verify and override values before saving.</li>
                      <li><strong>Ground Truth Preservation:</strong> The original encrypted file and raw text buffer are permanently preserved so doctors always have the authoritative source document."</li>
                    </ul>
                  </div>
                </div>

                {/* Q3 */}
                <div className="bg-slate-800/40 border border-slate-700/70 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-teal-300">
                    Q3: "How do you protect patient data from being leaked or tampered with?"
                  </h4>
                  <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
                    <p>
                      <strong>Security Architecture:</strong> "We implement defence-in-depth across three layers:
                    </p>
                    <ul className="list-disc pl-5 text-slate-400 space-y-1">
                      <li><strong>Encryption at Rest:</strong> Files are stored as encrypted blobs using <strong>AES-256-GCM</strong> with an authenticated Galois tag.</li>
                      <li><strong>Tamper-Evidence:</strong> A <strong>SHA-256 cryptographic digest</strong> is computed at ingest. Our audit endpoint verifies this hash prior to rendering to detect any unauthorized data modifications.</li>
                      <li><strong>Granular RBAC:</strong> Even authenticated doctors cannot access a patient's records unless the patient explicitly grants access or attaches the report to a consultation."</li>
                    </ul>
                  </div>
                </div>

                {/* Q4 */}
                <div className="bg-slate-800/40 border border-slate-700/70 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-teal-300">
                    Q4: "How does the AI report explainer avoid giving dangerous medical diagnoses?"
                  </h4>
                  <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
                    <p>
                      <strong>Prompt Guardrails:</strong> "The system prompt explicitly commands the model: <em>'You are a health literacy explainer. Never provide diagnostic claims (e.g. Do not say You have diabetes) and never prescribe medication.'</em> The output is strictly formatted into What This Measures, Key Findings in Plain Language, Lifestyle Context, and Questions to Ask Your Doctor, backed by a mandatory non-diagnostic clinical disclaimer."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: POSTGRESQL DDL & SCHEMAS */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="bg-slate-800/40 border border-slate-700/80 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  PostgreSQL Production DDL Schema (3rd Normal Form)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Structured with primary keys, foreign key constraints with ON DELETE CASCADE, unique composite indices, and check constraints.
                </p>
              </div>

              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-teal-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[400px]">
{`-- 1. Users Table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor')),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Medical Reports Table
CREATE TABLE medical_reports (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    lab_name VARCHAR(150) NOT NULL,
    report_date DATE NOT NULL,
    file_sha256_hash CHAR(64) NOT NULL,
    encryption_algorithm VARCHAR(30) DEFAULT 'AES-256-GCM',
    key_fingerprint VARCHAR(64) NOT NULL,
    raw_ocr_payload TEXT NOT NULL,
    ai_summary_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Extracted Biomarkers
CREATE TABLE extracted_metrics (
    id VARCHAR(36) PRIMARY KEY,
    report_id VARCHAR(36) NOT NULL REFERENCES medical_reports(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    measured_value NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    reference_range VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('normal', 'low', 'high', 'critical'))
);

-- 4. Appointment Booking Table (With Atomic Slot Conflict Prevention)
CREATE TABLE appointments (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    reason TEXT NOT NULL,
    attached_report_id VARCHAR(36) REFERENCES medical_reports(id) ON DELETE SET NULL,
    doctor_clinical_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_doctor_timeslot UNIQUE (doctor_id, appointment_date, time_slot)
);

-- Indexes for Fast Query Retrieval
CREATE INDEX idx_reports_patient ON medical_reports(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id, appointment_date);`}
              </pre>
            </div>
          )}

          {/* TAB 4: SECURITY & CRYPTO */}
          {activeTab === 'security' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-800/50 border border-slate-700/80 p-4 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <Lock className="w-4 h-4" />
                  <span>AES-256-GCM Symmetric Envelope Encryption</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Every uploaded report is encrypted with a unique data encryption key (DEK) and 96-bit initialization vector (`IV`). The Galois Counter Mode ensures authenticated encryption, making undetectable ciphertext tampering mathematically impossible.
                </p>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/80 p-4 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-teal-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>SHA-256 Checksum Tamper Ledger</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  The SHA-256 cryptographic hash creates a unique 256-bit fingerprint of the document content. During integrity audits, our API recalculates the hash over the stored payload. A single modified bit changes the entire hash digest, guaranteeing tamper detection.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: RESUME & ATS KEYWORDS */}
          {activeTab === 'resume' && (
            <div className="space-y-4">
              <div className="bg-slate-800/50 border border-slate-700/80 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Ready-to-Use Resume Project Bullet Point
                  </span>
                  <button
                    onClick={handleCopyResume}
                    className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg transition"
                  >
                    {copiedResume ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedResume ? 'Copied!' : 'Copy to Clipboard'}</span>
                  </button>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-200 text-xs font-mono leading-relaxed">
                  "{resumeBullet}"
                </div>
              </div>

              <div className="bg-slate-800/30 border border-slate-700/60 p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Target ATS Keyword Optimization
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'React 19',
                    'Node.js',
                    'Express REST API',
                    'PostgreSQL',
                    'Database Constraints',
                    'Role-Based Access Control (RBAC)',
                    'AES-256 Encryption',
                    'SHA-256 Integrity Hash',
                    'Optical Character Recognition (OCR)',
                    'Google Gemini API',
                    'LLM Guardrails',
                    'Concurrency Control',
                    'Docker Containerization',
                    'TypeScript',
                  ].map((kw) => (
                    <span
                      key={kw}
                      className="px-2.5 py-1 bg-slate-800 text-slate-300 text-[11px] rounded-lg border border-slate-700 font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between text-xs text-slate-400">
          <span>Prepared for B.E. Computer Science Campus Technical Rounds</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
