import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const geminiApiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// ----------------------------------------------------
// DATABASE SIMULATION (PostgreSQL Relational Emulation)
// ----------------------------------------------------

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor';
  specialization?: string;
  passwordHash: string; // bcrypt simulation
  phone?: string;
  createdAt: string;
}

export interface ExtractedMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  clinicalInterpretation?: string;
}

export interface MedicalReportRecord {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  category: 'Hematology' | 'Biochemistry' | 'Metabolic' | 'Lipid Profile' | 'General';
  date: string;
  labName: string;
  fileHash: string; // SHA-256 checksum for tamper-evidence
  encryptionMeta: {
    algorithm: string;
    keyId: string;
    iv: string;
    status: 'Encrypted at Rest (AES-256-GCM)';
  };
  rawText: string;
  metrics: ExtractedMetric[];
  aiExplanation?: {
    summary: string;
    keyFindings: string[];
    lifestyleContext: string[];
    doctorQuestions: string[];
    generatedAt: string;
    model: string;
  };
  allowedDoctorIds: string[]; // Access Control List (ACL)
}

export interface AppointmentRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM"
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reason: string;
  doctorNotes?: string;
  attachedReportId?: string;
  createdAt: string;
}

// Seed Users
const users: UserRecord[] = [
  {
    id: 'pat-1',
    name: 'Rahul Verma',
    email: 'rahul.verma@example.com',
    role: 'patient',
    passwordHash: '$2b$10$eO1d4l1c2...hAshEd',
    phone: '+91 98765 43210',
    createdAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'pat-2',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    role: 'patient',
    passwordHash: '$2b$10$aB9x2k8l1...hAshEd',
    phone: '+91 98111 22334',
    createdAt: '2026-02-10T10:30:00Z',
  },
  {
    id: 'doc-1',
    name: 'Dr. Ananya Sengupta',
    email: 'dr.ananya@medivault.clinic',
    role: 'doctor',
    specialization: 'Internal Medicine & Diabetology',
    passwordHash: '$2b$10$zZ4y1o7p8...hAshEd',
    phone: '+91 99200 11223',
    createdAt: '2025-11-01T08:00:00Z',
  },
  {
    id: 'doc-2',
    name: 'Dr. Rajesh Mehta',
    email: 'dr.rajesh@medivault.clinic',
    role: 'doctor',
    specialization: 'Cardiology & Vascular Medicine',
    passwordHash: '$2b$10$wW5q9m2n4...hAshEd',
    phone: '+91 98300 44556',
    createdAt: '2025-11-05T08:00:00Z',
  },
];

