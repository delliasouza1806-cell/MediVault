import React, { useState } from 'react';
import { User, MedicalReport } from '../types';
import { X, Upload, FileText, CheckCircle2, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { uploadReport } from '../services/api';

interface ReportUploadModalProps {
  currentUser: User;
  onClose: () => void;
  onReportCreated: (report: MedicalReport) => void;
}

export const ReportUploadModal: React.FC<ReportUploadModalProps> = ({
  currentUser,
  onClose,
  onReportCreated,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<'cbc' | 'diabetes' | 'custom'>('diabetes');
  const [title, setTitle] = useState('Diabetic Glycemic & Kidney Health Panel');
  const [category, setCategory] = useState<'Metabolic' | 'Hematology' | 'Lipid Profile' | 'General'>('Metabolic');
  const [labName, setLabName] = useState('Max Healthcare Diagnostics');
  const [customText, setCustomText] = useState(`MAX HEALTHCARE PATHOLOGY LAB
Patient: Rahul Verma | Ref No: 881290
Test: Fasting Blood Sugar: 148 mg/dL (Reference: 70 - 99 mg/dL) [HIGH]
Test: HbA1c: 7.6 % (Reference: 4.0 - 5.6 %) [HIGH]
Test: Serum Creatinine: 0.98 mg/dL (Reference: 0.70 - 1.30 mg/dL) [NORMAL]
Test: Blood Urea: 18 mg/dL (Reference: 15 - 40 mg/dL) [NORMAL]`);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePresetSelect = (preset: 'cbc' | 'diabetes' | 'custom') => {
    setSelectedPreset(preset);
    if (preset === 'cbc') {
      setTitle('Complete Blood Count & Platelet Screen');
      setCategory('Hematology');
      setLabName('SRL Diagnostic Centre');
    } else if (preset === 'diabetes') {
      setTitle('Diabetic Glycemic & Kidney Health Panel');
      setCategory('Metabolic');
      setLabName('Max Healthcare Diagnostics');
    } else {
      setTitle('Clinical Laboratory Evaluation');
      setCategory('General');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setError(null);

    try {
      const created = await uploadReport({
        patientId: currentUser.id,
        patientName: currentUser.name,
        title,
        category,
        labName,
        preset: selectedPreset !== 'custom' ? selectedPreset : undefined,
        rawText: selectedPreset === 'custom' ? customText : undefined,
      });

      onReportCreated(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload report');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Upload Diagnostic Medical Report</h2>
              <p className="text-xs text-slate-400">OCR Optical Recognition & AES-256 Vault Ingestion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-rose-950/40 border border-rose-800 p-3 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Preset Selector for 2-Minute Demo */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              1-Click Demo Report Samples
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => handlePresetSelect('diabetes')}
                className={`p-3 rounded-xl text-left border transition text-xs ${
                  selectedPreset === 'diabetes'
                    ? 'bg-slate-800 border-teal-500 text-teal-300 shadow-sm'
                    : 'bg-slate-800/40 border-slate-700/70 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Glycemic Panel</span>
                  {selectedPreset === 'diabetes' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">High FBS (152), HbA1c (7.8%)</div>
              </button>

              <button
                type="button"
                onClick={() => handlePresetSelect('cbc')}
                className={`p-3 rounded-xl text-left border transition text-xs ${
                  selectedPreset === 'cbc'
                    ? 'bg-slate-800 border-teal-500 text-teal-300 shadow-sm'
                    : 'bg-slate-800/40 border-slate-700/70 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>CBC Hematology</span>
                  {selectedPreset === 'cbc' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Low Hemoglobin (11.2)</div>
              </button>

              <button
                type="button"
                onClick={() => handlePresetSelect('custom')}
                className={`p-3 rounded-xl text-left border transition text-xs ${
                  selectedPreset === 'custom'
                    ? 'bg-slate-800 border-teal-500 text-teal-300 shadow-sm'
                    : 'bg-slate-800/40 border-slate-700/70 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Custom OCR Text</span>
                  {selectedPreset === 'custom' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Paste custom lab findings</div>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Report Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Clinical Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Metabolic">Metabolic / Glycemic</option>
                <option value="Hematology">Hematology / Blood</option>
                <option value="Lipid Profile">Lipid & Cardiovascular</option>
                <option value="General">General Biochemistry</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Diagnostic Laboratory / Hospital</label>
            <input
              type="text"
              value={labName}
              onChange={(e) => setLabName(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {selectedPreset === 'custom' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Raw Lab Text (Format: Test: Value Unit (Ref))</label>
              <textarea
                rows={5}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                placeholder="Example: Fasting Blood Sugar: 120 mg/dL (Reference: 70 - 99 mg/dL)"
              />
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3.5 flex items-center space-x-3 text-xs text-slate-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-[11px] leading-relaxed">
              Upon submission, the document payload is encrypted using <strong>AES-256-GCM</strong>, stamped with a <strong>SHA-256</strong> checksum, and filed to your secure vault with default access restricted only to your assigned physician.
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-lg transition flex items-center space-x-2 disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Encrypting & Parsing...' : 'Encrypt & Ingest Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
