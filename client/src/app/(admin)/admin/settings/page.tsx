'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

// Define Settings interface for state management
interface Settings {
  platformName: string;
  platformTagline: string;
  timezone: string;
  distanceUnit: 'km' | 'mi';
  maintenanceMode: boolean;
  maintenanceMessage: string;
  
  logoUrl: string;
  primaryColor: string;
  darkMode: boolean;
  
  defaultLanguage: string;
  currency: string;
  dateFormat: string;
  
  autoEscalationTime: number;
  airUnitThreshold: 'critical' | 'high_critical';
  
  requireDonorVerification: boolean;
  hospitalSyncInterval: number;
  
  tempWarningThreshold: number;
  bloodExpiryAlertDays: number;
  
  smsGateway: 'twilio' | 'vonage';
  emailSender: string;
  
  mfaEnabled: boolean;
  sessionTimeout: number;
}

// Default settings
const DEFAULT_SETTINGS: Settings = {
  platformName: 'LifeLink Core',
  platformTagline: 'Emergency AI Coordination',
  timezone: '(UTC-08:00) Pacific Time (US & Canada)',
  distanceUnit: 'km',
  maintenanceMode: false,
  maintenanceMessage: 'LifeLink Core is currently undergoing scheduled maintenance. Emergency routing has been shifted to secondary local networks.',
  
  logoUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=80&h=80&fit=crop',
  primaryColor: 'dark-green',
  darkMode: false,
  
  defaultLanguage: 'English',
  currency: 'USD ($)',
  dateFormat: 'YYYY-MM-DD',
  
  autoEscalationTime: 5,
  airUnitThreshold: 'critical',
  
  requireDonorVerification: true,
  hospitalSyncInterval: 15,
  
  tempWarningThreshold: 4,
  bloodExpiryAlertDays: 7,
  
  smsGateway: 'twilio',
  emailSender: 'no-reply@lifelink.org',
  
  mfaEnabled: true,
  sessionTimeout: 60,
};

// Team member interface
interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'Active' | 'Pending';
}

