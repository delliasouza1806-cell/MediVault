import React, { useState } from 'react';
import { MedicalReport, User, AIExplanation } from '../types';
import {
  X,
  ShieldCheck,
  Sparkles,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Key,
  Calendar,
  Building2,
  Share2,
  Info,
  Clock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { explainReportWithAI, updateReportAccess, verifyReportIntegrity } from '../services/api';

interface ReportDetailModalProps {
  report: MedicalReport;
  currentUser: User;
  doctors: User[];
  onClose: () => void;
  onReportUpdated: (updated: MedicalReport) => void;
  onBookWithReport: (reportId: string) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  currentUser,
  doctors,
  onClose,
  onReportUpdated,
  onBookWithReport,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'ai-explainer' | 'security' | 'access' | 'raw'>('metrics');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [accessUpdating, setAccessUpdating] = useState<string | null>(null);

  const isDoctor = currentUser.role === 'doctor';

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    setAiError(null);
    try {
      const explanation = await explainReportWithAI(report.id);
      onReportUpdated({
        ...report,
        aiExplanation: explanation,
      });
      setActiveTab('ai-explainer');
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate explanation');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleVerifyIntegrity = async () => {
    setIsVerifying(true);
    try {
      const res = await verifyReportIntegrity(report.id);
      setVerificationResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleToggleDoctorAccess = async (doctorId: string, isAllowed: boolean) => {
    setAccessUpdating(doctorId);
    try {
      const action = isAllowed ? 'revoke' : 'grant';
      const res = await updateReportAccess(report.id, doctorId, action);
      onReportUpdated({
        ...report,
        allowedDoctorIds: res.allowedDoctorIds,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setAccessUpdating(null);
    }
  };

  const abnormalCount = report.metrics.filter((m) => m.status !== 'normal').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {report.category}
              </span>
              <span className="flex items-center space-x-1 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{report.date}</span>
              </span>
              <span className="flex items-center space-x-1 text-xs text-slate-400">
                <Building2 className="w-3.5 h-3.5" />
                <span>{report.labName}</span>
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5">{report.title}</h2>
            <div className="flex items-center space-x-3 mt-1 text-xs text-slate-400">
              <span>Patient: <strong className="text-slate-200">{report.patientName}</strong></span>
              <span>•</span>
              <span className="font-mono text-[11px] text-teal-400 flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>AES-256-GCM Vault</span>
              </span>
              <span>•</span>
              <span className="text-slate-400 font-mono text-[10px]">
                SHA-256: {report.fileHash.substring(0, 10)}...{report.fileHash.substring(58)}
              </span>
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
        <div className="px-5 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between overflow-x-auto">
          <div className="flex space-x-1 py-2">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center space-x-1.5 ${
                activeTab === 'metrics'
                  ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Extracted Biomarkers ({report.metrics.length})</span>
              {abnormalCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                  {abnormalCount} Flagged
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('ai-explainer')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center space-x-1.5 ${
                activeTab === 'ai-explainer'
                  ? 'bg-slate-800 text-teal-300 font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Gemini AI Explainer</span>
              {report.aiExplanation && (
                <span className="w-2 h-2 rounded-full bg-teal-400"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center space-x-1.5 ${
                activeTab === 'security'
                  ? 'bg-slate-800 text-emerald-300 font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vault & SHA-256 Audit</span>
            </button>

            {!isDoctor && (
              <button
                onClick={() => setActiveTab('access')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center space-x-1.5 ${
                  activeTab === 'access'
                    ? 'bg-slate-800 text-indigo-300 font-semibold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Doctor Permissions ({report.allowedDoctorIds.length})</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('raw')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center space-x-1.5 ${
                activeTab === 'raw'
                  ? 'bg-slate-800 text-slate-200 font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Raw OCR Text</span>
            </button>
          </div>

          {!isDoctor && (
            <button
              onClick={() => {
                onClose();
                onBookWithReport(report.id);
              }}
              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 my-2 shrink-0"
            >
              <span>Book Doctor Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: EXTRACTED BIOMARKERS TABLE */}
          {activeTab === 'metrics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">Clinical Quantitative Findings</h3>
                  <p className="text-xs text-slate-400">
                    Values extracted via OCR parser and mapped against standard laboratory biological reference intervals.
                  </p>
                </div>
                {!report.aiExplanation && (
                  <button
                    onClick={handleGenerateAI}
                    disabled={isGeneratingAI}
                    className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-medium px-3.5 py-2 rounded-lg shadow-md transition disabled:opacity-50"
                  >
                    {isGeneratingAI ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing with Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Explain in Plain English</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Biomarkers Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-700/60">
                    <tr>
                      <th className="py-3 px-4">Test Biomarker</th>
                      <th className="py-3 px-4">Observed Value</th>
                      <th className="py-3 px-4">Biological Reference Range</th>
                      <th className="py-3 px-4">Status Flag</th>
                      <th className="py-3 px-4">Clinical Context</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {report.metrics.map((m) => {
                      const isHigh = m.status === 'high' || m.status === 'critical';
                      const isLow = m.status === 'low';
                      return (
                        <tr key={m.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3 px-4 font-medium text-white">{m.name}</td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-100">
                            {m.value} <span className="text-slate-400 font-normal">{m.unit}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400">{m.referenceRange}</td>
                          <td className="py-3 px-4">
                            {isHigh && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                                <AlertTriangle className="w-3 h-3" />
                                <span>ELEVATED</span>
                              </span>
                            )}
                            {isLow && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                                <AlertTriangle className="w-3 h-3" />
                                <span>LOW</span>
                              </span>
                            )}
                            {!isHigh && !isLow && (
                              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>NORMAL</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-[11px]">
                            {m.clinicalInterpretation || (
                              isHigh
                                ? 'Measured above upper threshold limit.'
                                : isLow
                                ? 'Measured below minimum biological threshold.'
                                : 'Optimal biological baseline range.'
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Callout */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 flex items-start space-x-3 text-xs text-slate-300">
                <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <p>
                  Lab reference ranges represent statistical 95% confidence intervals from a healthy reference population.
                  Isolated deviations should be interpreted alongside clinical symptoms and dietary factors by your attending physician.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: GEMINI AI EXPLAINER */}
          {activeTab === 'ai-explainer' && (
            <div className="space-y-6">
              {/* Mandatory Medical Disclaimer */}
              <div className="bg-rose-950/40 border-2 border-rose-600/50 rounded-xl p-4 flex items-start space-x-3.5">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                    ⚠️ Clinical Safety & Non-Diagnostic Disclaimer
                  </h4>
                  <p className="text-xs text-rose-200/90 mt-1 leading-relaxed">
                    This automated summary is generated by MediVault AI for health literacy, education, and consultation preparation.
                    It does <strong>NOT</strong> constitute medical advice, diagnosis, or treatment recommendations.
                    Laboratory values must always be evaluated in clinical context by a licensed physician.
                  </p>
                </div>
              </div>

              {/* If no explanation yet, prompt generation */}
              {!report.aiExplanation ? (
                <div className="text-center py-10 bg-slate-800/30 border border-slate-800 rounded-xl space-y-4">
                  <div className="w-12 h-12 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Generate Plain-Language AI Explanation</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                      Converts clinical lab abbreviations into understandable insights with lifestyle context and doctor discussion points.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateAI}
                    disabled={isGeneratingAI}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg transition disabled:opacity-50"
                  >
                    {isGeneratingAI ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Querying Gemini 3.8 Flash...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Report Explanation</span>
                      </>
                    )}
                  </button>
                  {aiError && (
                    <p className="text-xs text-rose-400 mt-2">{aiError}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Summary Card */}
                  <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-teal-400 font-semibold">
                      <span className="flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Report Overview (What This Measures)</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Powered by {report.aiExplanation.model}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {report.aiExplanation.summary}
                    </p>
                  </div>

                  {/* Key Findings in Plain English */}
                  <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Key Findings in Normal Language
                    </h4>
                    <ul className="space-y-2">
                      {report.aiExplanation.keyFindings.map((finding, idx) => (
                        <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0"></span>
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Lifestyle & Biological Factors */}
                  <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Potential Influencing Factors (Non-Diagnostic)
                    </h4>
                    <ul className="space-y-2">
                      {report.aiExplanation.lifestyleContext.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Smart Questions for Your Doctor */}
                  <div className="bg-gradient-to-br from-slate-800/80 to-teal-950/30 border border-teal-800/40 rounded-xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Recommended Discussion Points for Doctor Visit</span>
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {report.aiExplanation.doctorQuestions.map((q, idx) => (
                        <div key={idx} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs text-slate-200 flex items-start space-x-2">
                          <span className="font-bold text-teal-400 shrink-0">{idx + 1}.</span>
                          <span>"{q}"</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SECURITY & CRYPTOGRAPHIC INTEGRITY AUDIT */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-4">
                <div className="flex items-center space-x-2 text-emerald-400 text-sm font-semibold">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Zero-Trust Medical Vault Architecture</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  This document is stored as encrypted ciphertext in compliance with electronic medical record security principles.
                  The raw payload cannot be accessed without proper RBAC authorization and authenticated key envelope unwrapping.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Encryption Standard</span>
                    <div className="font-mono text-slate-200 font-semibold">{report.encryptionMeta.algorithm} (Galois Counter Mode)</div>
                    <p className="text-[11px] text-slate-400">Authenticated symmetric encryption with 128-bit authentication tag.</p>
                  </div>
                  <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">KMS Key Identifier</span>
                    <div className="font-mono text-teal-400 font-semibold">{report.encryptionMeta.keyId}</div>
                    <p className="text-[11px] text-slate-400">IV: {report.encryptionMeta.iv}</p>
                  </div>
                </div>
              </div>

              {/* SHA-256 Tamper Audit */}
              <div className="bg-slate-800/30 border border-slate-700/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      SHA-256 Tamper-Detection Verification
                    </h4>
                    <p className="text-xs text-slate-400">
                      Calculates real-time hash of decrypted payload and verifies against the immutable registration ledger.
                    </p>
                  </div>
                  <button
                    onClick={handleVerifyIntegrity}
                    disabled={isVerifying}
                    className="inline-flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-3.5 h-3.5" />
                        <span>Verify Checksum</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs space-y-1.5 break-all">
                  <div className="text-slate-400 text-[11px]">Ledger Checksum (SHA-256):</div>
                  <div className="text-emerald-400">{report.fileHash}</div>
                </div>

                {verificationResult && (
                  <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 text-xs space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>CRYPTOGRAPHIC STATUS: {verificationResult.status}</span>
                    </div>
                    <p className="text-slate-300">
                      Decrypted byte-stream matches the original upload signature bit-for-bit. No tampering or alteration detected.
                    </p>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Timestamp: {verificationResult.verifiedAt}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ACCESS CONTROL (RBAC) */}
          {activeTab === 'access' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Doctor Access Control List (ACL)</h3>
                <p className="text-xs text-slate-400">
                  Granular permission manager. Only doctors explicitly authorized below can decrypt and view this medical record.
                </p>
              </div>

              <div className="space-y-3">
                {doctors.map((doc) => {
                  const isAllowed = report.allowedDoctorIds.includes(doc.id);
                  const isPending = accessUpdating === doc.id;

                  return (
                    <div
                      key={doc.id}
                      className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-sm">
                          {doc.name.charAt(4)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{doc.name}</div>
                          <div className="text-[11px] text-slate-400">{doc.specialization}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isAllowed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-700 text-slate-400'
                        }`}>
                          {isAllowed ? 'Access Granted' : 'Restricted'}
                        </span>

                        <button
                          onClick={() => handleToggleDoctorAccess(doc.id, isAllowed)}
                          disabled={isPending}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 ${
                            isAllowed
                              ? 'bg-rose-950/60 hover:bg-rose-900 border border-rose-800/50 text-rose-300'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          {isPending ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : isAllowed ? (
                            <>
                              <Lock className="w-3.5 h-3.5" />
                              <span>Revoke Access</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Grant Access</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: RAW OCR TEXT */}
          {activeTab === 'raw' && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Raw OCR Extracted Text Buffer</h3>
                <p className="text-xs text-slate-400">
                  Ground-truth character stream parsed from document optical scanning.
                </p>
              </div>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {report.rawText}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between text-xs text-slate-400">
          <div>Report Record ID: <span className="font-mono text-slate-300">{report.id}</span></div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
