import React, { useState } from 'react';
import { User, MedicalReport, Appointment } from '../types';
import {
  FileText,
  Lock,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Sparkles,
  Building2,
  Search,
  Filter,
  Plus,
} from 'lucide-react';

interface PatientDashboardProps {
  currentUser: User;
  reports: MedicalReport[];
  appointments: Appointment[];
  onOpenReport: (report: MedicalReport) => void;
  onOpenUpload: () => void;
  onOpenAppointmentModal: (reportId?: string) => void;
  onViewTimeline: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  currentUser,
  reports,
  appointments,
  onOpenReport,
  onOpenUpload,
  onOpenAppointmentModal,
  onViewTimeline,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Calculate metrics summary
  const totalReports = reports.length;
  const totalAbnormal = reports.reduce((acc, r) => {
    return acc + r.metrics.filter((m) => m.status !== 'normal').length;
  }, 0);
  const upcomingApts = appointments.filter((a) => a.status !== 'cancelled' && a.status !== 'completed').length;

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.labName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800/80 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Encrypted Medical Vault
              </span>
              <span className="text-xs text-slate-400 font-mono">Patient ID: {currentUser.id}</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1.5">Welcome, {currentUser.name}</h1>
            <p className="text-xs text-slate-400 max-w-xl mt-0.5">
              Your clinical documents are safeguarded with AES-256 envelope encryption. Review parsed biomarkers, generate plain-language AI explanations, or consult with verified physicians.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onOpenUpload}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-950 transition flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Lab Report</span>
            </button>
            <button
              onClick={() => onOpenAppointmentModal()}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 active:scale-95 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-1.5"
            >
              <Calendar className="w-4 h-4 text-slate-950" />
              <span>Book Doctor</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6">
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Encrypted Vault Files
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-bold font-mono text-white">{totalReports}</span>
              <span className="text-[11px] text-teal-400 font-mono">AES-256</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Flagged Biomarkers
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-bold font-mono text-amber-400">{totalAbnormal}</span>
              <span className="text-[11px] text-slate-400">Out of Range</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Consultation Queue
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-2xl font-bold font-mono text-emerald-400">{upcomingApts}</span>
              <span className="text-[11px] text-slate-400">Scheduled</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Cryptographic Integrity
            </span>
            <div className="flex items-center space-x-1.5 mt-1 text-emerald-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>SHA-256 Intact</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Vault Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-teal-400" />
              <span>Diagnostic Medical Reports</span>
            </h2>
            <p className="text-xs text-slate-400">
              Optical character recognition extracts clinical parameters and stores them in your tamper-proof vault.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tests or labs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
            >
              <option value="All">All Categories</option>
              <option value="Metabolic">Metabolic</option>
              <option value="Hematology">Hematology</option>
              <option value="Lipid Profile">Lipid Profile</option>
            </select>
          </div>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => {
            const flagged = report.metrics.filter((m) => m.status !== 'normal');
            const hasExplanation = Boolean(report.aiExplanation);

            return (
              <div
                key={report.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/90 rounded-2xl p-5 space-y-4 transition flex flex-col justify-between shadow-md"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-teal-300 border border-slate-700">
                      {report.category}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{report.date}</span>
                    </span>
                  </div>

                  {/* Title & Lab */}
                  <h3 className="text-sm font-bold text-white mt-2 leading-snug">{report.title}</h3>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{report.labName}</span>
                  </div>

                  {/* Vault Security Tag */}
                  <div className="mt-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400 flex items-center space-x-1">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      <span>AES-256</span>
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      SHA: {report.fileHash.substring(0, 8)}...
                    </span>
                  </div>

                  {/* Extracted Biomarkers Preview */}
                  <div className="mt-3 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Parsed Biomarkers ({report.metrics.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {report.metrics.slice(0, 3).map((m) => (
                        <span
                          key={m.id}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                            m.status === 'normal'
                              ? 'bg-slate-800/60 border-slate-700 text-slate-300'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-semibold'
                          }`}
                        >
                          {m.name.split(' ')[0]}: {m.value} {m.unit}
                        </span>
                      ))}
                      {report.metrics.length > 3 && (
                        <span className="text-[10px] text-slate-500 px-1 py-0.5 self-center">
                          +{report.metrics.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    {hasExplanation ? (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>AI Ready</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Unexplained</span>
                    )}
                  </div>

                  <button
                    onClick={() => onOpenReport(report)}
                    className="inline-flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition"
                  >
                    <span>View Report</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Consultations Overview & Upcoming Schedule */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-teal-400" />
              <span>Upcoming Clinical Consultations</span>
            </h2>
            <p className="text-xs text-slate-400">
              Reserved consultation slots with atomic concurrency guard
            </p>
          </div>
          <button
            onClick={() => onOpenAppointmentModal()}
            className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
          >
            + New Appointment
          </button>
        </div>

        <div className="space-y-3">
          {appointments.length === 0 ? (
            <div className="p-6 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs">
              No appointments scheduled.
            </div>
          ) : (
            appointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">{apt.doctorName}</span>
                      <span className="text-[11px] text-slate-400">({apt.doctorSpecialization})</span>
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">Reason: {apt.reason}</div>
                    {apt.doctorNotes && (
                      <div className="text-[11px] text-teal-300 mt-1 italic">
                        Doctor Notes: "{apt.doctorNotes}"
                      </div>
                    )}
                  </div>
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
    </div>
  );
};
