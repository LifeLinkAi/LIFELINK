'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldAlert, Activity, HeartHandshake, Building2, Timer } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import Footer from '@/components/navigation/Footer';

export default function LandingPage() {

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: custom * 0.15 }
    })
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1.2, ease: 'easeOut' } }
  };

  return (
    <div className="relative min-h-screen w-full bg-brand-bgLight flex flex-col font-dmsans">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow w-full flex flex-col items-center">
        
        {/* Hero Section */}
        <section className="relative w-full min-h-[720px] flex items-start justify-center bg-gradient-to-br from-[#F4F7F0] to-[#DDE5D3] px-6 lg:px-12 pt-28 pb-20 md:pt-[180px] md:pb-24 overflow-hidden">
          
          {/* Hero Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-85"
            poster="/images/hero_bg.png"
          >
            <source src="/video/hero_bg_video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#F4F7F0]/20 to-[#DDE5D3]/50 pointer-events-none" />

          {/* Container */}
          <div className="w-full max-w-[1280px] grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            
            {/* Left side info */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              <motion.h1 
                custom={1}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="font-syne font-bold text-5xl md:text-6xl lg:text-[64px] leading-[1.05] tracking-[-2.4px] text-brand-green mb-6 max-w-[620px]"
              >
                The Future of <br className="hidden sm:inline"/>Emergency Care <br className="hidden sm:inline"/>is Here.
              </motion.h1>

              <motion.p 
                custom={2}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="font-dmsans text-lg md:text-xl leading-[1.6] text-brand-textDark max-w-[550px] mb-10"
              >
                Connecting donors, hospitals, and healthcare networks through real-time AI coordination.
              </motion.p>

              {/* Action Buttons */}
              <motion.div 
                custom={3}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap items-center gap-4 sm:gap-6"
              >
                {/* Primary Button */}
                <Link 
                  href="/get-started" 
                  className="flex items-center justify-center gap-2 px-6 py-4 min-w-[213px] h-[65px] font-syne font-semibold text-lg text-white bg-gradient-to-r from-[#3E5219] to-[#556B2F] rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_25px_-5px_rgba(62,82,25,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                {/* Secondary Button */}
                <Link 
                  href="#how-it-works" 
                  className="flex items-center justify-center px-6 py-4 min-w-[212px] h-[65px] font-syne font-semibold text-lg text-brand-green bg-brand-glassBg border border-brand-glassBorder backdrop-blur-md hover:bg-[#DDE5D3]/60 transition-all duration-300 rounded-xl transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  How it Works
                </Link>
              </motion.div>
            </div>

            {/* Right side - optional interactive illustration representing the system */}
            <div className="lg:col-span-5 hidden lg:flex items-center justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                className="relative w-full max-w-[400px] h-[400px]"
              >
                {/* Decorative pulse circles */}
                <div className="absolute inset-0 rounded-full border-2 border-brand-green/10 animate-ping" style={{ animationDuration: '4s' }} />
                <div className="absolute inset-4 rounded-full border-2 border-brand-green/20 animate-ping" style={{ animationDuration: '3s' }} />
                
                {/* Central AI/Globe mesh representation */}
                <div className="absolute inset-10 rounded-full bg-brand-green/5 border border-brand-green/30 flex items-center justify-center backdrop-blur-sm">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-brand-green/20 to-brand-olive/20 flex flex-col items-center justify-center p-6 border border-brand-green/40 shadow-inner">
                    <Activity className="w-16 h-16 text-brand-green animate-pulse mb-2" />
                    <span className="font-syne font-bold text-sm tracking-widest text-brand-green uppercase">LifeLink Hub</span>
                  </div>
                </div>

                {/* Satellite floaters */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/80 border border-brand-green/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm text-xs font-semibold text-brand-green">
                  <ShieldAlert className="w-3.5 h-3.5" /> Identity Verified
                </div>

                <div className="absolute bottom-12 left-2 bg-white/80 border border-brand-green/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm text-xs font-semibold text-brand-green">
                  <Building2 className="w-3.5 h-3.5" /> 850+ Hospitals
                </div>

                <div className="absolute bottom-12 right-2 bg-white/80 border border-brand-green/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm text-xs font-semibold text-brand-green">
                  <HeartHandshake className="w-3.5 h-3.5" /> Active Donors
                </div>
              </motion.div>
            </div>
            
          </div>
        </section>


        {/* Section - Impact Stats */}
        <section id="impact" className="w-full bg-brand-statsBg px-6 lg:px-12 py-16 flex items-center justify-center">
          <div className="w-full max-w-[1280px]">
            {/* Overlay Glass Container */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeIn}
              className="w-full bg-brand-glassBg border border-brand-glassBorder backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-[0_8px_32px_rgba(62,82,25,0.05)]"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 items-center justify-center">
                
                {/* Stat 1 */}
                <div className="flex flex-col items-center justify-center text-center px-4">
                  <div className="flex items-center gap-2 mb-2">
                    <HeartHandshake className="w-6 h-6 text-brand-green opacity-80" />
                    <span className="font-syne font-bold text-4xl lg:text-[48px] leading-[1.1] tracking-[-0.96px] text-brand-green">
                      14.2k
                    </span>
                  </div>
                  <span className="font-syne font-medium text-lg lg:text-[20px] leading-[1.4] text-brand-textDark">
                    Lives Saved
                  </span>
                </div>

                {/* Stat 2 */}
                <div className="flex flex-col items-center justify-center text-center px-4 md:border-l border-brand-borderLight">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-6 h-6 text-brand-green opacity-80" />
                    <span className="font-syne font-bold text-4xl lg:text-[48px] leading-[1.1] tracking-[-0.96px] text-brand-green">
                      850+
                    </span>
                  </div>
                  <span className="font-syne font-medium text-lg lg:text-[20px] leading-[1.4] text-brand-textDark">
                    Partner Hospitals
                  </span>
                </div>

                {/* Stat 3 */}
                <div className="flex flex-col items-center justify-center text-center px-4 md:border-l border-brand-borderLight">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="w-6 h-6 text-brand-green opacity-80" />
                    <span className="font-syne font-bold text-4xl lg:text-[48px] leading-[1.1] tracking-[-0.96px] text-brand-green">
                      4.2m
                    </span>
                  </div>
                  <span className="font-syne font-medium text-lg lg:text-[20px] leading-[1.4] text-brand-textDark">
                    Response Time Reduction
                  </span>
                </div>

              </div>
            </motion.div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
