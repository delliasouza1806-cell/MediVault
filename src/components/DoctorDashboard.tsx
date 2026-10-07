import React, { useState } from 'react';
import { User, Appointment, MedicalReport } from '../types';
import {
  Stethoscope,
  Calendar,
  Clock,
  UserCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
  Lock,
  Edit3,
  Save,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { updateAppointment } from '../services/api';

interface DoctorDashboardProps {
  currentDoctor: User;
  appointments: Appointment[];
  sharedReports: MedicalReport[];
  onOpenReport: (report: MedicalReport) => void;
  onAppointmentUpdated: (updated: Appointment) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  currentDoctor,
  appointments,
  sharedReports,
  onOpenReport,
  onAppointmentUpdated,
}) => {
  const [editingAptId, setEditingAptId] = useState<string | null>(null);
  const [clinicalNoteText, setClinicalNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const doctorAppointments = appointments.filter((a) => a.doctorId === currentDoctor.id);

  const handleStartEditNote = (apt: Appointment) => {
    setEditingAptId(apt.id);
    setClinicalNoteText(apt.doctorNotes || '');
  };

  const handleSaveNote = async (apt: Appointment) => {
    setSavingNote(true);
    try {
      const updated = await updateAppointment(apt.id, { doctorNotes: clinicalNoteText });
      onAppointmentUpdated(updated);
      setEditingAptId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleStatusChange = async (apt: Appointment, newStatus: string) => {
    try {
      const updated = await updateAppointment(apt.id, { status: newStatus });
      onAppointmentUpdated(updated);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Doctor Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-teal-800/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-inner">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Verified Practitioner
              </span>
              <span className="text-xs text-slate-400 font-mono">NMC ID: REG-884192</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">{currentDoctor.name}</h2>
            <p className="text-xs text-teal-300/80">{currentDoctor.specialization}</p>
          </div>
        </div>

        {/* Doctor Summary Badges */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Scheduled Visits</span>
            <span className="text-lg font-bold text-white font-mono">{doctorAppointments.length}</span>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Accessible Reports</span>
            <span className="text-lg font-bold text-teal-400 font-mono">{sharedReports.length}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Appointments & Shared Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Clinical Appointments Queue (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Clinical Consultation Queue</h3>
              <p className="text-xs text-slate-400">Patient appointments and clinical progress records</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Queue Count: {doctorAppointments.length}
            </span>
          </div>

          <div className="space-y-3">
            {doctorAppointments.length === 0 ? (
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs">
                No active appointments booked in your schedule.
              </div>
            ) : (
              doctorAppointments.map((apt) => {
                const attachedReport = sharedReports.find((r) => r.id === apt.attachedReportId);
                const isEditing = editingAptId === apt.id;

                return (
                  <div
                    key={apt.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 space-y-4 transition shadow-md"
                  >
                    {/* Top Row: Patient & Slot */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-white">{apt.patientName}</span>
                          <span className="text-[11px] text-slate-400">ID: {apt.patientId}</span>
                        </div>
                        <div className="text-xs text-slate-300 mt-1 flex items-center space-x-3">
                          <span className="flex items-center space-x-1 text-teal-400 font-mono font-semibold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{apt.timeSlot}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1 text-slate-400">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{apt.date}</span>
                          </span>
                        </div>
                      </div>

                      {/* Status Badges & Controls */}
                      <div className="flex items-center space-x-2">
                        <select
                          value={apt.status}
                          onChange={(e) => handleStatusChange(apt, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none ${
                            apt.status === 'confirmed'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : apt.status === 'completed'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          <option value="pending" className="bg-slate-900 text-white">Pending</option>
                          <option value="confirmed" className="bg-slate-900 text-white">Confirmed</option>
                          <option value="completed" className="bg-slate-900 text-white">Completed</option>
                          <option value="cancelled" className="bg-slate-900 text-white">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="text-xs text-slate-300">
                      <span className="text-slate-500 font-semibold uppercase text-[10px] block">Chief Complaint</span>
                      <p className="mt-0.5">{apt.reason}</p>
                    </div>

                    {/* Attached Report Button */}
                    {attachedReport && (
                      <div className="bg-slate-800/50 border border-slate-700/70 p-3 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2 text-slate-200">
                          <FileText className="w-4 h-4 text-teal-400" />
                          <div>
                            <span className="font-semibold block">{attachedReport.title}</span>
                            <span className="text-[11px] text-slate-400">{attachedReport.date} • {attachedReport.category}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => onOpenReport(attachedReport)}
                          className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs rounded-lg transition flex items-center space-x-1"
                        >
                          <span>Review Report</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Clinical Notes Editor */}
                    <div className="pt-2 border-t border-slate-800 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                          <Edit3 className="w-3 h-3" />
                          <span>Physician Clinical Notes & Prescription</span>
                        </span>
                        {!isEditing && (
                          <button
                            onClick={() => handleStartEditNote(apt)}
                            className="text-[11px] text-teal-400 hover:text-teal-300 font-medium"
                          >
                            {apt.doctorNotes ? 'Edit Notes' : '+ Add Clinical Note'}
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            rows={3}
                            value={clinicalNoteText}
                            onChange={(e) => setClinicalNoteText(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                            placeholder="Document patient advice, dietary modifications, or prescription plan..."
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setEditingAptId(null)}
                              className="px-3 py-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveNote(apt)}
                              disabled={savingNote}
                              className="px-3 py-1 rounded bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold flex items-center space-x-1"
                            >
                              <Save className="w-3 h-3" />
                              <span>{savingNote ? 'Saving...' : 'Save Notes'}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-300 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                          {apt.doctorNotes || 'No physician notes recorded yet.'}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Shared Patient Vault Records (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Authorized Patient Vault</h3>
            <span className="text-xs text-teal-400 font-mono">ACL Enforced</span>
          </div>
          <p className="text-xs text-slate-400">
            Medical reports that patients have granted you read access to.
          </p>

          <div className="space-y-3">
            {sharedReports.length === 0 ? (
              <div className="p-6 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs">
                No patient records shared with your account yet.
              </div>
            ) : (
              sharedReports.map((rep) => {
                const abnormal = rep.metrics.filter((m) => m.status !== 'normal').length;

                return (
                  <div
                    key={rep.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-800 text-slate-300">
                          {rep.category}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{rep.date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1.5">{rep.title}</h4>
                      <p className="text-[11px] text-slate-400">Patient: {rep.patientName}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
                      <div className="flex items-center space-x-1.5">
                        {abnormal > 0 ? (
                          <span className="text-amber-400 font-semibold flex items-center space-x-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>{abnormal} Flagged Biomarkers</span>
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>All Within Normal Range</span>
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => onOpenReport(rep)}
                        className="text-teal-400 hover:text-teal-300 font-semibold text-xs flex items-center space-x-0.5"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
