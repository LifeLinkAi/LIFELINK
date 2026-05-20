'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Heart, Mail, MapPin, Globe, Headphones, Send, X, MessageSquare, Check } from 'lucide-react';
import Navbar from '@/components/navigation/Navbar';
import Footer from '@/components/navigation/Footer';

export default function ContactPage() {
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Chat widget states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'support' | 'user'; text: string }>>([
    { sender: 'support', text: 'Hello! How can we assist you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setName('');
      setEmail('');
      setMessage('');
    }, 3000);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    // Trigger mock response
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'support', text: 'Thank you for reaching out! Our team will respond shortly.' }
      ]);
    }, 1000);
  };

  return (
    <div className="relative min-h-screen w-full bg-brand-bgLight flex flex-col font-dmsans">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow w-full flex flex-col items-center pt-[76px]">
        
        {/* Contact Hero */}
        <section className="relative w-full py-16 md:py-24 flex items-center justify-center bg-gradient-to-br from-[#F4F7F0] to-[#DDE5D3] px-6 lg:px-12 overflow-hidden border-b border-brand-borderLight/30">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-green/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="w-full max-w-[960px] flex flex-col items-start text-left relative z-10 gap-4">
            <h1 className="font-syne font-extrabold text-4xl md:text-5xl leading-tight tracking-[-1.5px] text-brand-green">
              Contact &amp; Support
            </h1>
            <p className="font-dmsans text-lg leading-[1.6] text-brand-textDark max-w-[700px]">
              We are here to help. Reach out to our teams or find immediate assistance below.
            </p>
          </div>
        </section>

        {/* Emergency Hotlines & Sections */}
        <section className="w-full bg-[#fafbf9] px-6 lg:px-12 py-16 flex flex-col items-center justify-center">
          <div className="w-full max-w-[960px] flex flex-col gap-10">
            
            {/* Emergency Hotlines List */}
            <div className="flex flex-col gap-4">
              <h2 className="font-syne font-bold text-2xl tracking-[-0.015em] text-[#151811]">
                Emergency Hotlines
              </h2>
              
              {/* Hotline 1 */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white border border-brand-borderLight/40 rounded-2xl p-6 justify-between shadow-[0_4px_20px_rgba(62,82,25,0.02)]">
                <div className="flex items-center gap-4">
                  <div className="text-brand-green flex items-center justify-center rounded-xl bg-[#eef0ea] shrink-0 w-12 h-12">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-[#151811] text-base font-semibold leading-normal">Emergency Help</p>
                    <p className="text-[#788560] text-sm font-medium leading-normal">1-800-123-4567</p>
                  </div>
                </div>
                <a 
                  href="tel:18001234567"
                  className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-[#eef0ea] text-[#151811] text-sm font-bold hover:bg-[#e3e6de] transition-colors w-full sm:w-auto"
                >
                  Call Now
                </a>
              </div>

              {/* Hotline 2 */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white border border-brand-borderLight/40 rounded-2xl p-6 justify-between shadow-[0_4px_20px_rgba(62,82,25,0.02)]">
                <div className="flex items-center gap-4">
                  <div className="text-brand-green flex items-center justify-center rounded-xl bg-[#eef0ea] shrink-0 w-12 h-12">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-[#151811] text-base font-semibold leading-normal">Mental Health Support</p>
                    <p className="text-[#788560] text-sm font-medium leading-normal">1-800-987-6543</p>
                  </div>
                </div>
                <a 
                  href="tel:18009876543"
                  className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-[#eef0ea] text-[#151811] text-sm font-bold hover:bg-[#e3e6de] transition-colors w-full sm:w-auto"
                >
                  Call Now
                </a>
              </div>
            </div>

            {/* Sub-Container for Form & Map */}
            <div className="flex flex-col gap-12 mt-4">
              
              {/* Form Section */}
              <section className="bg-surface-container-highest p-8 rounded-2xl border border-outline-variant/30 shadow-[0_8px_30px_rgba(85,107,47,0.05)]">
                <div className="flex items-center gap-3 mb-6 text-primary">
                  <Mail className="w-6 h-6 text-brand-green animate-pulse" />
                  <h2 className="font-syne font-bold text-2xl text-on-surface">Send us a message</h2>
                </div>

                <AnimatePresence mode="wait">
                  {isSubmitted ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white border border-brand-green/20 rounded-xl p-8 flex flex-col items-center text-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green">
                        <Check className="w-6 h-6" />
                      </div>
                      <h3 className="font-syne font-bold text-xl text-brand-green">Message Received!</h3>
                      <p className="font-dmsans text-sm text-brand-textDark">Thank you for your submission. Our team will contact you shortly.</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-dmsans text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Full Name</label>
                          <input 
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-base placeholder:text-outline" 
                            placeholder="Jane Doe"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-dmsans text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Email Address</label>
                          <input 
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-base placeholder:text-outline" 
                            placeholder="jane@example.com"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-dmsans text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Department</label>
                        <select 
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-base"
                        >
                          <option>General Inquiry</option>
                          <option>Partnership</option>
                          <option>Donor Support</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-dmsans text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Message</label>
                        <textarea 
                          required
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-base placeholder:text-outline" 
                          placeholder="How can we help you?" 
                          rows={4}
                        />
                      </div>
                      <div className="mt-2">
                        <button 
                          type="submit"
                          className="px-6 py-3 rounded-lg font-syne font-bold text-on-primary bg-gradient-to-br from-primary to-secondary hover:brightness-105 transition-all shadow-md w-full md:w-auto"
                        >
                          Submit Message
                        </button>
                      </div>
                    </form>
                  )}
                </AnimatePresence>
              </section>

              {/* Interactive Map & Hubs */}
              <section className="bg-surface-container-high p-8 rounded-2xl border border-outline-variant/30 shadow-[0_8px_30px_rgba(85,107,47,0.05)]">
                <div className="flex items-center gap-3 mb-6 text-primary">
                  <Globe className="w-6 h-6 text-brand-green" />
                  <h2 className="font-syne font-bold text-2xl text-on-surface">Global Headquarters &amp; Regional Hubs</h2>
                </div>
                
                {/* Map Wrapper */}
                <div className="w-full h-64 md:h-96 rounded-xl overflow-hidden mb-6 relative bg-surface-dim shadow-inner">
                  <img 
                    alt="Interactive Global Map" 
                    className="w-full h-full object-cover opacity-80 mix-blend-multiply" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuANoKXW1k9JLjGk3EmWsvgf3CmTGlXgXK_Y56Lx9FDKJEXzhNPbtTkbRVQ3iDsr9Dq-zs4m6lFZGjNgRpa34-baqPCWKCwlDhHqv4K54xbHkCppS9X2ZSRpUSMuanjTEYEFPXdVLvVudAFAvCuc4jtznYhTfeKOwxNK5cnVBlPvzIf1CJH0BhhIJX9Nk8pjBPX9z9biQk3E1uX6evXvqrAXIR8ryuWtT7vEWqJ1525Dr6d3baBhEiqmT34nqC2f4DgFYf5IEpiprZzl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high/80 to-transparent"></div>
                </div>

                {/* Hub Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/50 flex flex-col gap-2 shadow-[0_2px_10px_rgba(62,82,25,0.02)]">
                    <h3 className="font-syne font-bold text-lg text-on-surface">Geneva HQ</h3>
                    <p className="font-dmsans text-sm text-on-surface-variant leading-relaxed">
                      1200 Avenue de la Paix<br />Geneva, Switzerland
                    </p>
                    <span className="text-primary font-dmsans text-[11px] font-bold uppercase tracking-wider mt-auto pt-3">Main Office</span>
                  </div>
                  
                  <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/50 flex flex-col gap-2 shadow-[0_2px_10px_rgba(62,82,25,0.02)]">
                    <h3 className="font-syne font-bold text-lg text-on-surface">Americas Hub</h3>
                    <p className="font-dmsans text-sm text-on-surface-variant leading-relaxed">
                      100 UN Plaza<br />New York, NY, USA
                    </p>
                    <span className="text-tertiary font-dmsans text-[11px] font-bold uppercase tracking-wider mt-auto pt-3">Regional Center</span>
                  </div>
                  
                  <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/50 flex flex-col gap-2 shadow-[0_2px_10px_rgba(62,82,25,0.02)]">
                    <h3 className="font-syne font-bold text-lg text-on-surface">Asia-Pacific Hub</h3>
                    <p className="font-dmsans text-sm text-on-surface-variant leading-relaxed">
                      Marina Bay Financial Centre<br />Singapore
                    </p>
                    <span className="text-tertiary font-dmsans text-[11px] font-bold uppercase tracking-wider mt-auto pt-3">Regional Center</span>
                  </div>
                </div>
              </section>

            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        
        {/* Chat Window */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-surface-container-lowest w-72 rounded-xl shadow-[0_8px_30px_rgba(85,107,47,0.15)] border border-outline-variant/30 overflow-hidden flex flex-col pointer-events-auto"
            >
              {/* Header */}
              <div className="bg-primary p-4 flex items-center justify-between text-on-primary">
                <div className="flex items-center gap-2">
                  <Headphones className="w-5 h-5 animate-pulse" />
                  <span className="font-syne text-sm font-semibold">Live Support</span>
                </div>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="p-4 bg-surface flex flex-col gap-3 h-48 overflow-y-auto">
                {chatMessages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`p-2.5 rounded-xl max-w-[85%] font-dmsans text-sm ${
                      msg.sender === 'support' 
                        ? 'bg-surface-container-high text-on-surface rounded-tl-none self-start'
                        : 'bg-primary text-on-primary rounded-tr-none self-end'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>

              {/* Send Form */}
              <form onSubmit={handleSendChatMessage} className="p-2 bg-surface-container-lowest border-t border-outline-variant/20 flex gap-1">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="w-full bg-surface-container border-none rounded-full px-3 py-1.5 text-sm text-on-surface focus:ring-0 focus:outline-none placeholder:text-outline" 
                  placeholder="Type a message..." 
                />
                <button 
                  type="submit"
                  className="bg-primary text-on-primary hover:brightness-105 transition-all rounded-full w-8 h-8 flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Action Button */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-primary text-on-primary w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="Toggle live support chat"
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>

    </div>
  );
}
