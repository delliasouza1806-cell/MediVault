import React, { useState } from 'react';
import { User, MedicalReport, Appointment } from '../types';
import { X, Calendar, Clock, Stethoscope, AlertTriangle, CheckCircle2, ShieldCheck, FileText } from 'lucide-react';
import { bookAppointment } from '../services/api';

interface AppointmentModalProps {
  currentUser: User;
  doctors: User[];
  reports: MedicalReport[];
  existingAppointments: Appointment[];
  preselectedReportId?: string;
  onClose: () => void;
  onAppointmentBooked: (apt: Appointment) => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  currentUser,
  doctors,
  reports,
  existingAppointments,
  preselectedReportId,
  onClose,
  onAppointmentBooked,
}) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || 'doc-1');
  const [date, setDate] = useState('2026-10-15');
  const [timeSlot, setTimeSlot] = useState('02:00 PM');
  const [reason, setReason] = useState('Review recent blood glucose & metabolic panel results');
  const [attachedReportId, setAttachedReportId] = useState(preselectedReportId || (reports[0]?.id || ''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const availableSlots = [
    '09:30 AM',
    '10:30 AM',
    '11:15 AM',
    '02:00 PM',
    '03:15 PM',
    '04:30 PM',
  ];

  // Check if a slot is already taken for the selected doctor and date
  const isSlotOccupied = (slot: string) => {
    return existingAppointments.some(
      (a) => a.doctorId === selectedDoctorId && a.date === date && a.timeSlot === slot && a.status !== 'cancelled'
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const booked = await bookAppointment({
        patientId: currentUser.id,
        patientName: currentUser.name,
        doctorId: selectedDoctorId,
        date,
        timeSlot,
        reason,
        attachedReportId: attachedReportId || undefined,
      });

      onAppointmentBooked(booked);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to book appointment. Please try another slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Book Clinical Consultation</h2>
              <p className="text-xs text-slate-400">Atomic Schedule Verification with Conflict Guard</p>
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
          {errorMessage && (
            <div className="bg-rose-950/50 border border-rose-600/70 p-3.5 rounded-xl text-xs text-rose-200 flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Booking Conflict Detected:</strong>
                {errorMessage}
              </div>
            </div>
          )}

          {/* Select Doctor */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Select Consulting Physician</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {doctors.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setSelectedDoctorId(doc.id)}
                  className={`p-3 rounded-xl border text-left transition ${
                    selectedDoctorId === doc.id
                      ? 'bg-slate-800 border-teal-500 text-teal-300'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="w-4 h-4 text-teal-400 shrink-0" />
                    <span className="text-xs font-bold">{doc.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{doc.specialization}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Appointment Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Time Slot Picker */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Select Time Slot</label>
              <div className="grid grid-cols-3 gap-1.5">
                {availableSlots.map((slot) => {
                  const occupied = isSlotOccupied(slot);
                  const isSelected = timeSlot === slot;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={occupied}
                      onClick={() => setTimeSlot(slot)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-mono transition border ${
                        occupied
                          ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-teal-500 text-slate-950 font-bold border-teal-400 shadow'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                      title={occupied ? 'This slot is already booked for this doctor.' : slot}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Attach Report (Vault ACL integration) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>Attach Encrypted Report from Vault (Optional)</span>
              <span className="text-[10px] text-teal-400 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Auto-grants Doctor Read ACL</span>
              </span>
            </label>
            <select
              value={attachedReportId}
              onChange={(e) => setAttachedReportId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
            >
              <option value="">-- No report attached --</option>
              {reports.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.date} - {r.category})
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Clinical Reason for Consultation</label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
              placeholder="e.g. Discuss elevated blood glucose and dietary changes"
            />
          </div>

          {/* Concurrency guarantee callout */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="font-mono text-slate-300">
              ACID Guarantee: UNIQUE (doctor_id, date, slot)
            </span>
            <span className="text-emerald-400 font-semibold">Zero Double-Booking</span>
          </div>

          {/* Submit */}
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
              disabled={isSubmitting || isSlotOccupied(timeSlot)}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-500 active:scale-95 text-slate-950 font-bold text-xs rounded-lg shadow-lg transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
              <span>{isSubmitting ? 'Verifying...' : 'Confirm Reservation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
