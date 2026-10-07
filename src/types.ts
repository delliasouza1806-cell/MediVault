export type UserRole = 'patient' | 'doctor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  specialization?: string;
  phone?: string;
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

export interface AIExplanation {
  summary: string;
  keyFindings: string[];
  lifestyleContext: string[];
  doctorQuestions: string[];
  generatedAt: string;
  model: string;
}

export interface MedicalReport {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  category: 'Hematology' | 'Biochemistry' | 'Metabolic' | 'Lipid Profile' | 'General';
  date: string;
  labName: string;
  fileHash: string;
  encryptionMeta: {
    algorithm: string;
    keyId: string;
    iv: string;
    status: string;
  };
  rawText: string;
  metrics: ExtractedMetric[];
  aiExplanation?: AIExplanation;
  allowedDoctorIds: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reason: string;
  doctorNotes?: string;
  attachedReportId?: string;
  createdAt: string;
}

export interface TimelinePoint {
  date: string;
  label: string;
  fbs: number;
  hba1c: number;
  hemoglobin: number;
  cholesterol: number;
  isTarget?: boolean;
  reportTitle: string;
}