export default function SettingsPage() {
  // 1. Core Settings States
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // 2. Navigation Tab State
  const [activeTab, setActiveTab] = useState<string>('general');

  // 3. Modals & Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [dangerConfirmOpen, setDangerConfirmOpen] = useState(false);
  const [dangerConfirmText, setDangerConfirmText] = useState('');

  // 4. Team Members List
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Dr. Sarah Connor', role: 'Super Admin', email: 'sarah.connor@lifelink.org', status: 'Active' },
    { id: '2', name: 'Alexander Wright', role: 'Coordinator', email: 'alex.wright@lifelink.org', status: 'Active' },
    { id: '3', name: 'Marcus Miller', role: 'Dispatcher', email: 'marcus.m@lifelink.org', status: 'Active' },
    { id: '4', name: 'Elena Rostova', role: 'Medical Verifier', email: 'elena.r@lifelink.org', status: 'Pending' },
  ]);

  // Invite member form state
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'Coordinator' });

  // Toast notifier helper
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Check if configuration has unsaved changes (dirty)
  const isDirty = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(savedSettings);
  }, [settings, savedSettings]);

  // Handle setting updates
  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Discard unsaved changes
  const handleDiscard = () => {
    setSettings(savedSettings);
    showToast('↩️ Unsaved changes discarded.');
  };

  // Save changes
  const handleSave = () => {
    setSavedSettings(settings);
    showToast('💾 Settings successfully saved and compiled.');
  };

  // Reset to default
  const handleResetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    showToast('🔄 Settings reset to factory defaults.');
  };

  // Export JSON configuration file
  const handleExportConfig = () => {
    const configData = JSON.stringify(settings, null, 2);
    const blob = new Blob([configData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lifelink-config-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('📥 Configuration file exported successfully.');
  };

  // Invite team member submit
  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) {
      showToast('❌ Please fill in all fields.');
      return;
    }
    const member: TeamMember = {
      id: (teamMembers.length + 1).toString(),
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      status: 'Pending',
    };
    setTeamMembers(prev => [...prev, member]);
    setNewMember({ name: '', email: '', role: 'Coordinator' });
    setInviteModalOpen(false);
    showToast(`✉️ Invitation sent to ${member.email}`);
  };

  // Delete team member
  const handleDeleteMember = (id: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
    showToast('🗑️ Team member access revoked.');
  };

  // Wipe logs database confirmation
  const handleWipeDatabase = (e: React.FormEvent) => {
    e.preventDefault();
    if (dangerConfirmText !== 'DELETE LOGS') {
      showToast('❌ Confirmation text matches failed.');
      return;
    }
    setDangerConfirmOpen(false);
    setDangerConfirmText('');
    showToast('🔥 System log logs successfully wiped from memory.');
  };

  return (
    <div className="bg-settings-bg text-settings-on-bg font-body-md min-h-screen">
      <main className="w-full max-w-[1440px] mx-auto px-margin-mobile md:px-margin-desktop py-lg pb-xxl relative select-none">
        
        {/* Inline Custom CSS Styles for switches and transition focus states */}
        <style dangerouslySetInnerHTML={{ __html: `
          .glass-panel {
              background: rgba(255, 255, 255, 0.7);
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
              border: 1px solid rgba(216, 210, 196, 0.5);
          }
          
          .switch {
              position: relative;
              display: inline-block;
              width: 44px;
              height: 24px;
          }

          .switch input { 
              opacity: 0;
              width: 0;
              height: 0;
          }

          .slider {
              position: absolute;
              cursor: pointer;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-color: #D8D2C4;
              transition: .4s;
              border-radius: 24px;
          }

          .slider:before {
              position: absolute;
              content: "";
              height: 18px;
              width: 18px;
              left: 3px;
              bottom: 3px;
              background-color: white;
              transition: .4s;
              border-radius: 50%;
          }

          input:checked + .slider {
              background-color: #14291F;
          }

          input:focus + .slider {
              box-shadow: 0 0 1px #14291F;
          }

          input:checked + .slider:before {
              transform: translateX(20px);
          }
          
          .custom-input {
              transition: all 0.2s ease;
          }
          .custom-input:focus {
              outline: none;
              border-color: #14291F;
              box-shadow: 0 0 0 1px #14291F;
          }
        `}} />

        {/* Global Action Alerts */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-[60] bg-settings-on-bg text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-white/10 animate-fade-in-up">
            <span className="material-symbols-outlined text-[20px] text-[#c8f17a]">check_circle</span>
            <span className="font-dmsans text-sm font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* PAGE HEADER */}
        <header className="mb-xl">
          <div className="flex items-center gap-2 mb-sm text-on-surface-variant font-body-sm">
            <Link 
              href="/admin/dashboard" 
              className="hover:text-settings-primary transition-colors flex items-center gap-1.5 group"
            >
              <span className="material-symbols-outlined transition-transform duration-300 group-hover:-translate-x-0.5 text-[16px]">arrow_back</span>
              <span>Back to Dashboard</span>
            </Link>
            <span className="text-settings-outline/30 mx-1">•</span>
            <Link href="/admin/dashboard" className="hover:text-settings-primary transition-colors">
              Admin
            </Link>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
            <span className="text-settings-primary font-medium">Settings</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-lg">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link 
                  href="/admin/dashboard"
                  className="w-10 h-10 rounded-full hover:bg-settings-surface-dim text-on-surface-variant hover:text-settings-primary transition-all duration-300 ease-in-out flex items-center justify-center border border-settings-outline shadow-sm bg-white group hover:scale-105 hover:shadow-md hover:border-settings-primary"
                  title="Back to Dashboard"
                  aria-label="Back to Dashboard"
                >
                  <span className="material-symbols-outlined transition-transform duration-300 group-hover:-translate-x-1" style={{ fontSize: '22px' }}>arrow_back</span>
                </Link>
                <h1 className="font-headline-lg text-headline-lg text-settings-primary text-3xl font-bold">Settings</h1>
              </div>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl text-base">
                Configure platform behavior, rules, integrations, and team access.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-md">
              <span className="font-body-sm text-body-sm text-on-surface-variant mr-sm">Last saved: Today, 09:41 AM</span>
              <button 
                onClick={handleResetDefaults}
                className="px-md py-sm rounded-lg border border-settings-outline text-settings-on-bg font-body-sm bg-white hover:bg-settings-surface-dim transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>restart_alt</span>
                Reset Defaults
              </button>
              <button 
                onClick={handleExportConfig}
                className="px-md py-sm rounded-lg border border-settings-outline text-settings-on-bg font-body-sm bg-white hover:bg-settings-surface-dim transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
                Export Config
              </button>
            </div>
          </div>
        </header>

        {/* TWO-COLUMN LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-xl relative">
          
          {/* LEFT NAV BAR */}
          <aside className="w-full lg:w-[250px] shrink-0 lg:sticky lg:top-8 h-max">
            <nav className="flex flex-col gap-sm">
              
              <div className="mb-2">
                <h3 className="font-label-caps text-label-caps text-on-surface-variant px-md mb-2 text-xs font-bold tracking-wider opacity-75">GENERAL</h3>
                <button 
                  onClick={() => setActiveTab('general')}
                  className={`w-full flex items-center gap-3 px-md py-sm rounded-lg text-left transition-all ${
                    activeTab === 'general' ? 'bg-settings-surface-dim text-settings-primary font-medium' : 'text-on-surface-variant hover:bg-settings-surface-dim/50 hover:text-settings-primary'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: activeTab === 'general' ? "'FILL' 1" : undefined }}>settings</span>
                  General
                </button>
                <button 
                  onClick={() => setActiveTab('branding')}
                  className={`w-full flex items-center gap-3 px-md py-sm rounded-lg text-left transition-all ${
                    activeTab === 'branding' ? 'bg-settings-surface-dim text-settings-primary font-medium' : 'text-on-surface-variant hover:bg-settings-surface-dim/50 hover:text-settings-primary'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: activeTab === 'branding' ? "'FILL' 1" : undefined }}>palette</span>
                  Branding
                </button>
                <button 
                  onClick={() => setActiveTab('localization')}
                  className={`w-full flex items-center gap-3 px-md py-sm rounded-lg text-left transition-all ${
                    activeTab === 'localization' ? 'bg-settings-surface-dim text-settings-primary font-medium' : 'text-on-surface-variant hover:bg-settings-surface-dim/50 hover:text-settings-primary'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: activeTab === 'localization' ? "'FILL' 1" : undefined }}>language</span>
                  Localization
                </button>
              </div>

              <div className="mb-2 mt-sm">
                <h3 className="font-label-caps text-label-caps text-on-surface-variant px-md mb-2 text-xs font-bold tracking-wider opacity-75">PLATFORM RULES</h3>
                <button 
                  onClick={() => setActiveTab('emergency')}
                  className={`w-full flex items-center gap-3 px-md py-sm rounded-lg text-left transition-all ${
                    activeTab === 'emergency' ? 'bg-settings-surface-dim text-settings-primary font-medium' : 'text-on-surface-variant hover:bg-settings-surface-dim/50 hover:text-settings-primary'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: activeTab === 'emergency' ? "'FILL' 1" : undefined }}>emergency</span>
                  Emergency Rules
                </button>
                <button 
                  onClick={() => setActiveTab('verification')}
                  className={`w-full flex items-center gap-3 px-md py-sm rounded-lg text-left transition-all ${
                    activeTab === 'verification' ? 'bg-settings-surface-dim text-settings-primary font-medium' : 'text-on-surface-variant hover:bg-settings-surface-dim/50 hover:text-settings-primary'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: activeTab === 'verification' ? "'FILL' 1" : undefined }}>verified</span>
                  Verification Rules
                </button>
                <button 
                  onClick={() => setActiveTab('blood')}
                  className={`w-full flex items-center gap-3 px-md py-sm rounded-lg text-left transition-all ${
                    activeTab === 'blood' ? 'bg-settings-surface-dim text-settings-primary font-medium' : 'text-on-surface-variant hover:bg-settings-surface-dim/50 hover:text-settings-primary'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: activeTab === 'blood' ? "'FILL' 1" : undefined }}>bloodtype</span>
                  Blood &amp; Organ Rules
                </button>
              </div>

              <div className="mb-2 mt-sm">
                <h3 className="font-label-caps text-label-caps text-on-surface-variant px-md mb-2 text-xs font-bold tracking-wider opacity-75">SYSTEM</h3>
                <button 
                  onClick={() => setActiveTab('communications')}
                  className={`w-full flex items-center gap-3 px-md py-sm rounded-lg text-left transition-all ${
                    activeTab === 'communications' ? 'bg-settings-surface-dim text-settings-primary font-medium' : 'text-on-surface-variant hover:bg-settings-surface-dim/50 hover:text-settings-primary'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: activeTab === 'communications' ? "'FILL' 1" : undefined }}>forum</span>
                  Communications
                </button>
                <button 
                  onClick={() => setActiveTab('team')}
                  className={`w-full flex items-center gap-3 px-md py-sm rounded-lg text-left transition-all ${
                    activeTab === 'team' ? 'bg-settings-surface-dim text-settings-primary font-medium' : 'text-on-surface-variant hover:bg-settings-surface-dim/50 hover:text-settings-primary'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: activeTab === 'team' ? "'FILL' 1" : undefined }}>group</span>
                  Team &amp; Access
                </button>
                <button 
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center gap-3 px-md py-sm rounded-lg text-left transition-all ${
                    activeTab === 'security' ? 'bg-settings-surface-dim text-settings-primary font-medium' : 'text-on-surface-variant hover:bg-settings-surface-dim/50 hover:text-settings-primary'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: activeTab === 'security' ? "'FILL' 1" : undefined }}>security</span>
                  Security
                </button>
              </div>

              <div className="mt-sm">
                <button 
                  onClick={() => setActiveTab('danger')}
                  className={`w-full flex items-center gap-3 px-md py-sm rounded-lg text-left transition-all ${
                    activeTab === 'danger' ? 'bg-[#ffdad6] text-[#ba1a1a] font-medium' : 'text-settings-error hover:bg-[#ffdad6]/40'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: activeTab === 'danger' ? "'FILL' 1" : undefined }}>warning</span>
                  Danger Zone
                </button>
              </div>

            </nav>
          </aside>

          {/* RIGHT CONTENT TAB SWITCHES */}
          <div className="flex-grow max-w-4xl flex flex-col gap-lg pb-10">
            
            {/* GENERAL TAB CONTENT */}
            {activeTab === 'general' && (
              <>
                {/* Platform Identity */}
                <section className="bg-settings-surface rounded-xl border border-settings-outline-var shadow-[0_8px_30px_rgba(85,107,47,0.04)] overflow-hidden">
                  <div className="px-lg py-md border-b border-settings-outline-var bg-settings-surface-dim/30">
                    <h2 className="font-headline-sm text-headline-sm text-settings-primary text-lg font-bold">Platform Identity</h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Basic information about your LifeLink instance.</p>
                  </div>
                  <div className="p-lg flex flex-col gap-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                      <div className="flex flex-col gap-2">
                        <label className="font-body-sm text-body-sm font-medium text-settings-primary">Platform Name</label>
                        <input 
                          value={settings.platformName}
                          onChange={(e) => updateSetting('platformName', e.target.value)}
                          className="custom-input w-full px-md py-sm rounded-lg border border-settings-outline bg-settings-surface text-settings-on-bg font-body-md" 
                          type="text" 
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-body-sm text-body-sm font-medium text-settings-primary">Platform Tagline</label>
                        <input 
                          value={settings.platformTagline}
                          onChange={(e) => updateSetting('platformTagline', e.target.value)}
                          className="custom-input w-full px-md py-sm rounded-lg border border-settings-outline bg-settings-surface text-settings-on-bg font-body-md" 
                          type="text" 
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-body-sm text-body-sm font-medium text-settings-primary">Platform URL</label>
                      <div className="flex items-center w-full px-md py-sm rounded-lg border border-settings-outline-var bg-settings-surface-dim text-on-surface-variant font-body-md cursor-not-allowed">
                        <span className="material-symbols-outlined mr-2 opacity-50" style={{ fontSize: '18px' }}>lock</span>
                        https://app.lifelink.org/core
                      </div>
                    </div>
                  </div>
                </section>

                {/* System Preferences */}
                <section className="bg-settings-surface rounded-xl border border-settings-outline-var shadow-[0_8px_30px_rgba(85,107,47,0.04)] overflow-hidden">
                  <div className="px-lg py-md border-b border-settings-outline-var bg-settings-surface-dim/30">
                    <h2 className="font-headline-sm text-headline-sm text-settings-primary text-lg font-bold">System Preferences</h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Regional and formatting defaults.</p>
                  </div>
                  <div className="p-lg flex flex-col gap-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                      <div className="flex flex-col gap-2">
                        <label className="font-body-sm text-body-sm font-medium text-settings-primary">Timezone</label>
                        <div className="relative">
                          <select 
                            value={settings.timezone}
                            onChange={(e) => updateSetting('timezone', e.target.value)}
                            className="custom-input appearance-none w-full px-md py-sm pr-10 rounded-lg border border-settings-outline bg-settings-surface text-settings-on-bg font-body-md cursor-pointer"
                          >
                            <option>(UTC+00:00) Coordinated Universal Time</option>
                            <option>(UTC-05:00) Eastern Time (US &amp; Canada)</option>
                            <option>(UTC-08:00) Pacific Time (US &amp; Canada)</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-body-sm text-body-sm font-medium text-settings-primary">Distance Unit</label>
                        <div className="flex rounded-lg border border-settings-outline overflow-hidden">
                          <button 
                            onClick={() => updateSetting('distanceUnit', 'km')}
                            className={`flex-1 py-sm font-medium font-body-sm transition ${
                              settings.distanceUnit === 'km' ? 'bg-settings-primary text-white' : 'bg-settings-surface text-on-surface-variant hover:bg-settings-surface-dim'
                            }`}
                          >
                            Kilometers (km)
                          </button>
                          <button 
                            onClick={() => updateSetting('distanceUnit', 'mi')}
                            className={`flex-1 py-sm font-medium font-body-sm transition ${
                              settings.distanceUnit === 'mi' ? 'bg-settings-primary text-white' : 'bg-settings-surface text-on-surface-variant hover:bg-settings-surface-dim'
                            }`}
                          >
                            Miles (mi)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Maintenance Mode */}
                <section className="bg-settings-surface rounded-xl border border-settings-outline-var shadow-[0_8px_30px_rgba(85,107,47,0.04)] overflow-hidden">
                  <div className="px-lg py-md border-b border-settings-outline-var bg-settings-surface-dim/30 flex justify-between items-center">
                    <div>
                      <h2 className="font-headline-sm text-headline-sm text-settings-primary text-lg font-bold">Maintenance Mode</h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Temporarily disable access for non-admin users.</p>
                    </div>
                    <label className="switch select-none">
                      <input 
                        type="checkbox"
                        checked={settings.maintenanceMode}
                        onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="p-lg">
                    <div className="bg-[#ffdad6]/40 border border-[#ffdad6] rounded-lg p-md mb-md flex gap-sm items-start">
                      <span className="material-symbols-outlined text-settings-error mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                      <p className="font-body-sm text-body-sm text-[#850004]">
                        Enabling maintenance mode will block all active emergency dispatch routes. Ensure secondary manual protocols are active.
                      </p>
                    </div>
                    <div className={`flex flex-col gap-2 transition-opacity duration-300 ${!settings.maintenanceMode ? 'opacity-50 pointer-events-none' : ''}`}>
                      <label className="font-body-sm text-body-sm font-medium text-settings-primary">Maintenance Message (Public)</label>
                      <textarea 
                        disabled={!settings.maintenanceMode}
                        value={settings.maintenanceMessage}
                        onChange={(e) => updateSetting('maintenanceMessage', e.target.value)}
                        className="custom-input w-full px-md py-sm rounded-lg border border-settings-outline bg-settings-surface text-settings-on-bg font-body-md resize-none" 
                        rows={3}
                      />
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* BRANDING TAB CONTENT */}
            {activeTab === 'branding' && (
              <section className="bg-settings-surface rounded-xl border border-settings-outline-var shadow-[0_8px_30px_rgba(85,107,47,0.04)] overflow-hidden">
                <div className="px-lg py-md border-b border-settings-outline-var bg-settings-surface-dim/30">
                  <h2 className="font-headline-sm text-headline-sm text-settings-primary text-lg font-bold">Branding & Theme</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Customize the visual identity of your instance.</p>
                </div>
                <div className="p-lg flex flex-col gap-lg">
                  <div className="flex flex-col md:flex-row items-center gap-lg">
                    <img src={settings.logoUrl} className="w-16 h-16 rounded-xl border border-settings-outline-var object-cover shadow-sm bg-settings-bg" alt="Logo preview" />
                    <div className="flex-grow w-full flex flex-col gap-2">
                      <label className="font-body-sm text-body-sm font-medium text-settings-primary">Logo URL</label>
                      <input 
                        value={settings.logoUrl}
                        onChange={(e) => updateSetting('logoUrl', e.target.value)}
                        className="custom-input w-full px-md py-sm rounded-lg border border-settings-outline bg-settings-surface text-settings-on-bg font-body-md" 
                        type="text" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                    <div className="flex flex-col gap-2">
                      <label className="font-body-sm text-body-sm font-medium text-settings-primary">Primary Theme Tone</label>
                      <div className="relative">
                        <select 
                          value={settings.primaryColor}
                          onChange={(e) => updateSetting('primaryColor', e.target.value)}
                          className="custom-input appearance-none w-full px-md py-sm pr-10 rounded-lg border border-settings-outline bg-settings-surface text-settings-on-bg font-body-md cursor-pointer"
                        >
                          <option value="dark-green">LifeLink Forest Green (Default)</option>
                          <option value="emerald">Active Emerald</option>
                          <option value="blue">Clinical Blue</option>
                          <option value="slate">Admin Tech Slate</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-body-sm text-body-sm font-medium text-settings-primary">Display Scheme</label>
                      <div className="flex items-center justify-between p-2 rounded-lg border border-settings-outline bg-white h-[44px]">
                        <span className="font-body-sm text-body-sm text-on-surface-variant pl-2">Force Dark Mode</span>
                        <label className="switch">
                          <input 
                            type="checkbox"
                            checked={settings.darkMode}
                            onChange={(e) => updateSetting('darkMode', e.target.checked)}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* LOCALIZATION TAB CONTENT */}
            {activeTab === 'localization' && (
              <section className="bg-settings-surface rounded-xl border border-settings-outline-var shadow-[0_8px_30px_rgba(85,107,47,0.04)] overflow-hidden">
                <div className="px-lg py-md border-b border-settings-outline-var bg-settings-surface-dim/30">
                  <h2 className="font-headline-sm text-headline-sm text-settings-primary text-lg font-bold">Localization</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Configure language, formats, and currency parameters.</p>
                </div>
                <div className="p-lg flex flex-col gap-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                    <div className="flex flex-col gap-2">
                      <label className="font-body-sm text-body-sm font-medium text-settings-primary">Default Language</label>
                      <div className="relative">
                        <select 
                          value={settings.defaultLanguage}
                          onChange={(e) => updateSetting('defaultLanguage', e.target.value)}
                          className="custom-input appearance-none w-full px-md py-sm pr-10 rounded-lg border border-settings-outline bg-settings-surface text-settings-on-bg font-body-md cursor-pointer"
                        >
                          <option>English</option>
                          <option>Spanish (Español)</option>
                          <option>French (Français)</option>
                          <option>Malay (Bahasa Melayu)</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-body-sm text-body-sm font-medium text-settings-primary">Default Currency</label>
                      <div className="relative">
                        <select 
                          value={settings.currency}
                          onChange={(e) => updateSetting('currency', e.target.value)}
                          className="custom-input appearance-none w-full px-md py-sm pr-10 rounded-lg border border-settings-outline bg-settings-surface text-settings-on-bg font-body-md cursor-pointer"
                        >
                          <option>USD ($)</option>
                          <option>EUR (€)</option>
                          <option>GBP (£)</option>
                          <option>MYR (RM)</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-body-sm text-body-sm font-medium text-settings-primary">Date Format</label>
                      <div className="relative">
                        <select 
                          value={settings.dateFormat}
                          onChange={(e) => updateSetting('dateFormat', e.target.value)}
                          className="custom-input appearance-none w-full px-md py-sm pr-10 rounded-lg border border-settings-outline bg-settings-surface text-settings-on-bg font-body-md cursor-pointer"
                        >
                          <option value="YYYY-MM-DD">YYYY-MM-DD (2026-05-22)</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY (22/05/2026)</option>
                          <option value="MM-DD-YYYY">MM-DD-YYYY (05-22-2026)</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* EMERGENCY RULES TAB CONTENT */}
            {activeTab === 'emergency' && (
              <section className="bg-settings-surface rounded-xl border border-settings-outline-var shadow-[0_8px_30px_rgba(85,107,47,0.04)] overflow-hidden">
                <div className="px-lg py-md border-b border-settings-outline-var bg-settings-surface-dim/30">
                  <h2 className="font-headline-sm text-headline-sm text-settings-primary text-lg font-bold">Emergency Dispatch Rules</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Set parameters for AI-assisted ambulance routing and response.</p>
                </div>
                <div className="p-lg flex flex-col gap-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                    <div className="flex flex-col gap-2">
                      <label className="font-body-sm text-body-sm font-medium text-settings-primary">Auto-Escalation Threshold (Minutes)</label>
                      <input 
                        type="number"
                        min="1"
                        max="60"
                        value={settings.autoEscalationTime}
                        onChange={(e) => updateSetting('autoEscalationTime', Number(e.target.value))}
                        className="custom-input w-full px-md py-sm rounded-lg border border-settings-outline bg-settings-surface text-settings-on-bg font-body-md" 
                      />
                      <span className="text-[11px] text-on-surface-variant font-mono">Unacknowledged emergency cases escalate to supervisors after this period.</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-body-sm text-body-sm font-medium text-settings-primary">Air Ambulance (Helicopter) dispatch</label>
                      <div className="relative">
                        <select 
                          value={settings.airUnitThreshold}
                          onChange={(e) => updateSetting('airUnitThreshold', e.target.value as any)}
                          className="custom-input appearance-none w-full px-md py-sm pr-10 rounded-lg border border-settings-outline bg-settings-surface text-settings-on-bg font-body-md cursor-pointer"
                        >
                          <option value="critical">Critical Vitals Only (Pulse/Pressure unstable)</option>
                          <option value="high_critical">High or Critical Cases (Default emergency triggers)</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* VERIFICATION RULES TAB CONTENT */}
            {activeTab === 'verification' && (
              <section className="bg-settings-surface rounded-xl border border-settings-outline-var shadow-[0_8px_30px_rgba(85,107,47,0.04)] overflow-hidden">
                <div className="px-lg py-md border-b border-settings-outline-var bg-settings-surface-dim/30">
                  <h2 className="font-headline-sm text-headline-sm text-settings-primary text-lg font-bold">Verification Rules</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Configure compliance rules for hospitals and facilities.</p>
                </div>
                <div className="p-lg flex flex-col gap-lg">
                  <div className="flex items-center justify-between p-md rounded-lg border border-settings-outline bg-white">
                    <div>
                      <h4 className="font-body-sm text-body-sm font-bold text-settings-primary">Require Donor ID Verification</h4>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">Donors must submit verified identification credentials before scheduling organ deposits.</p>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox"
                        checked={settings.requireDonorVerification}
                        onChange={(e) => updateSetting('requireDonorVerification', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-body-sm text-body-sm font-medium text-settings-primary">Hospital Inventory Sync Period (Minutes)</label>
                    <input 
                      type="number"
                      min="5"
                      max="1440"
                      value={settings.hospitalSyncInterval}
                      onChange={(e) => updateSetting('hospitalSyncInterval', Number(e.target.value))}
                      className="custom-input w-2/3 px-md py-sm rounded-lg border border-settings-outline bg-settings-surface text-settings-on-bg font-body-md" 
                    />
                  </div>
                </div>
              </section>
            )}

            {/* BLOOD & ORGAN RULES TAB CONTENT */}
            {activeTab === 'blood' && (
              <section className="bg-settings-surface rounded-xl border border-settings-outline-var shadow-[0_8px_30px_rgba(85,107,47,0.04)] overflow-hidden">
                <div className="px-lg py-md border-b border-settings-outline-var bg-settings-surface-dim/30">
                  <h2 className="font-headline-sm text-headline-sm text-settings-primary text-lg font-bold">Blood &amp; Organ Storage parameters</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Adjust warning levels for cold chain logistics and storage alerts.</p>
                </div>
                <div className="p-lg flex flex-col gap-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                    <div className="flex flex-col gap-2">
                      <label className="font-body-sm text-body-sm font-medium text-settings-primary">Organ Temp Deviation Alert Limit (°C)</label>
                      <input 
                        type="number"
                        step="0.5"
                        min="0"
                        max="10"
                        value={settings.tempWarningThreshold}
                        onChange={(e) => updateSetting('tempWarningThreshold', Number(e.target.value))}
                        className="custom-input w-full px-md py-sm rounded-lg border border-settings-outline bg-settings-surface text-settings-on-bg font-body-md" 
                      />
                      <span className="text-[11px] text-on-surface-variant font-mono">Warn dispatcher if telemetry reports deviation from set temperature range.</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-body-sm text-body-sm font-medium text-settings-primary">Blood Expiry Notification Window (Days)</label>
                      <input 
                        type="number"
                        min="1"
                        max="30"
                        value={settings.bloodExpiryAlertDays}
                        onChange={(e) => updateSetting('bloodExpiryAlertDays', Number(e.target.value))}
                        className="custom-input w-full px-md py-sm rounded-lg border border-settings-outline bg-settings-surface text-settings-on-bg font-body-md" 
                      />
                      <span className="text-[11px] text-on-surface-variant font-mono">Start highlighting units in blood bank view as " expiring-soon".</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* COMMUNICATIONS TAB CONTENT */}
            {activeTab === 'communications' && (
              <section className="bg-settings-surface rounded-xl border border-settings-outline-var shadow-[0_8px_30px_rgba(85,107,47,0.04)] overflow-hidden">
                <div className="px-lg py-md border-b border-settings-outline-var bg-settings-surface-dim/30">
                  <h2 className="font-headline-sm text-headline-sm text-settings-primary text-lg font-bold">Communications Gateway</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Configure emergency SMS alerts and outgoing mail services.</p>
                </div>
                <div className="p-lg flex flex-col gap-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                    <div className="flex flex-col gap-2">
                      <label className="font-body-sm text-body-sm font-medium text-settings-primary">Core SMS Telephony Gateway</label>
                      <div className="relative">
                        <select 
                          value={settings.smsGateway}
                          onChange={(e) => updateSetting('smsGateway', e.target.value as any)}
                          className="custom-input appearance-none w-full px-md py-sm pr-10 rounded-lg border border-settings-outline bg-settings-surface text-settings-on-bg font-body-md cursor-pointer"
                        >
                          <option value="twilio">Twilio (Primary)</option>
                          <option value="vonage">Vonage API (Secondary)</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="font-body-sm text-body-sm font-medium text-settings-primary">System Outbound Email Sender</label>
                      <input 
                        type="email"
                        value={settings.emailSender}
                        onChange={(e) => updateSetting('emailSender', e.target.value)}
                        className="custom-input w-full px-md py-sm rounded-lg border border-settings-outline bg-settings-surface text-settings-on-bg font-body-md" 
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* TEAM & ACCESS TAB CONTENT */}
            {activeTab === 'team' && (
              <section className="bg-settings-surface rounded-xl border border-settings-outline-var shadow-[0_8px_30px_rgba(85,107,47,0.04)] overflow-hidden">
                <div className="px-lg py-md border-b border-settings-outline-var bg-settings-surface-dim/30 flex justify-between items-center">
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-settings-primary text-lg font-bold">Team &amp; Access Control</h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Manage team member invites and portal security authorization.</p>
                  </div>
                  <button 
                    onClick={() => setInviteModalOpen(true)}
                    className="px-md py-2 rounded-lg bg-settings-primary text-white text-xs font-bold font-label-caps flex items-center gap-1 shadow-sm hover:opacity-90 transition"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                    Invite Member
                  </button>
                </div>
                
                <div className="p-lg">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left font-body-sm border-collapse">
                      <thead>
                        <tr className="border-b border-settings-outline-var text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">
                          <th className="pb-3 pr-4">Name</th>
                          <th className="pb-3 pr-4">Email Address</th>
                          <th className="pb-3 pr-4">Role / Scope</th>
                          <th className="pb-3 pr-4">Status</th>
                          <th className="pb-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamMembers.map((member) => (
                          <tr key={member.id} className="border-b border-settings-outline-var/40 hover:bg-settings-surface-dim/10">
                            <td className="py-3 pr-4 font-semibold text-settings-primary">{member.name}</td>
                            <td className="py-3 pr-4 font-mono text-xs">{member.email}</td>
                            <td className="py-3 pr-4 text-xs font-semibold">
                              <span className="bg-settings-surface-dim/50 text-settings-primary px-2.5 py-0.5 rounded-full border border-settings-outline-var/30">{member.role}</span>
                            </td>
                            <td className="py-3 pr-4 text-xs font-bold">
                              <span className={member.status === 'Active' ? 'text-[#3A5544]' : 'text-on-surface-variant opacity-70'}>{member.status}</span>
                            </td>
                            <td className="py-3 text-right">
                              {member.role !== 'Super Admin' ? (
                                <button 
                                  onClick={() => handleDeleteMember(member.id)}
                                  className="text-settings-error hover:underline text-xs font-bold"
                                >
                                  Revoke
                                </button>
                              ) : (
                                <span className="text-[11px] text-on-surface-variant/40 italic">System Owner</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {/* SECURITY TAB CONTENT */}
            {activeTab === 'security' && (
              <section className="bg-settings-surface rounded-xl border border-settings-outline-var shadow-[0_8px_30px_rgba(85,107,47,0.04)] overflow-hidden">
                <div className="px-lg py-md border-b border-settings-outline-var bg-settings-surface-dim/30">
                  <h2 className="font-headline-sm text-headline-sm text-settings-primary text-lg font-bold">Security Settings</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Secure portal logins and session authorization parameters.</p>
                </div>
                <div className="p-lg flex flex-col gap-lg">
                  <div className="flex items-center justify-between p-md rounded-lg border border-settings-outline bg-white">
                    <div>
                      <h4 className="font-body-sm text-body-sm font-bold text-settings-primary">Require Multi-Factor Authentication (MFA)</h4>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">All administration and hospital verifier terminals must configure 2FA authentication.</p>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox"
                        checked={settings.mfaEnabled}
                        onChange={(e) => updateSetting('mfaEnabled', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-body-sm text-body-sm font-medium text-settings-primary">Idle Session Timeout Limit (Minutes)</label>
                    <input 
                      type="number"
                      min="10"
                      max="1440"
                      value={settings.sessionTimeout}
                      onChange={(e) => updateSetting('sessionTimeout', Number(e.target.value))}
                      className="custom-input w-2/3 px-md py-sm rounded-lg border border-settings-outline bg-settings-surface text-settings-on-bg font-body-md" 
                    />
                  </div>
                </div>
              </section>
            )}

            {/* DANGER ZONE TAB CONTENT */}
            {activeTab === 'danger' && (
              <section className="bg-settings-surface rounded-xl border border-[#ffdad6] shadow-[0_8px_30px_rgba(85,107,47,0.04)] overflow-hidden">
                <div className="px-lg py-md border-b border-[#ffdad6] bg-[#ffdad6]/20">
                  <h2 className="font-headline-sm text-headline-sm text-[#ba1a1a] text-lg font-bold">Danger Zone</h2>
                  <p className="font-body-sm text-body-sm text-[#ba1a1a]/80 mt-1">Irreversible administrative actions.</p>
                </div>
                <div className="p-lg flex flex-col gap-lg">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-md p-md border border-[#ffdad6] rounded-xl bg-[#ffdad6]/10">
                    <div>
                      <h4 className="font-body-sm text-body-sm font-bold text-[#ba1a1a]">Wipe Logs History</h4>
                      <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">Permanently clear old routing log records, communications records, and tracking history.</p>
                    </div>
                    <button 
                      onClick={() => setDangerConfirmOpen(true)}
                      className="px-md py-2 rounded-lg bg-[#ba1a1a] text-white font-bold text-xs shadow hover:opacity-90 transition font-label-caps"
                    >
                      Clear Log Data
                    </button>
                  </div>
                </div>
              </section>
            )}

          </div>
        </div>

        {/* PERSISTENT SAVE BAR */}
        {isDirty && (
          <div className="fixed bottom-lg left-1/2 -translate-x-1/2 w-[90%] max-w-4xl glass-panel rounded-xl shadow-lg flex items-center justify-between p-md z-50 animate-[slideUp_0.3s_ease-out_forwards]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-settings-secondary animate-pulse"></div>
              <span className="font-body-sm text-body-sm font-medium text-settings-primary text-sm">You have unsaved changes</span>
            </div>
            <div className="flex items-center gap-sm">
              <button 
                onClick={handleDiscard}
                className="px-md py-sm rounded-lg border border-settings-outline text-settings-on-bg bg-white font-body-sm hover:bg-settings-surface-dim transition-colors"
              >
                Discard
              </button>
              <button 
                onClick={handleSave}
                className="px-md py-sm rounded-lg bg-settings-primary text-white font-body-sm font-medium hover:bg-settings-secondary transition-colors shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* TEAM MEMBER INVITE MODAL */}
        {inviteModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#121c2a]/40 backdrop-blur-sm" onClick={() => setInviteModalOpen(false)}></div>
            <form onSubmit={handleInviteSubmit} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-fade-in-up">
              <div className="px-lg py-md border-b border-settings-outline-var flex justify-between items-center bg-settings-surface-dim/50">
                <h3 className="font-headline-sm text-headline-sm text-settings-primary font-bold text-base flex items-center gap-2">
                  <span className="material-symbols-outlined text-settings-primary">person_add</span>
                  <span>Invite Team Member</span>
                </h3>
                <button type="button" className="text-on-surface-variant hover:text-settings-primary" onClick={() => setInviteModalOpen(false)}>
                  <span className="material-symbols-outlined block text-[22px]">close</span>
                </button>
              </div>

              <div className="p-lg flex flex-col gap-md">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text"
                    required
                    value={newMember.name}
                    onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Dr. Jane Foster"
                    className="custom-input w-full px-md py-sm rounded-lg border border-settings-outline bg-white text-on-surface shadow-sm font-body-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email"
                    required
                    value={newMember.email}
                    onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="foster.jane@lifelink.org"
                    className="custom-input w-full px-md py-sm rounded-lg border border-settings-outline bg-white text-on-surface shadow-sm font-body-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">System Access Role</label>
                  <div className="relative">
                    <select 
                      value={newMember.role}
                      onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                      className="custom-input w-full px-md py-sm pr-10 rounded-lg border border-settings-outline bg-white text-on-surface shadow-sm font-body-sm appearance-none cursor-pointer"
                    >
                      <option>Coordinator</option>
                      <option>Dispatcher</option>
                      <option>Medical Verifier</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                  </div>
                </div>
              </div>

              <div className="px-lg py-md border-t border-settings-outline-var/60 flex justify-end gap-3 bg-settings-surface-dim/30">
                <button type="button" className="px-md py-2 rounded-lg text-xs font-bold text-on-surface-variant hover:bg-settings-surface-dim transition-colors" onClick={() => setInviteModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="px-md py-2 rounded-lg bg-settings-primary text-white text-xs font-bold transition-all shadow-md">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        )}

        {/* WIPE LOGS CONFIRMATION MODAL */}
        {dangerConfirmOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#121c2a]/40 backdrop-blur-sm" onClick={() => setDangerConfirmOpen(false)}></div>
            <form onSubmit={handleWipeDatabase} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-fade-in-up">
              <div className="px-lg py-md border-b border-[#ffdad6] flex justify-between items-center bg-[#ffdad6]/20">
                <h3 className="font-headline-sm text-headline-sm text-[#ba1a1a] font-bold text-base flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ba1a1a]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                  <span>Confirm Wipe Request</span>
                </h3>
                <button type="button" className="text-on-surface-variant hover:text-[#ba1a1a]" onClick={() => setDangerConfirmOpen(false)}>
                  <span className="material-symbols-outlined block text-[22px]">close</span>
                </button>
              </div>

              <div className="p-lg flex flex-col gap-md">
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  This action is irreversible. All telemetry charts, coordinator logs, and previous communications transcripts will be destroyed.
                </p>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#ba1a1a] uppercase tracking-wider">Type <span className="font-mono bg-[#ffdad6]/40 px-1 rounded">DELETE LOGS</span> to confirm</label>
                  <input 
                    type="text"
                    required
                    value={dangerConfirmText}
                    onChange={(e) => setDangerConfirmText(e.target.value)}
                    placeholder="Type confirmation here"
                    className="custom-input w-full px-md py-sm rounded-lg border border-[#ffdad6] bg-white text-on-surface shadow-sm font-body-sm focus:border-[#ba1a1a] focus:ring-1 focus:ring-[#ba1a1a]"
                  />
                </div>
              </div>

              <div className="px-lg py-md border-t border-settings-outline-var/60 flex justify-end gap-3 bg-settings-surface-dim/30">
                <button type="button" className="px-md py-2 rounded-lg text-xs font-bold text-on-surface-variant hover:bg-settings-surface-dim transition-colors" onClick={() => setDangerConfirmOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="px-md py-2 rounded-lg bg-[#ba1a1a] text-white text-xs font-bold transition-all shadow-md">
                  Destroy Database Logs
                </button>
              </div>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}
