'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  ArrowDown, 
  Activity, 
  Heart, 
  Truck, 
  Network, 
  CheckCircle2, 
  Radio, 
  TrendingUp, 
  ChevronRight, 
  ChevronDown 
} from 'lucide-react';
import Navbar from '@/components/navigation/Navbar';
import Footer from '@/components/navigation/Footer';
import Link from 'next/link';

export default function ServicesPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: custom * 0.15 }
    })
  };

  const services = [
    {
      title: "Blood Donation Ecosystem",
      description: "Our AI-driven matching system identifies regional shortages in real-time, connecting voluntary donors with precise patient needs. Donor stories inspire a community of life-savers.",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCDJ43NP-4cH3_TVIiYJrlAApO7a_8HYIPOWr0DhcVtzObHC8YjR2wJjTe6rG7o5RQvZaRhcip6iM5aD-jHSdXzY7cjBOcTCv-9M_62T6GQaBWU0iIsXXDkaI6aBgE9nGzT58HHio20pDefNJlraVnXa1g1-lDpCvlxYQG0GnKl3aKnmLucEXOwygvSuEri8M6GJZ3vqd8niEj2_IE1fySxgCtvfovnWLAk0ToevZXXGtIhxJ856ImnH3HBqhLBrdYE2eUrw58cVepL",
      badgeText: "Live Matching",
      badgeIcon: <Activity className="w-3.5 h-3.5" />,
      features: [
        "Predictive Demand Forecasting",
        "Donor Health Telemetry",
        "Regional Logistics Coordination"
      ],
      buttonText: "Learn About Blood Matching"
    },
    {
      title: "Organ Matching & Transfer",
      description: "Executing secure transfer protocols and medical compatibility algorithms that ensure every organ finds its perfect match. We handle the complexity so hospitals can focus on surgery.",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDhLRjNxcxAYKxMuJKJv8xInyQNb9BfKQyrUXRJ2twZbOFePS5OoDaxfzScvmSCavIiVmYVNP6ipONJpO820an3kjN_DeCtBuq6yg25G0sWny16DLVjJZ5pKjRGto_iAmAVYtl1U4PlX_PGA232lyKmE3by2YpwxGmkM2sLYE6Q6Mn98zjOan7IyoZuN_yOeXXGln8yAWJ9ikS2z2m5SASuBpvc4msnkTmrI819wXihZ3xgUJcjHqKYZc1ua__7tSxQtVuWG_DnT5wY",
      badgeText: "Secure Protocol",
      badgeIcon: <Heart className="w-3.5 h-3.5 fill-current" />,
      features: [
        "Compatibility AI (Human-DNA matching)",
        "End-to-End Cold-Chain Monitoring",
        "Legal & Ethical Compliance Hub"
      ],
      buttonText: "Gift of Life Registry"
    },
    {
      title: "Ambulance AI Logistics",
      description: "Dynamic fleet telemetry and AI route optimization reduce response times by up to 40%. Our centralized dispatch ensures the closest unit is always deployed with the right equipment.",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLwTkZ9uB7lIufCwbdR3pO8WJGTLbyC7zpvSBpobNWxRr9YtGGxE5bkmSJyZJ5T3Px0ufYA8rzBLKLUvanmr_qVw04nLS8mXKEMup3-8cedVCzAEbkARa4Tk2GX6toV4o950JXZUlI2jUF1yp4FVPYOFX55R1ztgIekA75KkB1HKoVCc3hUO6StmjH4mjP1lqWepRz0jnzmOJMAIj9nKpXMBEoAPQ2TBX0rHWqlYNSJChD-kcXZte1FKUVVKMVxCte2QJwxEKPSqXW",
      badgeText: "Real-Time GPS",
      badgeIcon: <Truck className="w-3.5 h-3.5" />,
      features: [
        "Traffic-Preemption Intelligence",
        "Live Vital Data Uplink to Trauma Center",
        "Smart Dispatch Fleet Telemetry"
      ],
      buttonText: "View Fleet Telemetry"
    },
    {
      title: "Hospital Unified Network",
      description: "Enterprise-grade syncing between medical institutions allows for unified ICU bed management and triage coordination. Data silos are eliminated to create a single source of truth.",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBm-3Dkbu5IHuEYXj78cDniCqZsjoWoSdpDfrdDoz-jX3cS3DJxnTQLxhF0RE4p9FyjGztsOs2wdhNbMgY5fwWGVYdnLSsA9j2CTM7Ur3K-oNVsMouhwd7dmR0b5nmQCVhu6tlfUTtCIAddowhwUO74ZymXlehm4gCnUnvDCIGm_ucXSw3GYRWkzoBBwY5Jf3GIOIlS1z-YYRdG6w33hOZcrOyxj8xtug7amMbvMGltVlLQnZORhltN1w_mzk1X21-smXESJsOxskrB",
      badgeText: "Enterprise Sync",
      badgeIcon: <Network className="w-3.5 h-3.5" />,
      features: [
        "Integrated Bed Management Systems",
        "Cross-Institutional Patient Triage",
        "Secure HIPAA Data Sharing Gateway"
      ],
      buttonText: "Connect Your Facility"
    }
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#EFF2EE] flex flex-col font-dmsans">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow w-full flex flex-col items-center pt-[76px]">
        
        {/* Services Page Hero */}
        <section className="relative w-full py-20 md:py-28 flex items-center justify-center bg-gradient-to-b from-[#1b4d2c] to-[#123e20] px-6 lg:px-12 overflow-hidden border-b border-brand-borderLight/30">
          {/* Decorative blurred orbs */}
          <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="w-full max-w-[1280px] flex flex-col items-center text-center relative z-10">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              custom={0}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary-container/20 rounded-full mb-6 border border-secondary-fixed/30"
            >
              <ShieldCheck className="w-4 h-4 text-secondary-fixed" />
              <span className="text-xs font-bold font-dmsans tracking-widest text-secondary-fixed uppercase">Global Health Infrastructure</span>
            </motion.div>
            
            <motion.h1 
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              custom={1}
              className="font-syne font-bold text-4xl md:text-6xl leading-[1.05] tracking-[-2px] text-[#fafbf9] max-w-[900px] mb-6"
            >
              Our Life-Saving Services
            </motion.h1>
            
            <motion.p 
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              custom={2}
              className="font-dmsans text-lg md:text-xl leading-[1.6] text-[#fafbf9]/80 max-w-[2xl] mb-8"
            >
              LifeLink AI integrates advanced medical logistics with predictive intelligence to close the gap between emergency needs and available resources.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              custom={3}
            >
              <a 
                href="#services" 
                className="inline-flex items-center gap-2 px-8 py-3.5 font-syne font-bold text-white bg-gradient-to-br from-[#123e20] to-[#2d6a4f] hover:brightness-110 shadow-md hover:shadow-[0_4px_15px_rgba(18,62,32,0.25)] transition-all duration-200 rounded-full"
              >
                Explore Pillars
                <ArrowDown className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </section>

        {/* 4 Core Services Grid */}
        <section className="w-full px-6 lg:px-12 py-24 flex items-center justify-center" id="services">
          <div className="w-full max-w-[1280px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 w-full">
              {services.map((svc, i) => (
                <motion.div 
                  key={svc.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-50px' }}
                  variants={fadeInUp}
                  custom={i % 2 === 0 ? 1 : 2}
                  whileHover={{ y: -6, boxShadow: '0 25px 50px rgba(18,62,32,0.06)' }}
                  transition={{ duration: 0.3 }}
                  className={`bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between group ${
                    i % 2 !== 0 ? 'md:mt-10' : ''
                  }`}
                >
                  <div className="flex flex-col gap-6">
                    {/* Card Image */}
                    <div className="w-full h-64 rounded-xl overflow-hidden relative">
                      <img 
                        alt={svc.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        src={svc.imageUrl}
                      />
                      <div className="absolute top-4 right-4 bg-primary text-on-primary px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                        {svc.badgeIcon}
                        {svc.badgeText}
                      </div>
                    </div>

                    {/* Card Titles */}
                    <div>
                      <h3 className="font-syne font-bold text-2xl text-primary mb-3">
                        {svc.title}
                      </h3>
                      <p className="font-dmsans text-base text-on-surface-variant leading-relaxed">
                        {svc.description}
                      </p>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-2">
                      {svc.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-2 text-sm font-medium text-on-surface">
                          <CheckCircle2 className="w-4.5 h-4.5 text-secondary shrink-0" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Learn More Button */}
                  <div className="mt-8">
                    <button className="w-full py-3 border border-primary text-primary font-syne font-bold rounded-lg hover:bg-primary hover:text-on-primary transition-all duration-200">
                      {svc.buttonText}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Integrated Impact Section */}
        <section className="w-full py-24 bg-primary text-on-primary relative overflow-hidden flex items-center justify-center">
          <div className="w-full max-w-[1280px] px-6 lg:px-12 relative z-10 flex flex-col gap-12">
            
            <div className="flex flex-col items-center text-center">
              <h2 className="font-syne font-bold text-3xl md:text-5xl tracking-[-1px] mb-4">
                Integrated Impact
              </h2>
              <p className="font-dmsans text-base md:text-lg text-[#fafbf9]/70 max-w-3xl leading-relaxed">
                From Donor to Hospital in Minutes. We unify disjointed systems into a single, high-performance network that breathes as one.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                <div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center mb-6 border border-secondary-fixed/30 text-secondary-fixed">
                  <Radio className="w-8 h-8" />
                </div>
                <h4 className="font-syne font-bold text-lg mb-2 text-secondary-fixed">Step 01: Identification</h4>
                <p className="font-dmsans text-sm opacity-80 leading-relaxed">
                  AI identifies a critical need—whether blood or an organ—and scans our verified network in milliseconds.
                </p>
              </div>

              {/* Connector */}
              <div className="hidden lg:flex justify-center text-secondary-fixed">
                <ChevronRight className="w-12 h-12 animate-pulse" />
              </div>
              <div className="lg:hidden flex justify-center text-secondary-fixed py-2">
                <ChevronDown className="w-12 h-12 animate-pulse" />
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                <div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center mb-6 border border-secondary-fixed/30 text-secondary-fixed">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h4 className="font-syne font-bold text-lg mb-2 text-secondary-fixed">Step 02: Logistics</h4>
                <p className="font-dmsans text-sm opacity-80 leading-relaxed">
                  Autonomous and tracked ambulance dispatch finds the optimal route, clearing traffic for rapid transfer.
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-secondary/40 to-primary/40 backdrop-blur-xl border border-white/20">
                <h3 className="font-syne font-bold text-2xl md:text-3xl mb-3 text-[#fafbf9]">
                  Global Average Response: 4.8 Minutes
                </h3>
                <p className="font-dmsans text-sm md:text-base opacity-90 max-w-2xl mx-auto leading-relaxed">
                  Our integrated infrastructure saves lives by eliminating every possible delay in the medical supply chain.
                </p>
              </div>
            </div>

          </div>
          {/* Decorative background grids */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        </section>

        {/* Unified CTA */}
        <section className="w-full py-24 text-center px-6 lg:px-12 flex items-center justify-center bg-white border-t border-brand-borderLight/20">
          <div className="w-full max-w-[1280px] bg-[#f8f9ff] rounded-[40px] p-10 md:p-20 border border-outline-variant/30 flex flex-col items-center gap-8 shadow-sm">
            <h2 className="font-syne font-bold text-3xl md:text-5xl text-primary tracking-[-1px]">
              Ready to join the network?
            </h2>
            <p className="font-dmsans text-base md:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
              Whether you are a donor, a healthcare professional, or a network operator, your participation makes LifeLink AI stronger.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/register"
                className="inline-flex items-center justify-center px-8 py-3.5 font-syne font-bold text-white bg-gradient-to-br from-primary to-secondary hover:brightness-110 shadow-md hover:shadow-lg transition-all rounded-full"
              >
                Join the LifeLink Network
              </Link>
              <Link 
                href="/contact"
                className="inline-flex items-center justify-center bg-transparent border-2 border-primary text-primary px-8 py-3.5 rounded-full font-syne font-bold hover:bg-primary/5 transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