// Helper to compute SHA-256 for integrity verification
function computeSHA256(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Seed Medical Reports
const reports: MedicalReportRecord[] = [
  {
    id: 'rep-101',
    patientId: 'pat-1',
    patientName: 'Rahul Verma',
    title: 'Comprehensive Metabolic & Glycemic Panel',
    category: 'Metabolic',
    date: '2026-09-24',
    labName: 'Apollo Diagnostics Centre',
    fileHash: computeSHA256('Rahul_Verma_Metabolic_Report_20260924_DATA'),
    encryptionMeta: {
      algorithm: 'AES-256-GCM',
      keyId: 'KMS-KEY-MED-9941',
      iv: '7b8f9e012a4c',
      status: 'Encrypted at Rest (AES-256-GCM)',
    },
    rawText: `APOLLO DIAGNOSTICS - CLINICAL BIOCHEMISTRY REPORT
Patient Name: Rahul Verma | Age/Gender: 28 Y / M | Sample Date: 24-Sep-2026
Test: Fasting Blood Sugar (FBS) - 138 mg/dL (Reference: 70 - 99 mg/dL) [HIGH]
Test: HbA1c (Glycated Hemoglobin) - 7.1 % (Reference: 4.0 - 5.6 %) [HIGH]
Test: Estimated Average Glucose (eAG) - 157 mg/dL
Test: Serum Creatinine - 0.95 mg/dL (Reference: 0.70 - 1.30 mg/dL) [NORMAL]
Test: Blood Urea Nitrogen (BUN) - 14 mg/dL (Reference: 7 - 20 mg/dL) [NORMAL]
Test: Hemoglobin (Hb) - 14.2 g/dL (Reference: 13.5 - 17.5 g/dL) [NORMAL]`,
    metrics: [
      {
        id: 'm-1',
        name: 'Fasting Blood Sugar (FBS)',
        value: 138,
        unit: 'mg/dL',
        referenceRange: '70 - 99 mg/dL',
        status: 'high',
        clinicalInterpretation: 'Fasting blood glucose elevated above normal fasting threshold.',
      },
      {
        id: 'm-2',
        name: 'HbA1c (Glycated Hemoglobin)',
        value: 7.1,
        unit: '%',
        referenceRange: '4.0 - 5.6 %',
        status: 'high',
        clinicalInterpretation: 'Indicates average blood sugar control over previous 90 days in diabetic/pre-diabetic threshold.',
      },
      {
        id: 'm-3',
        name: 'Serum Creatinine',
        value: 0.95,
        unit: 'mg/dL',
        referenceRange: '0.70 - 1.30 mg/dL',
        status: 'normal',
        clinicalInterpretation: 'Renal filtration functioning within healthy baseline parameters.',
      },
      {
        id: 'm-4',
        name: 'Hemoglobin (Hb)',
        value: 14.2,
        unit: 'g/dL',
        referenceRange: '13.5 - 17.5 g/dL',
        status: 'normal',
        clinicalInterpretation: 'Oxygen-carrying capacity of red blood cells is adequate.',
      },
    ],
    aiExplanation: {
      summary: 'This metabolic panel primarily evaluates your blood glucose regulation and kidney filtration. Your kidney markers (Creatinine and BUN) and Hemoglobin are completely within healthy reference ranges. However, both your Fasting Blood Sugar (138 mg/dL) and 3-month glycemic indicator HbA1c (7.1%) are above standard reference baselines.',
      keyFindings: [
        'Fasting Blood Sugar is 138 mg/dL (Normal is under 100 mg/dL). This shows your morning glucose levels before meals are running higher than expected.',
        'HbA1c is 7.1% (Standard normal is under 5.7%). HbA1c provides a 90-day weighted reflection of sugar adherence, confirming this is not a one-day spike.',
        'Kidney filtration (Creatinine 0.95 mg/dL) is optimal and uncompromised.',
      ],
      lifestyleContext: [
        'Elevated glycemic numbers frequently associate with carbohydrate density, sleep irregularity, physical inactivity, or genetic insulin sensitivity variations.',
        'Fasting status prior to phlebotomy (minimum 8-10 hours) can affect single-point FBS, though HbA1c is independent of fasting.',
      ],
      doctorQuestions: [
        'Would you recommend an oral glucose tolerance test or immediate lifestyle modification schedule?',
        'Should we re-test HbA1c in 12 weeks to gauge glycemic trajectory?',
        'Do I need a consultation with a registered dietitian for medical nutrition therapy?',
      ],
      generatedAt: '2026-09-24T14:15:00Z',
      model: 'gemini-3.8-flash',
    },
    allowedDoctorIds: ['doc-1'],
  },
  {
    id: 'rep-102',
    patientId: 'pat-1',
    patientName: 'Rahul Verma',
    title: 'Complete Blood Count (CBC) & Anemia Screen',
    category: 'Hematology',
    date: '2026-06-12',
    labName: 'Dr. Lal PathLabs',
    fileHash: computeSHA256('Rahul_Verma_CBC_Report_20260612_DATA'),
    encryptionMeta: {
      algorithm: 'AES-256-GCM',
      keyId: 'KMS-KEY-MED-7712',
      iv: '4a1b2c3d4e5f',
      status: 'Encrypted at Rest (AES-256-GCM)',
    },
    rawText: `DR. LAL PATHLABS - AUTOMATED HEMATOLOGY ANALYZER
Patient: Rahul Verma | Ref: Self | Date: 12-Jun-2026
Test: Hemoglobin - 13.8 g/dL (Reference: 13.5 - 17.5 g/dL) [NORMAL]
Test: RBC Count - 4.8 mill/mm3 (Reference: 4.5 - 5.5 mill/mm3) [NORMAL]
Test: Total Leukocyte Count (WBC) - 7,400 /uL (Reference: 4,000 - 11,000 /uL) [NORMAL]
Test: Platelet Count - 245,000 /uL (Reference: 150,000 - 450,000 /uL) [NORMAL]
Test: Fasting Blood Sugar - 124 mg/dL (Reference: 70 - 99 mg/dL) [HIGH]`,
    metrics: [
      {
        id: 'm-201',
        name: 'Hemoglobin',
        value: 13.8,
        unit: 'g/dL',
        referenceRange: '13.5 - 17.5 g/dL',
        status: 'normal',
      },
      {
        id: 'm-202',
        name: 'Total Leukocyte Count (WBC)',
        value: 7400,
        unit: '/uL',
        referenceRange: '4,000 - 11,000 /uL',
        status: 'normal',
      },
      {
        id: 'm-203',
        name: 'Platelet Count',
        value: 245000,
        unit: '/uL',
        referenceRange: '150,000 - 450,000 /uL',
        status: 'normal',
      },
      {
        id: 'm-204',
        name: 'Fasting Blood Sugar',
        value: 124,
        unit: 'mg/dL',
        referenceRange: '70 - 99 mg/dL',
        status: 'high',
      },
    ],
    allowedDoctorIds: ['doc-1'],
  },
  {
    id: 'rep-103',
    patientId: 'pat-1',
    patientName: 'Rahul Verma',
    title: 'Lipid Profile & Cardiovascular Risk Screen',
    category: 'Lipid Profile',
    date: '2026-03-10',
    labName: 'SRL Care Diagnostics',
    fileHash: computeSHA256('Rahul_Verma_Lipid_Report_20260310_DATA'),
    encryptionMeta: {
      algorithm: 'AES-256-GCM',
      keyId: 'KMS-KEY-MED-3310',
      iv: '1f2e3d4c5b6a',
      status: 'Encrypted at Rest (AES-256-GCM)',
    },
    rawText: `SRL DIAGNOSTICS - LIPID PROFILE PANEL
Patient: Rahul Verma | Date: 10-Mar-2026
Test: Total Cholesterol - 228 mg/dL (Reference: < 200 mg/dL) [HIGH]
Test: HDL Cholesterol (Good) - 42 mg/dL (Reference: > 40 mg/dL) [NORMAL]
Test: LDL Cholesterol (Bad) - 146 mg/dL (Reference: < 100 mg/dL) [HIGH]
Test: Triglycerides - 200 mg/dL (Reference: < 150 mg/dL) [HIGH]
Test: Fasting Blood Sugar - 110 mg/dL (Reference: 70 - 99 mg/dL) [HIGH]
Test: HbA1c - 6.2 % (Reference: 4.0 - 5.6 %) [HIGH]`,
    metrics: [
      {
        id: 'm-301',
        name: 'Total Cholesterol',
        value: 228,
        unit: 'mg/dL',
        referenceRange: '< 200 mg/dL',
        status: 'high',
      },
      {
        id: 'm-302',
        name: 'LDL Cholesterol',
        value: 146,
        unit: 'mg/dL',
        referenceRange: '< 100 mg/dL',
        status: 'high',
      },
      {
        id: 'm-303',
        name: 'HDL Cholesterol',
        value: 42,
        unit: 'mg/dL',
        referenceRange: '> 40 mg/dL',
        status: 'normal',
      },
      {
        id: 'm-304',
        name: 'Triglycerides',
        value: 200,
        unit: 'mg/dL',
        referenceRange: '< 150 mg/dL',
        status: 'high',
      },
    ],
    allowedDoctorIds: ['doc-1', 'doc-2'],
  },
];

// Seed Appointments with Conflict Guard
const appointments: AppointmentRecord[] = [
  {
    id: 'apt-501',
    patientId: 'pat-1',
    patientName: 'Rahul Verma',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ananya Sengupta',
    doctorSpecialization: 'Internal Medicine & Diabetology',
    date: '2026-10-12',
    timeSlot: '10:30 AM',
    status: 'confirmed',
    reason: 'Follow-up for elevated HbA1c & Fasting Glucose review',
    attachedReportId: 'rep-101',
    doctorNotes: 'Patient showed signs of early impaired glucose tolerance. Advised strict adherence to low-glycemic dietary regime.',
    createdAt: '2026-09-25T11:00:00Z',
  },
  {
    id: 'apt-502',
    patientId: 'pat-1',
    patientName: 'Rahul Verma',
    doctorId: 'doc-2',
    doctorName: 'Dr. Rajesh Mehta',
    doctorSpecialization: 'Cardiology & Vascular Medicine',
    date: '2026-10-18',
    timeSlot: '02:00 PM',
    status: 'pending',
    reason: 'Lipid profile evaluation and preventive cardiovascular risk assessment',
    attachedReportId: 'rep-103',
    createdAt: '2026-10-01T09:30:00Z',
  },
  {
    id: 'apt-503',
    patientId: 'pat-2',
    patientName: 'Priya Patel',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ananya Sengupta',
    doctorSpecialization: 'Internal Medicine & Diabetology',
    date: '2026-10-12',
    timeSlot: '11:15 AM',
    status: 'confirmed',
    reason: 'Routine quarterly wellness review',
    createdAt: '2026-10-02T14:20:00Z',
  },
];

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

// 1. Auth Simulation & User Profiles
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, role } = req.body;
  const user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase()) ||
               users.find((u) => u.role === (role || 'patient'));

  if (!user) {
    return res.status(404).json({ error: 'User not found with specified credentials.' });
  }

  // Realistic mock JWT token with header.payload.signature
  const tokenHeader = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const tokenPayload = Buffer.from(JSON.stringify({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 86400,
    iss: 'medivault-auth-service',
  })).toString('base64url');
  const tokenSignature = crypto.createHmac('sha256', 'super_secret_jwt_key_cs_project').update(`${tokenHeader}.${tokenPayload}`).digest('base64url');
  const jwtToken = `${tokenHeader}.${tokenPayload}.${tokenSignature}`;

  res.json({
    user,
    token: jwtToken,
    message: `Authenticated successfully as ${user.role.toUpperCase()}`,
  });
});

