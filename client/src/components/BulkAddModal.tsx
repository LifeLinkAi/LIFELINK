'use client';

import React, { useState, useRef } from 'react';
import api from '@/lib/axios';
import { 
  Upload, 
  Trash2, 
  Plus, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  Mail,
  User,
  ArrowLeft
} from 'lucide-react';

interface ParsedRecord {
  name: string;
  email: string;
}

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: 'donor' | 'hospital';
}

export default function BulkAddModal({ isOpen, onClose, onSuccess, type }: BulkAddModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [records, setRecords] = useState<ParsedRecord[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Stats from backend response after submission
  const [resultStats, setResultStats] = useState<{
    invitedCount: number;
    skippedCount: number;
    skipped: { name: string; email: string; reason: string }[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setErrorMsg(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndProcessFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const validateAndProcessFile = (selectedFile: File) => {
    const validExtensions = ['pdf', 'xlsx', 'xls', 'csv'];
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    
    if (!ext || !validExtensions.includes(ext)) {
      setErrorMsg('❌ Unsupported file type. Please upload a PDF, XLSX, XLS, or CSV file.');
      return;
    }

    setFile(selectedFile);
    parseFile(selectedFile);
  };

  const parseFile = async (targetFile: File) => {
    setIsParsing(true);
    setErrorMsg(null);
    const formData = new FormData();
    formData.append('file', targetFile);

    try {
      const res = await api.post('/upload/parse-bulk', formData, {
        timeout: 60000,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.success) {
        setRecords(res.data.records || []);
        setStep(2);
      } else {
        setErrorMsg('❌ Could not parse records from the file. Make sure it contains name and email fields.');
      }
    } catch (err: any) {
      console.error('File parsing error:', err);
      const errMsg = err.response?.data?.message || 'Failed to parse the uploaded file. Please try again.';
      setErrorMsg(`❌ ${errMsg}`);
    } finally {
      setIsParsing(false);
    }
  };

  const handleRecordChange = (index: number, field: keyof ParsedRecord, value: string) => {
    const updated = [...records];
    updated[index] = { ...updated[index], [field]: value };
    setRecords(updated);
  };

  const handleAddRow = () => {
    setRecords(prev => [...prev, { name: '', email: '' }]);
  };

  const handleRemoveRow = (index: number) => {
    setRecords(prev => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setFile(null);
    setRecords([]);
    setErrorMsg(null);
    setResultStats(null);
    setStep(1);
  };

  const handleSubmitInvites = async () => {
    // Validate rows
    const validRecords = records.filter(r => r.name.trim() && r.email.trim());
    
    if (validRecords.length === 0) {
      setErrorMsg('❌ No valid records to invite. Please enter at least one name and email.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmailIndex = validRecords.findIndex(r => !emailRegex.test(r.email.trim()));
    if (invalidEmailIndex !== -1) {
      setErrorMsg(`❌ Invalid email format in row ${invalidEmailIndex + 1}: "${validRecords[invalidEmailIndex].email}"`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const endpoint = type === 'donor' ? '/donors/bulk-invite' : '/hospitals/bulk-invite';

    try {
      const res = await api.post(endpoint, { users: validRecords });
      if (res.data?.success) {
        setResultStats({
          invitedCount: res.data.invitedCount,
          skippedCount: res.data.skippedCount,
          skipped: res.data.skipped || []
        });
        setStep(3);
        onSuccess();
      } else {
        setErrorMsg('❌ Failed to process invitation list.');
      }
    } catch (err: any) {
      console.error('Bulk invite error:', err);
      const errMsg = err.response?.data?.message || 'Error processing bulk invitations. Please try again.';
      setErrorMsg(`❌ ${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#121c2a]/40 backdrop-blur-sm transition-opacity"
        onClick={step !== 2 || !isSubmitting ? onClose : undefined}
      />

      {/* Modal Box */}
      <div className="bg-white rounded-2xl w-full max-w-3xl z-10 border border-outline-variant/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-[#EFF2EE]">
          <div>
            <h3 className="font-syne font-bold text-xl text-primary">
              Bulk Add {type === 'donor' ? 'Donors' : 'Hospitals'}
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              {step === 1 && 'Upload document files to scan name and email registrations.'}
              {step === 2 && `Review and edit the parsed entries before sending registration invites.`}
              {step === 3 && 'Execution complete. Review bulk registration summary.'}
            </p>
          </div>
          <button 
            disabled={isParsing || isSubmitting}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/50 text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-30"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 flex-1 overflow-y-auto min-h-[300px]">
          {errorMsg && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start gap-2.5 text-xs font-semibold">
              <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: UPLOAD FILE */}
          {step === 1 && (
            <div className="space-y-6 py-4">
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[220px] ${
                  isDragOver 
                    ? 'border-primary bg-primary/5 scale-[0.99] shadow-inner' 
                    : 'border-outline-variant/60 hover:border-primary hover:bg-[#EFF2EE]/20'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf,.xlsx,.xls,.csv"
                  className="hidden" 
                />

                {isParsing ? (
                  <div className="space-y-3 flex flex-col items-center">
                    <Loader2 size={40} className="text-primary animate-spin" />
                    <p className="font-syne font-bold text-sm text-primary">Scanning Document Data...</p>
                    <p className="text-xs text-on-surface-variant">Extracting emails and matching names using regex heuristics.</p>
                  </div>
                ) : (
                  <div className="space-y-3 flex flex-col items-center">
                    <div className="w-12 h-12 bg-[#EFF2EE] text-primary rounded-full flex items-center justify-center shadow-sm">
                      <Upload size={24} />
                    </div>
                    <p className="font-syne font-bold text-sm text-on-surface">
                      Drag & drop your list file here, or <span className="text-primary hover:underline">browse</span>
                    </p>
                    <p className="text-xs text-on-surface-variant max-w-sm">
                      Supports PDF, Excel (.xlsx, .xls) and CSV. File parsing works by scanning and matching name-email pairs.
                    </p>
                  </div>
                )}
              </div>

              {/* Sample format hint */}
              <div className="bg-neutral-50 border border-neutral-100 p-4 rounded-xl">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2">How it works:</h4>
                <ul className="text-xs text-on-surface-variant space-y-1.5 list-disc pl-4">
                  <li><strong>PDF Format:</strong> The parser scans lines for email structures and extracts names from nearby text strings.</li>
                  <li><strong>Excel/CSV Format:</strong> Columns can be in any order. Cells matching email expressions are registered along with the most plausible adjacent name cell.</li>
                </ul>
              </div>
            </div>
          )}

          {/* STEP 2: PREVIEW & EDIT GRID */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-on-surface-variant">
                  Total Parsed: <span className="text-primary font-bold">{records.length} records</span>
                </span>
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="flex items-center gap-1 px-3 py-1.5 text-primary hover:bg-[#EFF2EE] rounded-xl text-xs font-bold font-syne transition-colors border border-primary/20"
                >
                  <Plus size={14} /> Add Row
                </button>
              </div>

              <div className="border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm max-h-[350px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#EFF2EE] text-on-surface sticky top-0 z-10 border-b border-outline-variant/30">
                    <tr>
                      <th className="py-2.5 px-4 font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider w-[40px]">#</th>
                      <th className="py-2.5 px-4 font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider">Full Name</th>
                      <th className="py-2.5 px-4 font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider">Email Address</th>
                      <th className="py-2.5 px-4 font-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider text-right w-[60px]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {records.map((record, index) => (
                      <tr key={index} className="hover:bg-neutral-50/50">
                        <td className="py-2 px-4 text-xs font-semibold text-on-surface-variant">{index + 1}</td>
                        <td className="py-2 px-4">
                          <div className="relative">
                            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                            <input 
                              type="text"
                              value={record.name}
                              onChange={(e) => handleRecordChange(index, 'name', e.target.value)}
                              placeholder="Name candidate"
                              className="w-full pl-8 pr-3 py-1.5 bg-neutral-50/50 border border-outline-variant/30 focus:border-primary focus:bg-white rounded-lg text-xs outline-none transition-all placeholder:italic"
                            />
                          </div>
                        </td>
                        <td className="py-2 px-4">
                          <div className="relative">
                            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
                            <input 
                              type="email"
                              value={record.email}
                              onChange={(e) => handleRecordChange(index, 'email', e.target.value)}
                              placeholder="email@example.com"
                              className="w-full pl-8 pr-3 py-1.5 bg-neutral-50/50 border border-outline-variant/30 focus:border-primary focus:bg-white rounded-lg text-xs outline-none transition-all placeholder:italic"
                            />
                          </div>
                        </td>
                        <td className="py-2 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(index)}
                            className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors"
                            title="Remove row"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {records.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-on-surface-variant/80 text-xs italic">
                          No records available. Click "Add Row" or go back to upload a file.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS SUMMARY */}
          {step === 3 && resultStats && (
            <div className="space-y-6 py-2">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center shadow-sm">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="font-syne font-bold text-lg text-primary">Invitations Queue Configured!</h4>
                <p className="text-xs text-on-surface-variant max-w-md">
                  Bulk invites successfully processed. Users were generated in <span className="font-semibold text-yellow-600">Pending</span> state and registration setup links have been fired.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50/30 rounded-2xl border border-green-100 text-center">
                  <span className="block text-2xl font-bold font-syne text-green-700">{resultStats.invitedCount}</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-green-800">Successfully Invited</span>
                </div>
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 text-center">
                  <span className="block text-2xl font-bold font-syne text-on-surface-variant">{resultStats.skippedCount}</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">Skipped (Duplicates)</span>
                </div>
              </div>

              {resultStats.skipped.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-on-surface uppercase tracking-wider">Skipped Accounts Log</h5>
                  <div className="border border-outline-variant/30 rounded-xl overflow-hidden max-h-[160px] overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-[#EFF2EE] text-on-surface sticky top-0 border-b border-outline-variant/30">
                        <tr>
                          <th className="py-2 px-3 font-semibold text-on-surface-variant">Email</th>
                          <th className="py-2 px-3 font-semibold text-on-surface-variant">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20 bg-neutral-50/50">
                        {resultStats.skipped.map((skip, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 font-medium text-on-surface-variant">{skip.email}</td>
                            <td className="py-2 px-3 text-red-600 font-semibold italic">{skip.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-outline-variant/30 bg-surface-bright/30 flex justify-between items-center">
          {step === 1 && (
            <div className="text-[10px] font-semibold text-on-surface-variant italic">
              Awaiting upload...
            </div>
          )}

          {step === 2 && (
            <button
              disabled={isSubmitting}
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 border border-outline-variant/50 text-on-surface-variant hover:text-on-surface rounded-xl text-xs font-label-caps disabled:opacity-50"
            >
              <ArrowLeft size={14} /> Back
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 border border-outline-variant/50 text-on-surface-variant hover:text-on-surface rounded-xl text-xs font-label-caps"
            >
              Invite More
            </button>
          )}

          <div className="flex gap-2">
            <button
              disabled={isParsing || isSubmitting}
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-outline-variant/50 text-on-surface-variant hover:text-on-surface rounded-xl text-xs font-label-caps disabled:opacity-50"
            >
              {step === 3 ? 'Finish' : 'Cancel'}
            </button>

            {step === 2 && (
              <button
                disabled={isSubmitting}
                onClick={handleSubmitInvites}
                className="flex items-center gap-1.5 px-5 py-2 bg-primary text-white hover:brightness-110 rounded-xl text-xs font-label-caps shadow-md disabled:brightness-75"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Sending invites...
                  </>
                ) : (
                  <>Send Requests ({records.filter(r => r.name.trim() && r.email.trim()).length})</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
