'use client';

import { useState } from 'react';
import { Bell, Building2, ShieldCheck, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        'relative h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400/25',
        checked ? 'bg-[#1a2e0a]' : 'bg-[#D0CCBC]'
      )}
    >
      <span className={cn('absolute top-1 h-4 w-4 rounded-full bg-white transition-transform', checked ? 'translate-x-6' : 'translate-x-1')} />
    </button>
  );
}

export default function HospitalSettingsPage() {
  const [profile, setProfile] = useState({
    name: 'LifeLink Main Campus',
    license: 'HSP-KL-2048',
    hotline: '+91 495 276 1000',
  });
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [stockAlerts, setStockAlerts] = useState(true);
  const [staffInvite, setStaffInvite] = useState('');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">Settings</h1>
        <p className="text-[13.5px] text-[#6B7A5A] mt-1">Configure hospital profile, alerts, and staff access.</p>
      </div>

      <section className="bg-white rounded-xl border border-[#E8E4D8] p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-lg bg-[#F5F2E8] text-[#1a2e0a] flex items-center justify-center">
            <Building2 size={17} />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-[#1a2e0a]">Hospital Profile Info</h2>
            <p className="text-[12px] text-[#8A9A7A]">Controlled local form fields.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'name', label: 'Hospital Name' },
            { key: 'license', label: 'License Number' },
            { key: 'hotline', label: 'Emergency Hotline' },
          ].map(field => (
            <label key={field.key} className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-[#6B7A5A]">{field.label}</span>
              <input
                value={profile[field.key as keyof typeof profile]}
                onChange={e => setProfile(value => ({ ...value, [field.key]: e.target.value }))}
                className="h-10 rounded-lg border border-[#D0CCBC] px-3 text-[13px] outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/25"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-[#E8E4D8] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={17} className="text-[#1a2e0a]" />
            <h2 className="text-[15px] font-bold text-[#1a2e0a]">Notification Alerts Toggle</h2>
          </div>
          <div className="divide-y divide-[#F0EDE3]">
            <div className="flex items-center justify-between py-3">
              <span className="text-[13px] font-medium text-[#3A4A2A]">Critical request escalation</span>
              <Toggle checked={criticalAlerts} onChange={() => setCriticalAlerts(v => !v)} />
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-[13px] font-medium text-[#3A4A2A]">Blood stock threshold alerts</span>
              <Toggle checked={stockAlerts} onChange={() => setStockAlerts(v => !v)} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E8E4D8] p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={17} className="text-[#1a2e0a]" />
            <h2 className="text-[15px] font-bold text-[#1a2e0a]">Staff Access Management</h2>
          </div>
          <div className="flex gap-2">
            <input
              value={staffInvite}
              onChange={e => setStaffInvite(e.target.value)}
              placeholder="staff@hospital.org"
              className="h-10 flex-1 rounded-lg border border-[#D0CCBC] px-3 text-[13px] outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/25"
            />
            <button className="inline-flex items-center gap-2 rounded-lg bg-[#1a2e0a] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#2B4A18]">
              <UserPlus size={14} /> Invite
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Dr. Nair - Admin', 'Nurse Lead - Editor', 'Lab Manager - Stock'].map(staff => (
              <span key={staff} className="rounded-full bg-[#F5F2E8] px-3 py-1.5 text-[12px] font-medium text-[#3A4A2A]">{staff}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