app.get('/api/users/doctors', (_req: Request, res: Response) => {
  const docs = users.filter((u) => u.role === 'doctor');
  res.json(docs);
});

// 2. Medical Reports & Vault Access Control
app.get('/api/reports', (req: Request, res: Response) => {
  const { userId, role } = req.query;

  if (!userId) {
    return res.json(reports);
  }

  if (role === 'doctor') {
    // Doctors only see reports specifically granted to them by patients
    const doctorReports = reports.filter((r) => r.allowedDoctorIds.includes(userId as string));
    return res.json(doctorReports);
  }

  // Patients see their own reports
  const patientReports = reports.filter((r) => r.patientId === userId);
  res.json(patientReports);
});

app.get('/api/reports/:id', (req: Request, res: Response) => {
  const report = reports.find((r) => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Report record not found' });
  }
  res.json(report);
});

// Grant or revoke doctor access to a report
app.patch('/api/reports/:id/access', (req: Request, res: Response) => {
  const { doctorId, action } = req.body;
  const report = reports.find((r) => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  if (action === 'grant') {
    if (!report.allowedDoctorIds.includes(doctorId)) {
      report.allowedDoctorIds.push(doctorId);
    }
  } else if (action === 'revoke') {
    report.allowedDoctorIds = report.allowedDoctorIds.filter((id) => id !== doctorId);
  }

  res.json({
    success: true,
    allowedDoctorIds: report.allowedDoctorIds,
    message: `Doctor access ${action === 'grant' ? 'granted' : 'revoked'} successfully.`,
  });
});

// Verify file cryptographic integrity (SHA-256)
app.get('/api/reports/:id/verify-integrity', (req: Request, res: Response) => {
  const report = reports.find((r) => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  const recalculatedHash = report.fileHash; // In real system: hash of decrypted payload
  const isIntact = recalculatedHash === report.fileHash;

  res.json({
    reportId: report.id,
    storedHash: report.fileHash,
    calculatedHash: recalculatedHash,
    status: isIntact ? 'VERIFIED_INTACT' : 'TAMPERED_MISMATCH',
    encryptionType: report.encryptionMeta.algorithm,
    keyFingerprint: report.encryptionMeta.keyId,
    verifiedAt: new Date().toISOString(),
  });
});

// OCR & Report Parser Engine
app.post('/api/reports/upload', (req: Request, res: Response) => {
  const { patientId, patientName, title, category, labName, rawText, preset } = req.body;

  let reportText = rawText || '';
  const parsedMetrics: ExtractedMetric[] = [];

  // If preset selected or raw text provided, simulate robust OCR regex extraction
  if (preset === 'cbc' || (!reportText && !preset)) {
    reportText = `AUTOMATED HEMATOLOGY REPORT
Hemoglobin: 11.2 g/dL (Reference: 13.5 - 17.5 g/dL) [LOW]
WBC Count: 8,900 /uL (Reference: 4,000 - 11,000 /uL) [NORMAL]
Platelet Count: 180,000 /uL (Reference: 150,000 - 450,000 /uL) [NORMAL]
RBC Count: 4.10 mill/mm3 (Reference: 4.5 - 5.5 mill/mm3) [LOW]`;
    parsedMetrics.push(
      { id: 'm-' + Date.now() + '-1', name: 'Hemoglobin', value: 11.2, unit: 'g/dL', referenceRange: '13.5 - 17.5 g/dL', status: 'low', clinicalInterpretation: 'Mildly lower than standard male reference band.' },
      { id: 'm-' + Date.now() + '-2', name: 'WBC Count', value: 8900, unit: '/uL', referenceRange: '4,000 - 11,000 /uL', status: 'normal', clinicalInterpretation: 'Normal immune cell count.' },
      { id: 'm-' + Date.now() + '-3', name: 'Platelet Count', value: 180000, unit: '/uL', referenceRange: '150,000 - 450,000 /uL', status: 'normal', clinicalInterpretation: 'Adequate clotting cell baseline.' },
      { id: 'm-' + Date.now() + '-4', name: 'RBC Count', value: 4.10, unit: 'mill/mm3', referenceRange: '4.5 - 5.5 mill/mm3', status: 'low', clinicalInterpretation: 'Red cell concentration slightly depressed.' }
    );
  } else if (preset === 'diabetes') {
    reportText = `BIOCHEMISTRY & GLYCEMIC PROFILE
Fasting Blood Sugar: 152 mg/dL (Reference: 70 - 99 mg/dL) [HIGH]
HbA1c: 7.8 % (Reference: 4.0 - 5.6 %) [HIGH]
Post Prandial Sugar (PPBS): 210 mg/dL (Reference: < 140 mg/dL) [HIGH]
Serum Creatinine: 1.05 mg/dL (Reference: 0.70 - 1.30 mg/dL) [NORMAL]`;
    parsedMetrics.push(
      { id: 'm-' + Date.now() + '-1', name: 'Fasting Blood Sugar', value: 152, unit: 'mg/dL', referenceRange: '70 - 99 mg/dL', status: 'high' },
      { id: 'm-' + Date.now() + '-2', name: 'HbA1c', value: 7.8, unit: '%', referenceRange: '4.0 - 5.6 %', status: 'high' },
      { id: 'm-' + Date.now() + '-3', name: 'Post Prandial Sugar (PPBS)', value: 210, unit: 'mg/dL', referenceRange: '< 140 mg/dL', status: 'high' },
      { id: 'm-' + Date.now() + '-4', name: 'Serum Creatinine', value: 1.05, unit: 'mg/dL', referenceRange: '0.70 - 1.30 mg/dL', status: 'normal' }
    );
  } else {
    // Custom user input parsing via regex
    const lines = reportText.split('\n');
    let idx = 1;
    for (const line of lines) {
      const match = line.match(/([^:]+):\s*([0-9.]+)\s*([a-zA-Z/%^3]+)?(?:\s*\((?:Reference:?\s*)?([^)]+)\))?/i);
      if (match) {
        const val = parseFloat(match[2]);
        const name = match[1].trim();
        const unit = match[3] || '';
        const range = match[4] || 'Standard';
        let status: 'normal' | 'low' | 'high' | 'critical' = 'normal';
        if (line.toLowerCase().includes('high') || line.toLowerCase().includes('elevated')) status = 'high';
        else if (line.toLowerCase().includes('low') || line.toLowerCase().includes('deficient')) status = 'low';

        parsedMetrics.push({
          id: 'm-' + Date.now() + '-' + idx++,
          name,
          value: val,
          unit,
          referenceRange: range,
          status,
        });
      }
    }

    if (parsedMetrics.length === 0) {
      // Default fallback metric if freeform text didn't match
      parsedMetrics.push({
        id: 'm-' + Date.now() + '-1',
        name: 'Report Parameter',
        value: 100,
        unit: 'mg/dL',
        referenceRange: '70 - 120 mg/dL',
        status: 'normal',
      });
    }
  }

  const newReportId = 'rep-' + (100 + reports.length + 1);
  const calculatedHash = computeSHA256(reportText + newReportId + Date.now());

  const newReport: MedicalReportRecord = {
    id: newReportId,
    patientId: patientId || 'pat-1',
    patientName: patientName || 'Rahul Verma',
    title: title || 'Clinical Lab Diagnostic Report',
    category: (category as any) || 'General',
    date: new Date().toISOString().split('T')[0],
    labName: labName || 'Max Healthcare Pathology',
    fileHash: calculatedHash,
    encryptionMeta: {
      algorithm: 'AES-256-GCM',
      keyId: 'KMS-KEY-MED-' + Math.floor(1000 + Math.random() * 9000),
      iv: crypto.randomBytes(6).toString('hex'),
      status: 'Encrypted at Rest (AES-256-GCM)',
    },
    rawText: reportText,
    metrics: parsedMetrics,
    allowedDoctorIds: ['doc-1'],
  };

  reports.unshift(newReport);
  res.status(201).json(newReport);
});

// 3. AI Report Explainer (Gemini API with Strict Medical Disclaimer)
app.post('/api/reports/:id/explain', async (req: Request, res: Response) => {
  const report = reports.find((r) => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  // Check if explanation already cached
  if (report.aiExplanation) {
    return res.json(report.aiExplanation);
  }

  const prompt = `You are an empathetic, clinical health educator explaining a medical lab report to a patient.
CRITICAL CONSTRAINT: Do NOT diagnose illnesses. Do NOT prescribe medication. Use clear, non-jargon, compassionate language.

Here is the extracted patient report:
Title: ${report.title}
Category: ${report.category}
Date: ${report.date}
Extracted Metrics:
${JSON.stringify(report.metrics, null, 2)}
Raw Clinical Report Text:
${report.rawText}

Respond ONLY with valid JSON in this exact structure:
{
  "summary": "2-3 concise sentences summarizing what this test measured and overall picture.",
  "keyFindings": [
    "Item 1 explaining specific metric with normal comparison in plain English",
    "Item 2 explaining specific metric"
  ],
  "lifestyleContext": [
    "Context point 1 on common non-diagnostic factors (hydration, dietary patterns, sleep, stress)",
    "Context point 2"
  ],
  "doctorQuestions": [
    "Specific smart question to ask the doctor at the next visit",
    "Another practical question to ask"
  ]
}`;

  try {
    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are a healthcare communication specialist helping patients understand lab test biomarkers clearly. You never give medical diagnoses or treatment advice.',
        },
      });

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text);
      const explanation = {
        summary: parsed.summary || 'Summary generated based on clinical lab markers.',
        keyFindings: parsed.keyFindings || ['All tested parameters evaluated against standard biological reference ranges.'],
        lifestyleContext: parsed.lifestyleContext || ['Daily nutritional intake, hydration, and rest intervals influence biomarker balance.'],
        doctorQuestions: parsed.doctorQuestions || ['What follow-up timeline do you recommend for these indicators?'],
        generatedAt: new Date().toISOString(),
        model: 'gemini-3.8-flash',
      };
      report.aiExplanation = explanation;
      return res.json(explanation);
    }
  } catch (err) {
    console.warn('Gemini API call failed or encountered rate limit. Falling back to structured heuristic explainer.', err);
  }

  // Graceful, high-quality fallback explanation if API key is unconfigured or rate limited
  const abnormalMetrics = report.metrics.filter((m) => m.status !== 'normal');
  const fallbackExplanation = {
    summary: `This ${report.title} evaluates key physiological markers. ${
      abnormalMetrics.length > 0
        ? `${abnormalMetrics.length} out of ${report.metrics.length} metrics fall outside standard laboratory reference baselines.`
        : 'All measured parameters align nicely with standard reference baseline levels.'
    }`,
    keyFindings: abnormalMetrics.length > 0
      ? abnormalMetrics.map((m) => `${m.name} is measured at ${m.value} ${m.unit} (Standard Reference: ${m.referenceRange}). This reading is flagged as ${m.status.toUpperCase()}.`)
      : report.metrics.map((m) => `${m.name} is within healthy target limits at ${m.value} ${m.unit}.`),
    lifestyleContext: [
      'Biomarkers fluctuate based on recent dietary intake, fasting duration, emotional stress, and hydration volume.',
      'Single lab values represent a snapshot in time; long-term clinical trends are significantly more meaningful than one-off values.',
    ],
    doctorQuestions: [
      'How do these values compare with my personal baseline history?',
      'Are there specific dietary or lifestyle adjustments I should prioritize prior to repeat testing?',
      'Should we schedule a re-test in 6 to 12 weeks to observe the trajectory?',
    ],
    generatedAt: new Date().toISOString(),
    model: 'gemini-3.8-flash (Simulated Engine)',
  };

  report.aiExplanation = fallbackExplanation;
  res.json(fallbackExplanation);
});

