/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, UserRole, MedicalReport, Appointment, TimelinePoint } from './types';
import { Navbar } from './components/Navbar';
import { PatientDashboard } from './components/PatientDashboard';
import { DoctorDashboard } from './components/DoctorDashboard';
import { HealthTimeline } from './components/HealthTimeline';
import { ReportDetailModal } from './components/ReportDetailModal';
import { ReportUploadModal } from './components/ReportUploadModal';
import { AppointmentModal } from './components/AppointmentModal';
import { EngineeringModal } from './components/EngineeringModal';
import {
  fetchDoctors,
  fetchReports,
  fetchAppointments,
  fetchHealthTimeline,
} from './services/api';
import { RefreshCw, ShieldCheck, Terminal, Stethoscope } from 'lucide-react';

const SEED_PATIENT: User = {
  id: 'pat-1',
  name: 'Rahul Verma',
  email: 'rahul.verma@example.com',
  role: 'patient',
  phone: '+91 98765 43210',
};

const SEED_DOCTOR: User = {
  id: 'doc-1',
  name: 'Dr. Ananya Sengupta',
  email: 'dr.ananya@medivault.clinic',
  role: 'doctor',
  specialization: 'Internal Medicine & Diabetology',
  phone: '+91 99200 11223',
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(SEED_PATIENT);
  const [activeTab, setActiveTab] = useState<'vault' | 'timeline' | 'appointments' | 'doctor-queue'>('vault');
  const [doctors, setDoctors] = useState<User[]>([SEED_DOCTOR]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [timelineData, setTimelineData] = useState<TimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentReportPresetId, setAppointmentReportPresetId] = useState<string | undefined>(undefined);
  const [isEngineeringOpen, setIsEngineeringOpen] = useState(false);

  // Load initial data
  const loadData = async (user = currentUser) => {
    setLoading(true);
    try {
      const [fetchedDocs, fetchedReps, fetchedApts, fetchedTimeline] = await Promise.all([
        fetchDoctors().catch(() => [SEED_DOCTOR]),
        fetchReports(user.id, user.role).catch(() => []),
        fetchAppointments(user.role === 'doctor' ? { doctorId: user.id } : { patientId: user.id }).catch(() => []),
        fetchHealthTimeline(user.role === 'patient' ? user.id : 'pat-1').catch(() => ({ timeline: [], reportsCount: 0 })),
      ]);

      setDoctors(fetchedDocs);
      setReports(fetchedReps);
      setAppointments(fetchedApts);
      setTimelineData(fetchedTimeline.timeline || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(currentUser);
  }, [currentUser]);

  // Persona switcher
  const handleSwitchUser = (newRole: UserRole) => {
    if (newRole === 'doctor') {
      setCurrentUser(SEED_DOCTOR);
      setActiveTab('doctor-queue');
    } else {
      setCurrentUser(SEED_PATIENT);
      setActiveTab('vault');
    }
  };

  const handleReportUpdated = (updated: MedicalReport) => {
    setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setSelectedReport(updated);
  };

  const handleReportCreated = (newReport: MedicalReport) => {
    setReports((prev) => [newReport, ...prev]);
    setSelectedReport(newReport); // open newly created report directly
  };

  const handleAppointmentBooked = (newApt: Appointment) => {
    setAppointments((prev) => [newApt, ...prev]);
  };

  const handleAppointmentUpdated = (updatedApt: Appointment) => {
    setAppointments((prev) => prev.map((a) => (a.id === updatedApt.id ? updatedApt : a)));
  };

  const handleBookWithReport = (reportId: string) => {
    setAppointmentReportPresetId(reportId);
    setIsAppointmentModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
      {/* Top Banner: Placement & Project Context for Interviewers */}
      <div className="bg-slate-900/90 border-b border-indigo-900/40 px-4 py-1.5 text-center text-xs text-slate-300 flex items-center justify-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-semibold text-white">Full-Stack SDE Capstone:</span>
        <span className="text-slate-400 hidden sm:inline">
          React, Node/Express, PostgreSQL DDL, AES-256 Vault, Gemini 3.8 Flash & Docker.
        </span>
        <button
          onClick={() => setIsEngineeringOpen(true)}
          className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 ml-1"
        >
          View Interview Defense Guide
        </button>
      </div>

      {/* Main Navbar */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenEngineering={() => setIsEngineeringOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-3">
            <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
            <p className="text-xs text-slate-400">Loading secure medical records & clinical schedules...</p>
          </div>
        ) : currentUser.role === 'doctor' ? (
          /* Doctor Console View */
          <DoctorDashboard
            currentDoctor={currentUser}
            appointments={appointments}
            sharedReports={reports}
            onOpenReport={(report) => setSelectedReport(report)}
            onAppointmentUpdated={handleAppointmentUpdated}
          />
        ) : (
          /* Patient Views based on activeTab */
          <>
            {activeTab === 'vault' && (
              <PatientDashboard
                currentUser={currentUser}
                reports={reports}
                appointments={appointments}
                onOpenReport={(report) => setSelectedReport(report)}
                onOpenUpload={() => setIsUploadOpen(true)}
                onOpenAppointmentModal={(repId) => {
                  setAppointmentReportPresetId(repId);
                  setIsAppointmentModalOpen(true);
                }}
                onViewTimeline={() => setActiveTab('timeline')}
              />
            )}

            {activeTab === 'timeline' && (
              <HealthTimeline
                timeline={timelineData}
                patientName={currentUser.name}
              />
            )}

            {activeTab === 'appointments' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Clinical Consultations</h2>
                    <p className="text-xs text-slate-400">
                      Scheduled doctor consultations with atomic slot conflict checks.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setAppointmentReportPresetId(undefined);
                      setIsAppointmentModalOpen(true);
                    }}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition"
                  >
                    + Book New Consultation
                  </button>
                </div>

                <div className="space-y-3">
                  {appointments.length === 0 ? (
                    <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs">
                      No consultations scheduled yet. Book your first clinical appointment above.
                    </div>
                  ) : (
                    appointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-white">{apt.doctorName}</span>
                            <span className="text-xs text-slate-400">({apt.doctorSpecialization})</span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">Reason: {apt.reason}</p>
                          {apt.doctorNotes && (
                            <div className="mt-2 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-teal-300 italic">
                              Doctor Advice: "{apt.doctorNotes}"
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 self-end sm:self-center font-mono text-xs">
                          <div className="text-right">
                            <div className="text-slate-200 font-semibold">{apt.date}</div>
                            <div className="text-teal-400 font-bold">{apt.timeSlot}</div>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              apt.status === 'confirmed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : apt.status === 'completed'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/60 border-t border-slate-800/80 py-6 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-400">MediVault System</span>
            <span>•</span>
            <span>AES-256-GCM Cryptographic Record Engine</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsEngineeringOpen(true)}
              className="text-indigo-400 hover:text-indigo-300 transition flex items-center space-x-1"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Interview Defense & DDL</span>
            </button>
            <span>•</span>
            <span>Built by Final Year B.E. CS Candidate</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          currentUser={currentUser}
          doctors={doctors}
          onClose={() => setSelectedReport(null)}
          onReportUpdated={handleReportUpdated}
          onBookWithReport={handleBookWithReport}
        />
      )}

      {isUploadOpen && (
        <ReportUploadModal
          currentUser={currentUser}
          onClose={() => setIsUploadOpen(false)}
          onReportCreated={handleReportCreated}
        />
      )}

      {isAppointmentModalOpen && (
        <AppointmentModal
          currentUser={currentUser}
          doctors={doctors}
          reports={reports}
          existingAppointments={appointments}
          preselectedReportId={appointmentReportPresetId}
          onClose={() => {
            setIsAppointmentModalOpen(false);
            setAppointmentReportPresetId(undefined);
          }}
          onAppointmentBooked={handleAppointmentBooked}
        />
      )}

      {isEngineeringOpen && (
        <EngineeringModal onClose={() => setIsEngineeringOpen(false)} />
      )}
    </div>
  );
}
