"use client";
import React from "react";

export default function LiveChats() {
    return (
        <div className="flex-1 flex overflow-hidden h-[calc(100vh-60px)]">
            {/* LEFT PANEL */}
            <div className="w-[340px] bg-[#f8f9fa] border-r border-gray-200 flex flex-col shrink-0">
                <div className="bg-[#eef5e5] p-6 border-b border-[#dce8c8]">
                    <div className="flex items-start gap-3">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b5e2b" strokeWidth="2.5" className="mt-1 flex-shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 mb-1">Emergency Ready Protocol</h3>
                            <p className="text-xs text-gray-600 leading-relaxed">Your blood type (O-) is currently in high demand at St. Jude's. Keep status updated.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#e8effc] p-5 border-b border-[#d4e1f9] cursor-pointer flex gap-4">
                    <div className="w-12 h-12 bg-[#4d7532] text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 relative">
                        S
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#e8effc] rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-gray-900 text-sm truncate pr-2">St. Jude Medical Center</h4>
                            <span className="text-[10px] text-gray-400 font-semibold whitespace-nowrap mt-0.5">10:42 AM</span>
                        </div>
                        <p className="text-xs text-green-700 font-medium">Typing...</p>
                    </div>
                </div>

                <div className="p-5 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors flex gap-4">
                    <div className="w-12 h-12 bg-[#e2e8f0] text-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-gray-900 text-sm truncate pr-2">LifeLink Support AI</h4>
                            <span className="text-[10px] text-gray-400 font-semibold whitespace-nowrap mt-0.5">Yesterday</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate leading-relaxed">Your recent records have been securely uploaded.</p>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#4d7532] text-white rounded-full flex items-center justify-center font-bold text-lg">S</div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">St. Jude Medical Center</h2>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-2 h-2 bg-green-500 rounded-full" />
                                <span className="text-xs text-gray-500 font-medium">Online – Dr. Aris</span>
                            </div>
                        </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-700 p-2">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-white">
                    <div className="flex justify-center mb-8">
                        <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-4 py-1.5 rounded-full tracking-wide">Today, Oct 24</span>
                    </div>

                    <div className="flex gap-4 max-w-2xl">
                        <div className="w-8 h-8 bg-[#4d7532] text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-1">S</div>
                        <div>
                            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-5 shadow-sm">
                                <p className="text-[13px] text-gray-800 leading-relaxed font-medium">Hello, thank you for being on standby. We are currently reviewing your recent lab results for a potential match.</p>
                            </div>
                            <span className="text-[10px] text-gray-400 font-semibold mt-2 ml-1 block">10:30 AM</span>
                        </div>
                    </div>

                    <div className="flex gap-4 max-w-2xl ml-auto justify-end">
                        <div>
                            <div className="bg-[#3b5e2b] text-white rounded-2xl rounded-tr-none p-5 shadow-sm">
                                <p className="text-[13px] leading-relaxed font-medium">Understood. I have also uploaded my latest physical exam records just in case.</p>
                            </div>
                            <span className="text-[10px] text-gray-400 font-semibold mt-2 mr-1 block text-right">10:35 AM</span>
                        </div>
                    </div>

                    <div className="flex gap-4 max-w-md ml-auto justify-end">
                        <div>
                            <div className="bg-[#f0f4f8] border border-[#e2e8f0] rounded-2xl rounded-tr-none p-4 flex items-center gap-4 cursor-pointer hover:bg-[#e6edf4] transition-colors">
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-green-700">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Physical_Exam_Oct24.pdf</p>
                                    <p className="text-[11px] text-gray-500 font-medium">2.4 MB</p>
                                </div>
                            </div>
                            <span className="text-[10px] text-gray-400 font-semibold mt-2 mr-1 block text-right">10:36 AM</span>
                        </div>
                    </div>

                    <div className="flex gap-4 max-w-2xl">
                        <div className="w-8 h-8 bg-[#4d7532] text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-1">S</div>
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-1.5 h-12">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                        </div>
                    </div>
                </div>

                <div className="bg-[#f8f9fa] p-6 border-t border-gray-200">
                    <div className="bg-white border border-gray-300 rounded-full flex items-center px-2 py-1.5 shadow-sm focus-within:border-green-400 focus-within:ring-1 focus-within:ring-green-400 transition-all">
                        <button className="p-3 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                        </button>
                        <input type="text" placeholder="Type a message..." className="flex-1 bg-transparent px-3 py-2 text-sm text-gray-700 focus:outline-none" />
                    </div>
                </div>
            </div>
        </div>
    );
}