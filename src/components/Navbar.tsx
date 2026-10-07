import React from 'react';
import { User, UserRole } from '../types';
import { ShieldCheck, UserCheck, Stethoscope, Terminal, Sparkles, Lock } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onSwitchUser: (role: UserRole) => void;
  activeTab: 'vault' | 'timeline' | 'appointments' | 'doctor-queue';
  setActiveTab: (tab: 'vault' | 'timeline' | 'appointments' | 'doctor-queue') => void;
  onOpenEngineering: () => void;
  onOpenUpload: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchUser,
  activeTab,
  setActiveTab,
  onOpenEngineering,
  onOpenUpload,
}) => {
  const isDoctor = currentUser.role === 'doctor';

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20">
              <ShieldCheck className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">MediVault</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  AES-256 + AI
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Clinical Records & Diagnostic Intelligence</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60">
            {!isDoctor ? (
              <>
                <button
                  onClick={() => setActiveTab('vault')}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    activeTab === 'vault'
                      ? 'bg-emerald-500 text-slate-950 shadow font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  Medical Vault
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    activeTab === 'timeline'
                      ? 'bg-emerald-500 text-slate-950 shadow font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  Health Timeline
                </button>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    activeTab === 'appointments'
                      ? 'bg-emerald-500 text-slate-950 shadow font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  Consultations
                </button>
              </>
            ) : (
              <button
                onClick={() => setActiveTab('doctor-queue')}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-teal-500 text-slate-950 shadow"
              >
                Doctor Clinical Console
              </button>
            )}
          </nav>

          {/* Action Buttons & Persona Switcher */}
          <div className="flex items-center space-x-2.5">
            {/* Quick Upload Button for Patient */}
            {!isDoctor && (
              <button
                onClick={onOpenUpload}
                className="hidden sm:inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-3 py-2 rounded-lg transition shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Upload Report</span>
              </button>
            )}

            {/* Recruiter / Placement SDE Defense Button */}
            <button
              onClick={onOpenEngineering}
              className="inline-flex items-center space-x-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 hover:text-indigo-200 text-xs font-medium px-3 py-2 rounded-lg transition shadow-sm"
              title="View Architecture, Postgres DDL, & Interview Defense"
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">SDE Architecture</span>
              <span className="px-1.5 py-0.2 bg-indigo-500/20 rounded text-[10px] text-indigo-300 font-mono">Q&A</span>
            </button>

            {/* Active User Card & 1-Click Role Switch */}
            <div className="flex items-center bg-slate-800 border border-slate-700/80 rounded-xl p-1 pl-2.5 space-x-2">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-200 leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 flex items-center justify-end space-x-1">
                  <span>{isDoctor ? 'Physician' : 'Patient'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
              </div>

              <button
                onClick={() => onSwitchUser(isDoctor ? 'patient' : 'doctor')}
                className="flex items-center space-x-1 text-xs bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-600 transition"
                title={`Switch to ${isDoctor ? 'Patient (Rahul Verma)' : 'Doctor (Dr. Ananya Sengupta)'}`}
              >
                {isDoctor ? <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Stethoscope className="w-3.5 h-3.5 text-teal-400" />}
                <span className="text-[11px] font-medium hidden md:inline">
                  {isDoctor ? 'Switch to Patient' : 'Switch to Doctor'}
                </span>
                <span className="text-[11px] font-medium md:hidden">Switch</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800">
          {!isDoctor ? (
            <>
              <button
                onClick={() => setActiveTab('vault')}
                className={`text-xs py-1 px-2 rounded font-medium ${
                  activeTab === 'vault' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
                }`}
              >
                Vault
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`text-xs py-1 px-2 rounded font-medium ${
                  activeTab === 'timeline' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`text-xs py-1 px-2 rounded font-medium ${
                  activeTab === 'appointments' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
                }`}
              >
                Appointments
              </button>
              <button
                onClick={onOpenUpload}
                className="text-xs py-1 px-2 rounded bg-emerald-600 text-white font-medium"
              >
                + Upload
              </button>
            </>
          ) : (
            <button
              onClick={() => setActiveTab('doctor-queue')}
              className="text-xs py-1 px-4 rounded bg-teal-600 text-white font-semibold"
            >
              Doctor Clinical Queue
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