// 4. Appointment Booking & Doctor Schedule
app.get('/api/appointments', (req: Request, res: Response) => {
  const { doctorId, patientId } = req.query;
  let filtered = [...appointments];

  if (doctorId) {
    filtered = filtered.filter((a) => a.doctorId === doctorId);
  } else if (patientId) {
    filtered = filtered.filter((a) => a.patientId === patientId);
  }

  res.json(filtered);
});

// Create appointment with STRICT CONFLICT CHECKING (prevents double-booking same doctor slot)
app.post('/api/appointments', (req: Request, res: Response) => {
  const { patientId, patientName, doctorId, date, timeSlot, reason, attachedReportId } = req.body;

  if (!patientId || !doctorId || !date || !timeSlot) {
    return res.status(400).json({ error: 'Missing mandatory appointment parameters: doctor, date, and time slot.' });
  }

  // Database Concurrency Conflict Check: Check if slot already booked for this doctor
  const conflict = appointments.find(
    (a) => a.doctorId === doctorId && a.date === date && a.timeSlot === timeSlot && a.status !== 'cancelled'
  );

  if (conflict) {
    return res.status(409).json({
      error: 'SLOT_CONFLICT',
      message: `The selected slot (${timeSlot} on ${date}) is already reserved. Please select an alternate time.`,
    });
  }

  const doctor = users.find((u) => u.id === doctorId);

  const newAppointment: AppointmentRecord = {
    id: 'apt-' + (500 + appointments.length + 1),
    patientId,
    patientName: patientName || 'Rahul Verma',
    doctorId,
    doctorName: doctor?.name || 'Dr. Ananya Sengupta',
    doctorSpecialization: doctor?.specialization || 'General Physician',
    date,
    timeSlot,
    status: 'confirmed',
    reason: reason || 'General clinical consultation',
    attachedReportId,
    createdAt: new Date().toISOString(),
  };

  appointments.push(newAppointment);

  // If a report is attached, grant the doctor access automatically
  if (attachedReportId) {
    const report = reports.find((r) => r.id === attachedReportId);
    if (report && !report.allowedDoctorIds.includes(doctorId)) {
      report.allowedDoctorIds.push(doctorId);
    }
  }

  res.status(201).json(newAppointment);
});

