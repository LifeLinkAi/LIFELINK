'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Cookies from 'js-cookie';

export default function RegisterPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  React.useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (user.role === 'Admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'Hospital') {
        router.push('/hospital/dashboard');
      } else if (user.role === 'Donor') {
        router.push('/donor/dashboard');
      } else if (user.role === 'Patient') {
        router.push('/patient/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [authLoading, isAuthenticated, user, router]);
  const [role, setRole] = useState<'Patient' | 'Donor' | 'Hospital'>('Patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    
    try {
      setError(null);
      setLoading(true);
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      if (!apiUrl.endsWith('/api')) {
        apiUrl = `${apiUrl}/api`;
      }
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.message || 'Registration failed.');
        return;
      }

      // Store credentials in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      Cookies.set('ll_access_token', data.token, { expires: 7 });

      // Redirect based on database user role
      const userRole = data.user.role;
      if (userRole === 'Admin') {
        router.push('/admin/dashboard');
      } else if (userRole === 'Hospital') {
        router.push('/hospital/dashboard');
      } else if (userRole === 'Donor') {
        router.push('/donor/dashboard');
      } else if (userRole === 'Patient') {
        router.push('/patient/dashboard');
      } else {
        router.push('/');
      }
    } catch (err) {
      setLoading(false);
      setError('Network error. Please check if the backend server is running.');
    }
  };

  if (authLoading || isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#fcfdfa]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
          <p className="font-syne font-semibold text-emerald-800 text-sm tracking-wide">Redirecting to portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface h-screen overflow-hidden flex flex-col md:flex-row font-dmsans">
      
      {/* Left side: Futuristic Healthcare Visual (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-surface-container relative items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0" 
          style={{ 
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCJTUZaZTWBAVB2rnmzIR_ihXWHtbxIKsejOraOa3BGtvC3w6MRH2_h-1MRXBUpb-NrWwhwg6UXkGOEZs4wTCFHeTYjxbHhycvKRSgi09omZiyT4ykbOdnC-hCoAlzaiG9iAytIKizbEA-G13yT_hHjVdcbm5F3Ilg2j9FNzpMklACmUhfyk9QNRy_68E1yQG5QVMLZgsY3SdNr7_nj2kmNUkIoN5A2Kx9hCEqyx9ryGhFpqJI14COTIBuHUqOu4V0R2Od6UPbrOWLf')" 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/60 to-surface-container/20 z-10 backdrop-blur-[2px]"></div>
        
        <div className="z-20 p-12 text-on-primary max-w-2xl relative">
          <div className="mb-6 flex items-center gap-2">
            <svg className="w-8 h-8 text-secondary-fixed" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
            <span className="font-syne font-bold text-2xl tracking-tight text-white drop-shadow-md">LifeLink</span>
          </div>
          <h1 className="font-syne font-bold text-5xl text-white mb-4 drop-shadow-md leading-[1.1]">Connecting Care, Seamlessly.</h1>
          <p className="font-dmsans text-lg text-surface-container-low max-w-lg mb-10 drop-shadow-sm">Join a revolutionary healthcare network designed for precision, speed, and deep organic integration.</p>
          
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 inline-flex shadow-[0_8px_30px_rgba(85,107,47,0.08)]">
            <ShieldCheck className="w-8 h-8 text-secondary-fixed shrink-0" />
            <div>
              <p className="font-syne text-sm text-white font-semibold">Secure &amp; Encrypted</p>
              <p className="font-dmsans text-xs text-surface-container-low">Your health data is protected.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Form Container */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col h-full overflow-y-auto bg-surface relative">
        
        {/* Minimal Back Button */}
        <div className="p-6 md:p-12 pb-0 absolute top-0 left-0 z-10 w-full">
          <Link 
            href="/" 
            aria-label="Go back" 
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-variant transition-colors text-on-surface-variant"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 md:px-12 py-10 mt-12 md:mt-0 max-w-md mx-auto w-full">
          
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-6">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
            <span className="font-syne font-bold text-2xl tracking-tight text-on-surface">LifeLink</span>
          </div>

          <div className="mb-6 text-center md:text-left">
            <h2 className="font-syne font-semibold text-3xl text-on-surface mb-1">Create Account</h2>
            <p className="font-dmsans text-sm text-on-surface-variant">Register on the network to access portal tools and diagnostics.</p>
          </div>

          {/* Role Selection */}
          <div className="bg-surface-variant rounded-xl p-1 mb-6 flex shadow-[0_4px_15px_rgba(85,107,47,0.05)]">
            {(['Patient', 'Donor', 'Hospital'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 px-1 text-center rounded-lg font-syne font-semibold text-[13px] transition-all ${
                  role === r
                    ? 'bg-surface shadow-sm text-primary'
                    : 'text-outline hover:text-on-surface-variant'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Form */}
          {error && (
            <div className="bg-[#ffdad6] text-[#ba1a1a] p-3 rounded-lg text-xs font-semibold border border-[#ffdad6] mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Input */}
            <div className="space-y-1">
              <label className="font-dmsans text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline pointer-events-none">
                  <User className="w-5 h-5" />
                </span>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg h-[48px] pl-10 pr-4 focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-dmsans text-base placeholder:text-outline focus:outline-none" 
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label className="font-dmsans text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline pointer-events-none">
                  <Mail className="w-5 h-5" />
                </span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg h-[48px] pl-10 pr-4 focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-dmsans text-base placeholder:text-outline focus:outline-none" 
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="font-dmsans text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline pointer-events-none">
                  <Lock className="w-5 h-5" />
                </span>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg h-[48px] pl-10 pr-10 focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-dmsans text-base placeholder:text-outline focus:outline-none" 
                  placeholder="Create password"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility" 
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-outline hover:text-on-surface-variant transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <label className="font-dmsans text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline pointer-events-none">
                  <Lock className="w-5 h-5" />
                </span>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg h-[48px] pl-10 pr-10 focus:ring-1 focus:ring-primary focus:border-primary transition-colors font-dmsans text-base placeholder:text-outline focus:outline-none" 
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>

            {/* Primary Action Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full h-[48px] rounded-lg bg-gradient-to-br from-primary to-secondary text-on-primary font-syne font-bold text-base shadow-[0_8px_30px_rgba(85,107,47,0.15)] hover:shadow-[0_8px_30px_rgba(85,107,47,0.25)] hover:brightness-105 transition-all flex items-center justify-center gap-1.5 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Register'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          {/* Login Prompt */}
          <div className="text-center mt-8">
            <p className="font-dmsans text-sm text-on-surface-variant">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-bold hover:underline decoration-2 underline-offset-4">
                Sign In here
              </Link>
            </p>
          </div>

        </div>

        {/* Footer / Legal */}
        <div className="p-6 md:p-12 pt-0 text-center text-outline">
          <p className="font-dmsans text-xs">
            By continuing, you agree to our{' '}
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            {' '}and{' '}
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>.
          </p>
        </div>

      </div>
    </div>
  );
}
