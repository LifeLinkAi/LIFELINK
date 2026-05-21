'use client';

import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

export default function AdminHeader() {
  const controls = useAnimation();

  useEffect(() => {
    // Initial entrance animation
    controls.start("animate");

    // Loop wave animation every 3 seconds
    const interval = setInterval(() => {
      controls.start("loopWave");
    }, 3000);

    return () => clearInterval(interval);
  }, [controls]);

  const logoVariants = {
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    },
    loopWave: {
      transition: {
        staggerChildren: 0.05
      }
    },
    hover: {
      transition: {
        staggerChildren: 0.03
      }
    }
  };

  const letterVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    loopWave: {
      y: [0, -8, 0],
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    },
    hover: {
      y: [0, -8, 0],
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  };

  return (
    <>
      {/* Load Material Symbols for icons */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <header className="flex justify-between items-center w-full px-2 md:px-6 h-16 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant shadow-sm sticky top-0">
        <div className="flex items-center gap-2">
          <motion.span 
            initial="initial"
            animate={controls}
            whileHover="hover"
            variants={logoVariants}
            className="font-syne font-bold text-[24px] tracking-[-1.2px] text-primary flex"
          >
            {"LifeLink".split("").map((char, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </motion.span>
        </div>

        <div className="flex items-center gap-4">
          <button
            aria-label="Notifications"
            className="p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-full flex items-center justify-center"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          
          <button
            aria-label="Settings"
            className="p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-full flex items-center justify-center"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>

          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant ml-2">
            <img
              alt="Medical Professional Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAR1ddKrVvcxZjGY50uCPA46yZa5hX9s3_drT-2yKnJXv9QG0P6LJy1h40PtVrtRx8ybMBsDHjs41hXGR5EtbK9qyDSyWgahHmtqY5maRiFYY9Uu5ejnHv_CeFE7EByE1EuDrbJ9_0nieSRRvt8Z7uiImkF7-pvdl6aqimbdMxhNNDFebSY9Ot9qeePcjeDOCfy-2chD2ljV-QoD0vxrOEapgylPujltuCS2Y1iPGBcVT_a35HWAa2_QN8nqTMkvH62iRGHE6PSz1Lj"
            />
          </div>
        </div>
      </header>
    </>
  );
}
