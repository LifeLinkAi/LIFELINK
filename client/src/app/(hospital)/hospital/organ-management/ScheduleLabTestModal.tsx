import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, MapPin, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OrganMatch } from './ReviewMatchModal';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';

interface ScheduleLabTestModalProps {
  match: OrganMatch;
  onClose: () => void;
  onScheduled: () => void;
}

export default function ScheduleLabTestModal({ match, onClose, onScheduled }: ScheduleLabTestModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [facility, setFacility] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !facility) {
      toast.error('Date, time, and facility are required.');
      return;
    }

    try {
      setLoading(true);
      const scheduledTestDate = new Date(`${date}T${time}`).toISOString();
      await api.patch(`/organ-waitlist/matches/${match.id}/evaluate`, {
        action: 'APPROVE_FOR_TESTING',
        scheduledTestDate,
        testingFacility: facility,
        donorInstructions: instructions,
      });
      toast.success('Lab test scheduled successfully');
      onScheduled();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to schedule lab test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <CalendarIcon size={18} className="text-emerald-400" />
            <h2 className="font-semibold tracking-tight">Schedule Lab Test</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Info Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col gap-1">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Donor</p>
            <p className="text-sm font-semibold text-slate-900">{match.donor?.name || 'Unknown'}</p>
            <p className="text-xs text-slate-600">Blood: <span className="font-mono font-bold">{match.donor?.bloodType || 'N/A'}</span> • Organ: <span className="font-medium">{match.patient?.requiredOrgan || 'N/A'}</span></p>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Date</label>
              <div className="relative">
                <CalendarIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-slate-400 transition-colors"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Time</label>
              <input
                type="time"
                required
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full h-9 px-3 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-slate-400 transition-colors"
              />
            </div>
          </div>

          {/* Facility */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Testing Facility</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g., Central Clinical Lab, 1st Floor"
                value={facility}
                onChange={e => setFacility(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-slate-400 transition-colors placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Donor Instructions</label>
            <div className="relative">
              <FileText size={14} className="absolute left-3 top-3 text-slate-400" />
              <textarea
                placeholder="Fasting required? Bring ID?"
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                rows={3}
                className="w-full py-2 pl-9 pr-3 text-sm bg-white border border-slate-200 rounded-md outline-none focus:border-slate-400 transition-colors placeholder:text-slate-400 resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Schedule Test
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