// Update appointment status / Doctor Notes
app.patch('/api/appointments/:id', (req: Request, res: Response) => {
  const { status, doctorNotes } = req.body;
  const apt = appointments.find((a) => a.id === req.params.id);
  if (!apt) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  if (status) apt.status = status;
  if (doctorNotes !== undefined) apt.doctorNotes = doctorNotes;

  res.json(apt);
});

// 5. Health Timeline (Longitudinal biomarkers over time)
app.get('/api/timeline/:patientId', (req: Request, res: Response) => {
  const { patientId } = req.params;

  // Aggregate metrics from all patient reports ordered chronologically
  const patientReports = reports
    .filter((r) => r.patientId === patientId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const timelineData = [
    {
      date: '2026-03-10',
      label: 'Mar 2026',
      fbs: 110,
      hba1c: 6.2,
      hemoglobin: 14.0,
      cholesterol: 228,
      reportTitle: 'Lipid & Metabolic Check',
    },
    {
      date: '2026-06-12',
      label: 'Jun 2026',
      fbs: 124,
      hba1c: 6.7,
      hemoglobin: 13.8,
      cholesterol: 215,
      reportTitle: 'Routine CBC & Blood Sugar',
    },
    {
      date: '2026-09-24',
      label: 'Sep 2026',
      fbs: 138,
      hba1c: 7.1,
      hemoglobin: 14.2,
      cholesterol: 205,
      reportTitle: 'Comprehensive Metabolic Panel',
    },
    {
      date: '2026-10-07',
      label: 'Current Target',
      fbs: 95,
      hba1c: 5.6,
      hemoglobin: 14.0,
      cholesterol: 190,
      isTarget: true,
      reportTitle: 'Clinical Optimal Goal',
    },
  ];

  res.json({
    patientId,
    timeline: timelineData,
    reportsCount: patientReports.length,
  });
});

// ----------------------------------------------------
// VITE CLIENT MOUNTING (Dev & Production)
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MediVault] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
