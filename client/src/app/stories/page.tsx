'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  ArrowRight, 
  TrendingUp, 
  Play, 
  Star, 
  CheckCircle2, 
  Quote, 
  X, 
  Volume2, 
  PlayCircle 
} from 'lucide-react';
import Navbar from '@/components/navigation/Navbar';
import Footer from '@/components/navigation/Footer';
import Link from 'next/link';

export default function StoriesPage() {
  const [livesSaved, setLivesSaved] = useState(14150);
  const [selectedVideo, setSelectedVideo] = useState<{ title: string; category: string; duration: string } | null>(null);

  // Animate counter on mount
  useEffect(() => {
    const endValue = 14258;
    const duration = 1500; // ms
    const frameRate = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // Ease out quadratic
      const current = Math.round(14150 + (endValue - 14150) * (progress * (2 - progress)));
      setLivesSaved(current);

      if (frame === totalFrames) {
        clearInterval(timer);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, []);

  const stories = [
    {
      title: "The Marathon Continues",
      category: "Kidney Transplant",
      location: "Seattle, WA",
      duration: "12:45",
      description: "How a complete stranger gave Sarah the endurance to not just live, but to run her first post-surgery marathon.",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDt_DnODsAxK1ZMj1FJnfdSusepk9hDJJ1P6y5G8B8hkeJ_KAzpXkrKcOrhnW7ajHlo3XDDtWg_1NSpr-h_zTu_y6fKKSl3Sk3l8QttFyJkPoarN2w-o1uc8ydldlOE3h6sMifHl3KIOuaT6nhJamEqHcSth4dqNe9Fm15cFQMGDeAkiLX1ybq_bIPm-XGI8Dmrso20sNw9ztGnuAxnNhoIlCqXz4n92so58A6ziBUxpT1n8MNN9Ded3mXGM0xK8FfJUMBfl9hT8T_W"
    },
    {
      title: "A Second Beat",
      category: "Heart Transplant",
      location: "Austin, TX",
      duration: "08:20",
      description: "Marcus was out of time. A sudden match in the dead of night sparked a logistical miracle and a lifelong bond.",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDYZQvx4LCF2yP-L2E-Xn6pnEDzjJXxJyFXBFrDUZqyalbporx-3PKqb7pKlic74f2exwVDyWTtNOh7H-IbIj668OAnKp7ZuRZACllTb4pvswr12VzG75HunYTErAq0Jl8FBPCwAupteX9Exe-_JdRaZsxq1iTpfBRz0UwM-Q9CFTJBsvUsgY6A6vYE8_kwB9WpLVmaKNBgIEFqWpikx7tWLSpblBekY3Echw2GN0uFTlLc8qHXvndgoT0eV02dNiw_jBZc7CPEUoug"
    },
    {
      title: "The Gift of Growing Up",
      category: "Liver Transplant",
      location: "Boston, MA",
      duration: "15:10",
      description: "Little Emma's journey from a critical care ward to her first day of kindergarten, made possible by a living donor.",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDZ7LPB8LUkNG7JBXambWZyONTsTh2YQmgD5K4neWpC4tzDr-nVrATICUcHBZ_8BNlFHs23jaYU9sm-NHVkLZT3T2Bbc2R5TwjST-vCiRhWbupEZqe9fZdkbeM2J5s7HU4l6QRBVB4HgOOLng-lO8E1rfzWCC88s6HSkX5NjHVuVsEhHRsGRh42Tfcg876k2eSxZ8duEc5KdE5Foo9WZwrJovBaMt0dQT8gClvFpZMGo-vfzgHMyad615khqeoh01QPyMSZMbrRpLQg"
    }
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#f8f9ff] flex flex-col font-dmsans selection:bg-primary-container selection:text-on-primary-container">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow w-full flex flex-col items-center pt-[76px]">
        <div className="w-full max-w-[1280px] px-6 lg:px-12 py-16 flex flex-col gap-20">

          {/* Hero Section */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
            <div className="lg:col-span-7 flex flex-col items-start text-left gap-6">
              <div className="inline-flex items-center gap-2 bg-surface-container rounded-full px-4 py-2">
                <Heart className="w-4 h-4 text-tertiary fill-current text-brand-green" />
                <span className="font-dmsans text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Real-Time Impact</span>
              </div>
              <h1 className="font-syne font-bold text-4xl md:text-6xl leading-[1.1] tracking-[-2px] text-on-surface max-w-2xl">
                The heartbeat of humanity, measured in lives changed.
              </h1>
              <p className="font-dmsans text-lg text-on-surface-variant max-w-2xl leading-relaxed">
                Witness the profound journeys of courage and connection. Every number here represents a second chance, a family kept whole, and the incredible legacy of donors.
              </p>
              <div className="pt-2">
                <Link 
                  href="/register?role=Donor"
                  className="inline-flex items-center gap-2 px-6 py-3.5 font-syne font-bold text-white bg-gradient-to-br from-primary to-tertiary hover:brightness-110 shadow-lg hover:shadow-[0_8px_30px_rgba(85,107,47,0.15)] transition-all rounded-xl"
                >
                  Become a Donor
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 w-full">
              <div className="bg-surface-container-lowest rounded-3xl p-10 shadow-[0_8px_30px_rgba(85,107,47,0.08)] border border-outline-variant/30 flex flex-col items-center justify-center relative overflow-hidden h-72">
                <div className="absolute inset-0 bg-gradient-to-br from-surface to-surface-container-lowest opacity-50 z-0" />
                <div className="relative z-10 text-center space-y-3">
                  <p className="font-syne font-bold text-xl text-on-surface-variant">Total Lives Saved</p>
                  <div className="font-syne font-extrabold text-primary text-6xl md:text-7xl tracking-tight">
                    {livesSaved.toLocaleString()}
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-secondary bg-secondary-container/30 rounded-full px-3 py-1 text-sm font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    <span>+12 today</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Stories */}
          <section className="flex flex-col gap-8 w-full border-t border-outline-variant/30 pt-16">
            <div>
              <h2 className="font-syne font-bold text-3xl text-on-surface">Featured Journeys</h2>
              <p className="font-dmsans text-base text-on-surface-variant mt-1">Deep dives into the stories that define our mission.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stories.map((story) => (
                <motion.article 
                  key={story.title}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedVideo(story)}
                  className="group cursor-pointer flex flex-col gap-4"
                >
                  {/* Thumbnail */}
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-surface-container-highest shadow-[0_8px_30px_rgba(85,107,47,0.05)]">
                    <img 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      src={story.imageUrl} 
                      alt={story.title}
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-primary shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-8 h-8 fill-current translate-x-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-sm px-2.5 py-1 rounded font-dmsans text-white text-xs font-bold">
                      {story.duration}
                    </div>
                  </div>

                  {/* Text Details */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
                      <span>{story.category}</span>
                      <span className="w-1 h-1 rounded-full bg-outline-variant" />
                      <span className="text-on-surface-variant">{story.location}</span>
                    </div>
                    <h3 className="font-syne font-bold text-xl text-on-surface group-hover:text-primary transition-colors">
                      {story.title}
                    </h3>
                    <p className="font-dmsans text-sm text-on-surface-variant leading-relaxed line-clamp-2">
                      {story.description}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </section>

          {/* Divider */}
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-outline-variant/50 to-transparent" />

          {/* Reunion Gallery & Reviews */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full">
            
            {/* Reunion Gallery */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <h2 className="font-syne font-bold text-3xl text-on-surface">Moments of Connection</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-4">
                  <img 
                    className="w-full h-64 object-cover rounded-2xl shadow-[0_8px_30px_rgba(85,107,47,0.05)]" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQYHHhYwRP6goHdSJOWxlgcP50M_j-CR9MBVYXm6ci_U2z-Mr1QSEyaOTuviu3JdDQ_3x7ODKWRuwjuVWV1BftwE1nuZoj6BHzKBOYfXR1PXQYonwbClBLQwbrAP6fdIxD4lWVHbluHk0YOgGSj10W1Pb-hLCkfOaWbKj6d7XRjt11PTI9-_cKO8heW-_mZ09ISmhZqLCEMya_mSeUaNsUNEHSs0W8fFaDdlcoIqojxjETguK78DpP1Gkhw3lK5E27tiHR-txdnpFX" 
                    alt="Donor and recipient reunion garden"
                  />
                  <img 
                    className="w-full h-48 object-cover rounded-2xl shadow-[0_8px_30px_rgba(85,107,47,0.05)]" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuApCrx1JqKJrWGbjfam9dFA1lLPBh-YCyuR4l8-G8RdfwgvpIr3uKMDN9ednwBwpibCZ9T4pHAYMisufZ9UqZY5sxz0BwpxzsrJhnmGemwBynd0ticvWyRRkGp1JWrn5d2NODcjh6cMURsdLKePLyW7GprLmMNviAjSPlUxmtGrlDQH_5OJErLPjU_Vxm0j0X1VmyxHIrb_SSSeHy5J6h3Bs56r2DAHBA5H1uDuBVOHIFA2HgTON73dy33OSjebb_5z-13KyOkcboQX" 
                    alt="Hands clasped transfer of life"
                  />
                </div>
                <div className="flex flex-col gap-4 sm:pt-10">
                  <img 
                    className="w-full h-56 object-cover rounded-2xl shadow-[0_8px_30px_rgba(85,107,47,0.05)]" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWs-y00zQLLzHdfF7RFwXegL_PEkVwhUr0BuWw9Em-BypK_xdpFdeIDlEbkFq8KJJ717fNWA_Gpqp7dgaxtJdfUiifq4-7zaCZOzjmEdheA34m_r7CZVfUW6Rqvu18nuRyh63qwhL2bPRt749A8KJwGFkMx2_NKSEfTWNUd_YIGx9V6_W6J0MYICQQOrPUr7QhQrdIEUxRSgW2A8g_8gjryVJ6RnBBJXHgWpYT37nQf8_nV-M5SNBrM6C_DWJkEeK6zgtr8kiMQkwu" 
                    alt="Hospital Recovery Celebration"
                  />
                  <div className="bg-surface-container-low rounded-2xl p-6 h-56 flex flex-col justify-center border border-outline-variant/40 shadow-[0_8px_30px_rgba(85,107,47,0.05)]">
                    <Quote className="w-8 h-8 text-primary mb-3 fill-current opacity-20" />
                    <p className="font-dmsans italic leading-relaxed text-sm text-on-surface-variant">
                      &quot;I don&apos;t just carry their organ. I carry their spirit, their generosity, and a profound responsibility to live fully.&quot;
                    </p>
                    <p className="font-dmsans text-xs font-bold text-tertiary uppercase tracking-wider mt-4">
                      — David R., Recipient
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hospital Reviews */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <h2 className="font-syne font-bold text-3xl text-on-surface">Excellence in Care</h2>
              
              <div className="flex flex-col gap-4">
                
                {/* Hospital Card 1 */}
                <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/20 shadow-[0_8px_30px_rgba(85,107,47,0.04)] flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-0.5 text-secondary">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-current text-brand-green" />
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-container text-on-primary-container rounded-lg font-dmsans text-[10px] font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3 text-[#4e6e00]" />
                      Partner
                    </span>
                  </div>
                  <p className="font-dmsans text-sm text-on-surface-variant leading-relaxed">
                    &quot;The level of coordination and compassion shown by the transplant team was extraordinary. They didn&apos;t just treat the clinical aspects; they supported our entire family through the emotional weight of the process.&quot;
                  </p>
                  <div className="mt-2">
                    <p className="font-syne font-bold text-sm text-on-surface">St. Jude Medical Center</p>
                    <p className="font-dmsans text-xs text-on-surface-variant">Cardiology &amp; Transplant Wing</p>
                  </div>
                </div>

                {/* Hospital Card 2 */}
                <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/20 shadow-[0_8px_30px_rgba(85,107,47,0.04)] flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-0.5 text-secondary">
                      {[...Array(4)].map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-current text-brand-green" />
                      ))}
                      <Star className="w-4 h-4 opacity-40 text-brand-green" />
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-container text-on-primary-container rounded-lg font-dmsans text-[10px] font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3 text-[#4e6e00]" />
                      Partner
                    </span>
                  </div>
                  <p className="font-dmsans text-sm text-on-surface-variant leading-relaxed">
                    &quot;State-of-the-art facilities paired with deeply human-centric care. The bio-minimalist environment genuinely reduced our anxiety during the wait. Unparalleled professionalism.&quot;
                  </p>
                  <div className="mt-2">
                    <p className="font-syne font-bold text-sm text-on-surface">Mayo Clinic</p>
                    <p className="font-dmsans text-xs text-on-surface-variant">Organ Recovery Center</p>
                  </div>
                </div>

              </div>
            </div>

          </section>

        </div>
      </main>

      {/* Video Modal Player */}
      <AnimatePresence>
        {selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVideo(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#121c2a] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative z-10 border border-white/10"
            >
              {/* Header */}
              <div className="p-4 flex items-center justify-between border-b border-white/10 text-white">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wider text-secondary-fixed">{selectedVideo.category}</span>
                  <span className="font-syne font-bold text-lg">{selectedVideo.title}</span>
                </div>
                <button 
                  onClick={() => setSelectedVideo(null)}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Video Mock Panel */}
              <div className="relative aspect-video w-full bg-black flex items-center justify-center group/video select-none">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/80 p-8 text-center bg-gradient-to-t from-black/80 via-transparent to-black/20">
                  <PlayCircle className="w-16 h-16 text-secondary-fixed animate-pulse" />
                  <div>
                    <p className="font-syne font-bold text-lg">Playing Mock Video Stream</p>
                    <p className="font-dmsans text-xs text-white/60">Duration: {selectedVideo.duration} • Connected Securely</p>
                  </div>
                </div>
                
                {/* Control Overlay Mock */}
                <div className="absolute bottom-0 left-0 w-full p-4 flex items-center justify-between text-white bg-black/60 opacity-0 group-hover/video:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-4">
                    <Play className="w-5 h-5 fill-current text-white cursor-pointer" />
                    <div className="w-48 h-1 bg-white/20 rounded-full relative overflow-hidden">
                      <div className="absolute left-0 top-0 h-full w-1/3 bg-secondary-fixed" />
                    </div>
                    <span className="text-xs">04:15 / {selectedVideo.duration}</span>
                  </div>
                  <Volume2 className="w-5 h-5 cursor-pointer hover:text-secondary-fixed transition-colors" />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer />
    </div>
  );
}
