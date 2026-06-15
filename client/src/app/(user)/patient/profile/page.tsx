'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  ClipboardList,
  Droplets,
  HeartPulse,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import toast from 'react-hot-toast';

import api from '@/lib/axios';
import { cn } from '@/lib/utils';

type PatientProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  bloodGroup: string;
  preferredFacility: string;
  latestRequest: {
    id: string;
    type: 'Blood' | 'Organ';
    bloodGroup: string;
    organType?: string;
    facility?: string;
    status: string;
    urgency: string;
    registeredDate: string;
  } | null;
  stats: {
    totalRequests: number;
    activeRequests: number;
    completedRequests: number;
  };
};

function formatDate(value?: string) {
  if (!value) return 'No request activity yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export default function PatientProfilePage() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get<{ success: boolean; data: PatientProfile }>('/patients/profile');
        setProfile(response.data.data);
      } catch (error: any) {
        const message = error?.response?.data?.error?.message || error?.message || 'Unable to load patient profile.';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-[#E8E4D8] bg-white">
        <div className="flex items-center gap-3 text-[#6B7A5A]">
          <Loader2 className="animate-spin" size={20} />
          <span className="text-[13px] font-semibold">Loading patient profile...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-xl border border-[#E8E4D8] bg-white p-10 text-center">
        <p className="text-[15px] font-bold text-[#1a2e0a]">Profile unavailable</p>
        <p className="mt-2 text-[13px] text-[#6B7A5A]">Please refresh the page or sign in again.</p>
      </div>
    );
  }

  const latest = profile.latestRequest;
  const initials = profile.name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'PT';

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <section className="overflow-hidden rounded-2xl border border-[#DDE6D0] bg-[#1a2e0a] text-white shadow-sm">
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_280px] md:p-8">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-red-700 text-xl font-bold">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold text-white/85">
                <ShieldCheck size={14} />
                Patient Profile
              </p>
              <h1 className="mt-3 truncate text-2xl md:text-[30px] font-bold tracking-tight">{profile.name}</h1>
              <p className="mt-2 max-w-2xl text-[14px] leading-6 text-white/70">
                Manage identity, request activity, and clinical contact details for the patient portal.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
            <p className="text-[11px] font-semibold uppercase text-white/55">Latest activity</p>
            <p className="mt-2 text-[15px] font-bold">{latest ? latest.status : 'No requests yet'}</p>
            <p className="mt-1 text-[12px] text-white/65">{formatDate(latest?.registeredDate)}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Total Requests', value: profile.stats.totalRequests, icon: ClipboardList, color: 'text-[#1A5FAA]', bg: 'bg-blue-50' },
          { label: 'Active Requests', value: profile.stats.activeRequests, icon: Activity, color: 'text-red-700', bg: 'bg-red-50' },
          { label: 'Completed', value: profile.stats.completedRequests, icon: HeartPulse, color: 'text-green-700', bg: 'bg-green-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <section key={label} className="rounded-xl border border-[#E8E4D8] bg-white p-5">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', bg, color)}>
              <Icon size={18} />
            </div>
            <p className="mt-4 text-[26px] font-bold leading-none text-[#1a2e0a]">{value}</p>
            <p className="mt-1 text-[12px] font-semibold text-[#8A9A7A]">{label}</p>
          </section>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <section className="rounded-xl border border-[#E8E4D8] bg-white p-5">
          <div className="flex items-center gap-2 border-b border-[#F0EDE3] pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-700">
              <UserRound size={17} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#1a2e0a]">Profile Details</h2>
              <p className="text-[12px] text-[#8A9A7A]">Account and clinical contact information.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              { label: 'Email', value: profile.email, icon: Mail },
              { label: 'Phone', value: profile.phone || 'Not provided', icon: Phone },
              { label: 'Blood Group', value: profile.bloodGroup || 'Not recorded', icon: Droplets },
              { label: 'Preferred Facility', value: profile.preferredFacility || 'Not selected', icon: MapPin },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-xl border border-[#F0EDE3] bg-[#FAFAF7] p-4">
                <div className="flex items-center gap-2 text-[12px] font-semibold uppercase text-[#8A9A7A]">
                  <Icon size={14} />
                  {label}
                </div>
                <p className="mt-2 break-words text-[14px] font-bold text-[#1a2e0a]">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-[#E8E4D8] bg-white p-5">
          <h2 className="text-[15px] font-bold text-[#1a2e0a]">Latest Request</h2>
          {latest ? (
            <div className="mt-4 rounded-xl border border-[#F0EDE3] bg-[#FAFAF7] p-4">
              <p className="text-[12px] font-bold uppercase text-[#8A9A7A]">{latest.type} Request</p>
              <p className="mt-2 text-[18px] font-bold text-[#1a2e0a]">
                {latest.type === 'Blood' ? latest.bloodGroup : latest.organType || 'Organ'}
              </p>
              <p className="mt-1 text-[13px] text-[#6B7A5A]">{latest.facility || 'Facility not specified'}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="rounded-full bg-[#E3F0FF] px-3 py-1 text-[12px] font-bold text-[#1A5FAA]">
                  {latest.status}
                </span>
                <Link
                  href="/patient/request-status"
                  className="inline-flex items-center gap-1.5 text-[12px] font-bold text-red-700 hover:text-red-800"
                >
                  View <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-[#D8D2C4] bg-[#FAFAF7] p-5 text-center">
              <p className="text-[13px] font-semibold text-[#6B7A5A]">No requests have been submitted yet.</p>
              <Link
                href="/patient/request-blood"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1a2e0a] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#2B4A18]"
              >
                Create Request <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
