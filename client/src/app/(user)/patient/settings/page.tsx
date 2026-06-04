'use client';

import { useState } from 'react';
import { Bell, Lock, Mail, Shield, User } from 'lucide-react';
import { cn } from '@/lib/utils';

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        'relative h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
        checked ? 'bg-red-700' : 'bg-[#D0CCBC]'
      )}
    >
      <span
        className={cn(
          'absolute top-1 h-4 w-4 rounded-full bg-white transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );
}

export default function PatientSettingsPage() {
  const [profile, setProfile] = useState({
    name: 'Patient User',
    phone: '+91 98765 43210',
    bloodGroup: 'O-',
  });
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-bold text-[#1a2e0a] tracking-tight">Settings</h1>
        <p className="text-[13.5px] text-[#6B7A5A] mt-1">
          Manage your patient profile, alerts, and account preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <section className="bg-white rounded-xl border border-[#E8E4D8] p-5 xl:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
              <User size={17} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#1a2e0a]">Profile Information</h2>
              <p className="text-[12px] text-[#8A9A7A]">Dummy fields for local UI editing.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-[#6B7A5A]">Full name</span>
              <input
                value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                className="h-10 rounded-lg border border-[#D0CCBC] bg-white px-3 text-[13px] text-[#1a2e0a] outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-[#6B7A5A]">Phone</span>
              <input
                value={profile.phone}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                className="h-10 rounded-lg border border-[#D0CCBC] bg-white px-3 text-[13px] text-[#1a2e0a] outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-[#6B7A5A]">Blood group</span>
              <select
                value={profile.bloodGroup}
                onChange={e => setProfile(p => ({ ...p, bloodGroup: e.target.value }))}
                className="h-10 rounded-lg border border-[#D0CCBC] bg-white px-3 text-[13px] text-[#1a2e0a] outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              >
                {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-[#E8E4D8] p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-lg bg-green-50 text-green-700 flex items-center justify-center">
              <Bell size={17} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#1a2e0a]">Notification Preferences</h2>
              <p className="text-[12px] text-[#8A9A7A]">Local visual toggles.</p>
            </div>
          </div>
          <div className="flex flex-col divide-y divide-[#F0EDE3]">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-[#6B7A5A]" />
                <span className="text-[13px] font-medium text-[#3A4A2A]">Email alerts</span>
              </div>
              <Toggle checked={emailAlerts} onChange={() => setEmailAlerts(v => !v)} />
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <Bell size={15} className="text-[#6B7A5A]" />
                <span className="text-[13px] font-medium text-[#3A4A2A]">Push notifications</span>
              </div>
              <Toggle checked={pushAlerts} onChange={() => setPushAlerts(v => !v)} />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-[#E8E4D8] p-5 xl:col-span-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#F5F2E8] text-[#1a2e0a] flex items-center justify-center">
                <Shield size={17} />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-[#1a2e0a]">Account Security</h2>
                <p className="text-[12px] text-[#8A9A7A]">Mock security controls for UI completion.</p>
              </div>
            </div>
            <Toggle checked={twoFactor} onChange={() => setTwoFactor(v => !v)} />
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-[#6B7A5A]">Current password</span>
              <input
                type="password"
                placeholder="Enter current password"
                className="h-10 rounded-lg border border-[#D0CCBC] bg-white px-3 text-[13px] text-[#1a2e0a] outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-semibold text-[#6B7A5A]">New password</span>
              <input
                type="password"
                placeholder="Enter new password"
                className="h-10 rounded-lg border border-[#D0CCBC] bg-white px-3 text-[13px] text-[#1a2e0a] outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </label>
          </div>
          <button className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#1a2e0a] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#2B4A18] transition-colors">
            <Lock size={14} /> Save Changes
          </button>
        </section>
      </div>
    </div>
  );
}
