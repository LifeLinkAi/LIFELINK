'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Map, 
  HeartPulse, 
  Bed, 
  Bot, 
  LineChart,
  User,
  Flag,
  FlaskConical
} from 'lucide-react';
import Navbar from '@/components/navigation/Navbar';
import Footer from '@/components/navigation/Footer';

export default function FeaturesPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: custom * 0.1 }
    })
  };

  const featuresList = [
    {
      title: "Smart Donor Matching (Blood & Organ)",
      description: "Advanced algorithms analyze HLA typing, blood markers, and geographical proximity to match donors with recipients at unprecedented speeds.",
      tags: ["HLA Analysis", "Bio-Routing"],
      icon: <Users className="w-6 h-6" />,
      visual: (
        <div className="w-full xl:w-[200px] h-[160px] rounded-xl bg-surface-container-lowest border border-outline-variant/30 p-3 shadow-inner relative overflow-hidden flex flex-col justify-center items-center gap-3 shrink-0">
          <div className="flex items-center gap-4 relative w-full justify-center">
            <div className="w-10 h-10 rounded-full bg-primary-fixed border-2 border-surface flex items-center justify-center z-10">
              <User className="text-on-primary-fixed w-4 h-4" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-[2px] bg-gradient-to-r from-primary-fixed to-secondary-fixed"></div>
            <div className="w-10 h-10 rounded-full bg-[#c8f17a] border-2 border-surface flex items-center justify-center z-10">
              <User className="text-[#131f00] w-4 h-4" />
            </div>
          </div>
          <div className="bg-[#496800] text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-20 shadow-sm shadow-[#496800]/20">
            99.8% Match
          </div>
        </div>
      )
    },
    {
      title: "Real-Time Campus Navigation & Indoor Mapping",
      description: "Seamless indoor mapping utilizing BLE beacons and Wi-Fi triangulation to guide patients and optimize routing through complex hospital ecosystems effortlessly.",
      tags: ["BLE Beacons", "Indoor GPS"],
      icon: <Map className="w-6 h-6" />,
      visual: (
        <div className="w-full xl:w-[200px] h-[160px] rounded-xl bg-[#d9e3f6]/40 border border-outline-variant/30 p-2 shadow-inner relative overflow-hidden shrink-0">
          <div className="w-full h-full border border-dashed border-outline-variant/50 rounded-lg relative bg-pattern">
            <div className="absolute top-4 left-4 w-3 h-3 bg-primary rounded-full shadow-[0_0_12px_rgba(62,82,25,0.5)]"></div>
            <svg className="absolute top-5 left-5 w-32 h-24 text-primary" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0 C 40 10, 60 50, 90 80" stroke="currentColor" strokeDasharray="4 4" strokeLinecap="round" strokeWidth="3"></path>
            </svg>
            <div className="absolute bottom-4 right-4 w-4 h-4 bg-[#496800] flex items-center justify-center rounded-sm">
              <Flag className="text-white w-2.5 h-2.5" />
            </div>
          </div>
        </div>
      )
    },
    {
      title: "AI Sepsis Prediction & Medical Intelligence",
      description: "Deep learning models monitor continuous vitals, predicting sepsis onset up to 12 hours before clinical symptoms manifest, allowing early intervention.",
      tags: ["Neural Nets", "Time-Series Data"],
      icon: <HeartPulse className="w-6 h-6" />,
      visual: (
        <div className="w-full xl:w-[200px] h-[160px] rounded-xl bg-surface-container-lowest border border-outline-variant/30 p-3 shadow-inner relative flex flex-col gap-2 shrink-0">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold text-outline uppercase tracking-wider">Vitals Trend</span>
            <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
          </div>
          <div className="flex-1 w-full border-b border-l border-outline-variant/30 relative flex items-end justify-between px-1 pb-1">
            <div className="w-[15%] bg-[#d2eca2] h-[20%] rounded-t-sm"></div>
            <div className="w-[15%] bg-[#d2eca2] h-[35%] rounded-t-sm"></div>
            <div className="w-[15%] bg-[#d2eca2] h-[40%] rounded-t-sm"></div>
            <div className="w-[15%] bg-[#d6eab2] h-[60%] rounded-t-sm"></div>
            <div className="w-[15%] bg-[#ba1a1a]/80 h-[85%] rounded-t-sm relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] font-bold text-[#ba1a1a]">92%</div>
            </div>
            {/* Threshold line */}
            <div className="absolute top-[30%] left-0 w-full h-[1px] border-t border-dashed border-[#ba1a1a]/50"></div>
          </div>
        </div>
      )
    },
    {
      title: "Hospital Unified Network (ICU Bed Management)",
      description: "A centralized dashboard providing real-time visibility into ICU bed availability across the healthcare network, optimizing patient transfers and admissions.",
      tags: ["Unified Comms", "Live Sync"],
      icon: <Bed className="w-6 h-6" />,
      visual: (
        <div className="w-full xl:w-[200px] h-[160px] rounded-xl bg-surface-container-lowest border border-outline-variant/30 p-3 shadow-inner flex flex-col gap-2 justify-center shrink-0">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-1">
            <span className="text-[10px] font-bold text-on-surface">ICU Ward A</span>
            <span className="text-[10px] text-primary font-bold">3 Beds</span>
          </div>
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-1">
            <span className="text-[10px] font-bold text-on-surface">ICU Ward B</span>
            <span className="text-[10px] text-[#ba1a1a] font-bold">0 Beds</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-on-surface">NICU</span>
            <span className="text-[10px] text-[#496800] font-bold">1 Bed</span>
          </div>
        </div>
      )
    },
    {
      title: "AI Virtual Assistant (Identity & Triage)",
      description: "Natural language processing interfaces securely verify identity and process patient symptoms to prioritize care queues dynamically and answer inquiries 24/7.",
      tags: ["NLP Engine", "Biometrics"],
      icon: <Bot className="w-6 h-6" />,
      visual: (
        <div className="w-full xl:w-[200px] h-[160px] rounded-xl bg-surface-container-lowest border border-outline-variant/30 p-3 shadow-inner flex flex-col gap-2 justify-between shrink-0">
          <div className="self-start max-w-[80%] bg-[#d9e3f6]/50 p-2 rounded-t-lg rounded-br-lg text-[8px] text-on-surface-variant font-medium">
            I have chest pain and shortness of breath.
          </div>
          <div className="self-end max-w-[80%] bg-[#d2eca2]/70 p-2 rounded-t-lg rounded-bl-lg text-[8px] text-[#131f00] font-semibold">
            This is a medical emergency. Escalating triage priority to HIGH and alerting staff.
          </div>
        </div>
      )
    },
    {
      title: "Predictive Supply Analytics (Blood Stock)",
      description: "Aggregating demographic, environmental, and clinical data to forecast blood supply needs, ensuring critical reserves are maintained ahead of demand.",
      tags: ["Big Data", "Inventory"],
      icon: <LineChart className="w-6 h-6" />,
      visual: (
        <div className="w-full xl:w-[200px] h-[160px] rounded-xl bg-surface-container-lowest border border-outline-variant/30 p-3 shadow-inner relative flex justify-center items-center shrink-0">
          <div className="relative w-20 h-20 rounded-full border-4 border-[#d9e3f6] flex items-center justify-center overflow-hidden">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle 
                className="text-primary" 
                cx="36" 
                cy="36" 
                fill="none" 
                r="32" 
                stroke="currentColor" 
                strokeDasharray="200" 
                strokeDashoffset="44" 
                strokeLinecap="round" 
                strokeWidth="6"
              />
            </svg>
            <div className="text-center">
              <div className="text-sm font-bold text-on-surface">78%</div>
              <div className="text-[8px] font-bold text-outline uppercase tracking-wider">O- Stock</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#f8f9ff] flex flex-col font-dmsans selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Ambient background glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary-fixed-dim/20 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-secondary-fixed/10 blur-[150px] pointer-events-none -z-10" />

      {/* Navigation Header */}
      <Navbar />

      {/* Main Content */}
      <main className="w-full max-w-[1280px] mx-auto px-6 lg:px-12 pt-[76px] pb-16 flex flex-col gap-16 relative z-10">
        
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto pt-12 pb-6">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            custom={0}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-fixed bg-primary-fixed/20 text-on-primary-fixed-variant font-label-caps backdrop-blur-sm"
          >
            <FlaskConical className="w-4 h-4 text-primary animate-spin-slow" />
            <span className="text-xs font-bold font-dmsans tracking-widest text-on-primary-fixed-variant uppercase">Platform Features</span>
          </motion.div>
          
          <motion.h1 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            custom={1}
            className="font-syne font-bold text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-[-2px] text-on-surface"
          >
            The Biological Blueprint of Modern Healthcare
          </motion.h1>
          
          <motion.p 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            custom={2}
            className="font-dmsans text-lg md:text-xl leading-[1.6] text-on-surface-variant max-w-2xl"
          >
            Explore the 6 proprietary technologies driving LifeLink AI. Designed with high-tech precision and natural bio-minimalism, these systems work in harmony to elevate patient care.
          </motion.p>
        </section>

        {/* Staggered Features Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-12 items-start pb-16 w-full">
          {featuresList.map((feat, index) => (
            <motion.div 
              key={feat.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeInUp}
              custom={index % 2 === 0 ? 1 : 2}
              whileHover={{ scale: 1.01, borderColor: 'rgba(85, 107, 47, 0.3)' }}
              className={`bg-[#d9e3f6]/40 backdrop-blur-md rounded-3xl p-8 border border-[#c5c8b8]/40 shadow-[0_8px_32px_rgba(85,107,47,0.03)] flex flex-col xl:flex-row gap-6 hover:border-primary/30 transition-all duration-300 ${
                index % 2 !== 0 ? 'lg:mt-16' : ''
              }`}
            >
              <div className="flex-1 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="font-syne font-bold text-2xl text-on-surface">
                  {feat.title}
                </h3>
                <p className="font-dmsans text-sm text-on-surface-variant leading-relaxed">
                  {feat.description}
                </p>
                
                {/* Tag List */}
                {feat.tags && (
                  <div className="mt-auto pt-4 flex gap-2">
                    {feat.tags.map((t) => (
                      <span key={t} className="text-[10px] font-bold font-dmsans text-outline px-2.5 py-1 rounded-lg border border-outline-variant/50 uppercase tracking-wider bg-white/40">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {feat.visual}
            </motion.div>
          ))}
        </section>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
