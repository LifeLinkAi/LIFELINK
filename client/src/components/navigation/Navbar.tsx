'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const navLinks = [
    { name: 'Services', href: '/services' },
    { name: 'Features', href: '/features' },
    { name: 'Stories', href: '/stories' },
    { name: 'Contact', href: '/contact' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[76px] flex items-center justify-center bg-[#F8F9FF]/70 border-b border-brand-borderLight/30 shadow-[0_8px_30px_rgba(85,107,47,0.08)] backdrop-blur-xl transition-all duration-300">
      <div className="w-full max-w-[1280px] px-6 lg:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-syne font-semibold text-2xl tracking-[-1.2px] text-brand-green transition-transform duration-300 group-hover:scale-105">
            LifeLink AI
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`text-base font-medium transition-colors duration-200 relative group py-2 ${
                  isActive ? 'text-brand-green' : 'text-brand-navText hover:text-brand-green'
                }`}
              >
                {link.name}
                <span className={`absolute bottom-0 left-0 h-[2px] bg-brand-green transition-all duration-300 ${
                  isActive ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <Link 
            href="/login" 
            className="font-syne font-medium text-[16px] text-brand-navText hover:text-brand-green transition-colors duration-200"
          >
            Login
          </Link>
          <Link 
            href="/register" 
            className="flex items-center justify-center px-5 py-2 h-11 font-syne font-medium text-[16px] text-white bg-gradient-to-r from-brand-green to-brand-olive hover:brightness-110 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_20px_-3px_rgba(62,82,25,0.2)] transition-all duration-200 rounded-lg transform hover:-translate-y-[1px] active:translate-y-0"
          >
            Join Network
          </Link>
        </div>
      </div>
    </header>
  );
}
