'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Services', href: '/services' },
    { name: 'Features', href: '/features' },
    { name: 'Stories', href: '/stories' },
    { name: 'Contact', href: '/contact' }
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[76px] flex items-center justify-center bg-[#F8F9FF]/80 border-b border-brand-borderLight/30 shadow-[0_8px_30px_rgba(85,107,47,0.05)] backdrop-blur-xl transition-all duration-300">
      <div className="w-full max-w-[1280px] px-6 lg:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group z-50" onClick={() => setIsMenuOpen(false)}>
          <span className="font-syne font-semibold text-2xl tracking-[-1.2px] text-brand-green transition-transform duration-300 group-hover:scale-105">
            LifeLink AI
          </span>
        </Link>

        {/* Desktop Navigation Links */}
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

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-6">
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

        {/* Mobile Hamburger Button */}
        <button 
          onClick={toggleMenu}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-brand-navText hover:text-brand-green transition-colors focus:outline-none z-50"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X className="w-6 h-6 animate-rotate-once" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 top-[76px] bg-black/10 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Menu Drawer */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute top-[76px] left-0 right-0 bg-white border-b border-brand-borderLight/30 shadow-lg px-6 py-8 flex flex-col gap-6 z-40 md:hidden font-dmsans"
            >
              {/* Links */}
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link 
                      key={link.name} 
                      href={link.href}
                      onClick={toggleMenu}
                      className={`text-lg font-medium py-1.5 transition-colors duration-200 ${
                        isActive ? 'text-brand-green border-l-2 border-brand-green pl-3' : 'text-brand-navText hover:text-brand-green pl-3'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>

              <hr className="border-brand-borderLight/20 w-full" />

              {/* Action Buttons */}
              <div className="flex flex-col gap-4">
                <Link 
                  href="/login" 
                  onClick={toggleMenu}
                  className="flex items-center justify-center w-full h-11 font-syne font-medium text-[16px] text-brand-navText hover:text-brand-green border border-brand-borderLight rounded-lg transition-colors duration-200"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  onClick={toggleMenu}
                  className="flex items-center justify-center w-full h-11 font-syne font-medium text-[16px] text-white bg-gradient-to-r from-brand-green to-brand-olive rounded-lg hover:brightness-110 shadow-md transition-all duration-200"
                >
                  Join Network
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
