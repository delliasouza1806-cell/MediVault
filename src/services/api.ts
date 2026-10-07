import { User, MedicalReport, Appointment, TimelinePoint, AIExplanation } from '../types';

export const API_BASE = '/api';

export async function fetchDoctors(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/users/doctors`);
  if (!res.ok) throw new Error('Failed to fetch doctors');
  return res.json();
}

export async function fetchReports(userId: string, role: string): Promise<MedicalReport[]> {
  const res = await fetch(`${API_BASE}/reports?userId=${userId}&role=${role}`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function fetchReportById(reportId: string): Promise<MedicalReport> {
  const res = await fetch(`${API_BASE}/reports/${reportId}`);
  if (!res.ok) throw new Error('Failed to fetch report');
  return res.json();
}

export async function updateReportAccess(reportId: string, doctorId: string, action: 'grant' | 'revoke'): Promise<{ success: boolean; allowedDoctorIds: string[] }> {
  const res = await fetch(`${API_BASE}/reports/${reportId}/access`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctorId, action }),
  });
  if (!res.ok) throw new Error('Failed to update report access');
  return res.json();
}

export async function verifyReportIntegrity(reportId: string): Promise<{
  reportId: string;
  storedHash: string;
  calculatedHash: string;
  status: string;
  encryptionType: string;
  keyFingerprint: string;
  verifiedAt: string;
}> {
  const res = await fetch(`${API_BASE}/reports/${reportId}/verify-integrity`);
  if (!res.ok) throw new Error('Failed to verify report integrity');
  return res.json();
}

export async function uploadReport(data: {
  patientId: string;
  patientName: string;
  title: string;
  category: string;
  labName: string;
  rawText?: string;
  preset?: string;
}): Promise<MedicalReport> {
  const res = await fetch(`${API_BASE}/reports/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to upload report');
  return res.json();
}

export async function explainReportWithAI(reportId: string): Promise<AIExplanation> {
  const res = await fetch(`${API_BASE}/reports/${reportId}/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to generate AI explanation');
  return res.json();
}

export async function fetchAppointments(params: { doctorId?: string; patientId?: string }): Promise<Appointment[]> {
  const query = params.doctorId ? `doctorId=${params.doctorId}` : `patientId=${params.patientId}`;
  const res = await fetch(`${API_BASE}/appointments?${query}`);
  if (!res.ok) throw new Error('Failed to fetch appointments');
  return res.json();
}

export async function bookAppointment(data: {
  patientId: string;
  patientName: string;
  doctorId: string;
  date: string;
  timeSlot: string;
  reason: string;
  attachedReportId?: string;
}): Promise<Appointment> {
  const res = await fetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to book appointment');
  }
  return res.json();
}

export async function updateAppointment(id: string, updates: { status?: string; doctorNotes?: string }): Promise<Appointment> {
  const res = await fetch(`${API_BASE}/appointments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update appointment');
  return res.json();
}

export async function fetchHealthTimeline(patientId: string): Promise<{
  patientId: string;
  timeline: TimelinePoint[];
  reportsCount: number;
}> {
  const res = await fetch(`${API_BASE}/timeline/${patientId}`);
  if (!res.ok) throw new Error('Failed to fetch health timeline');
  return res.json();
}
