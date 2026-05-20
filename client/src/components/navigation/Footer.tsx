'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-brand-borderLight/40 py-16 px-6 relative z-10 font-dmsans">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand Column */}
        <div className="col-span-1 flex flex-col gap-4">
          <div className="flex items-center gap-2.5 text-brand-green">
            <svg className="w-5 h-5 text-brand-green" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z" fill="currentColor"></path>
            </svg>
            <span className="font-syne font-bold text-xl tracking-tight text-[#121c2a]">
              LifeLink AI
            </span>
          </div>
          <p className="text-sm text-[#45483c] leading-relaxed opacity-85">
            Empowering modern healthcare through intelligent, bio-minimalist technology ecosystems.
          </p>
        </div>

        {/* Column 2: Platform */}
        <div className="col-span-1 flex flex-col gap-4">
          <h4 className="font-syne font-bold text-base text-[#121c2a]">Platform</h4>
          <div className="flex flex-col gap-2.5">
            <Link href="/features" className="text-sm text-[#45483c] hover:text-[#3e5219] transition-colors duration-200">
              Features
            </Link>
            <Link href="/services" className="text-sm text-[#45483c] hover:text-[#3e5219] transition-colors duration-200">
              Services
            </Link>
            <Link href="/#technology" className="text-sm text-[#45483c] hover:text-[#3e5219] transition-colors duration-200">
              Technology
            </Link>
          </div>
        </div>

        {/* Column 3: Company */}
        <div className="col-span-1 flex flex-col gap-4">
          <h4 className="font-syne font-bold text-base text-[#121c2a]">Company</h4>
          <div className="flex flex-col gap-2.5">
            <Link href="/#about" className="text-sm text-[#45483c] hover:text-[#3e5219] transition-colors duration-200">
              About Us
            </Link>
            <Link href="/stories" className="text-sm text-[#45483c] hover:text-[#3e5219] transition-colors duration-200">
              Stories
            </Link>
            <Link href="/contact" className="text-sm text-[#45483c] hover:text-[#3e5219] transition-colors duration-200">
              Contact
            </Link>
          </div>
        </div>

        {/* Column 4: Legal */}
        <div className="col-span-1 flex flex-col gap-4">
          <h4 className="font-syne font-bold text-base text-[#121c2a]">Legal</h4>
          <div className="flex flex-col gap-2.5">
            <Link href="/privacy" className="text-sm text-[#45483c] hover:text-[#3e5219] transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-[#45483c] hover:text-[#3e5219] transition-colors duration-200">
              Terms of Service
            </Link>
            <Link href="/hipaa" className="text-sm text-[#45483c] hover:text-[#3e5219] transition-colors duration-200">
              HIPAA Compliance
            </Link>
          </div>
        </div>

      </div>

      {/* Footer Bottom Bar */}
      <div className="max-w-[1280px] mx-auto mt-12 pt-8 border-t border-[#c5c8b8]/20 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-[#45483c] opacity-80">
          © 2026 LifeLink AI. All rights reserved. Emergency Care, Redefined.
        </p>
        <div className="flex gap-4">
          <a href="#" className="text-[#45483c] hover:text-[#3e5219] transition-colors duration-200" aria-label="Website">
            <Globe className="w-5 h-5" />
          </a>
          <a href="mailto:info@lifelink.ai" className="text-[#45483c] hover:text-[#3e5219] transition-colors duration-200" aria-label="Email">
            <Mail className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
