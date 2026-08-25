import React from 'react';

export function InteractiveScale() {
  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none group">
      
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-indigo-500/20 blur-[50px] rounded-full"></div>

      <svg viewBox="-10 -10 220 220" className="w-full h-full overflow-visible drop-shadow-[0_10px_15px_rgba(99,102,241,0.2)] transform scale-125">
        
        <defs>
          <linearGradient id="pillarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" className="stop-color-indigo-400 dark:stop-color-indigo-300" stopColor="#818CF8" />
            <stop offset="100%" className="stop-color-indigo-900 dark:stop-color-indigo-950" stopColor="#312E81" />
          </linearGradient>
          
          <linearGradient id="beamGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2DD4BF" />
            <stop offset="50%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
          
          <linearGradient id="panGradRight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(99,102,241,0.1)" />
            <stop offset="100%" stopColor="rgba(99,102,241,0.4)" />
          </linearGradient>
          
          <linearGradient id="panGradLeft" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(45,212,191,0.1)" />
            <stop offset="100%" stopColor="rgba(45,212,191,0.4)" />
          </linearGradient>

          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="heavyGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Floating AI Particles */}
        <circle cx="40" cy="40" r="2" fill="#2DD4BF" filter="url(#neonGlow)" className="animate-pulse" />
        <circle cx="160" cy="60" r="3" fill="#818CF8" filter="url(#neonGlow)" className="animate-bounce" />

        {/* Base Platform */}
        <ellipse cx="100" cy="166" rx="35" ry="5" fill="#312E81" />
        
        {/* Pillar - Organic Sci-Fi Shape */}
        <path d="M96 85 C96 110, 90 140, 85 165 L115 165 C110 140, 104 110, 104 85 Z" fill="url(#pillarGrad)" />
        {/* Pillar Core Light */}
        <path d="M99 90 L101 90 L101 160 L99 160 Z" fill="#6366F1" filter="url(#neonGlow)" opacity="0.8"/>

        {/* Animated Group (Beam & Pans) */}
        <g className="origin-[100px_85px] transition-transform duration-1200 ease-bounce-md group-hover:rotate-[15deg]">
          
          {/* Beam */}
          <rect x="25" y="82" width="150" height="6" rx="3" fill="url(#beamGrad)" filter="url(#neonGlow)" />
          
          {/* Left Pan Group (Rights) - Counter-rotates */}
          <g className="origin-[35px_85px] transition-transform duration-1200 ease-bounce-md group-hover:-rotate-[15deg]">
            {/* Holographic Suspension Lines */}
            <path d="M35 85 L0 135 M35 85 L70 135" stroke="#2DD4BF" strokeWidth="2.5" strokeDasharray="5 3" opacity="0.8" />
            
            {/* Pan Bowl */}
            <path d="M0 135 C0 160, 70 160, 70 135 Z" fill="url(#panGradLeft)" stroke="#2DD4BF" strokeWidth="2" filter="url(#neonGlow)"/>
            
            {/* Content Container */}
            <g transform="translate(35, 115)">
              {/* Shield Icon */}
              <g transform="scale(0.9) translate(0, -2)">
                <path d="M-6 -10 L0 -13 L6 -10 L6 -3 C6 3, 0 6, 0 6 C0 6, -6 3, -6 -3 Z" fill="none" stroke="#2DD4BF" strokeWidth="1.875" />
              </g>
              <text x="0" y="15" fill="#0F766E" className="dark:fill-[#CCFBF1] font-black text-[10px] uppercase tracking-widest" textAnchor="middle" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.3))">Rights</text>
            </g>
          </g>

          {/* Right Pan Group (Data) - Counter-rotates */}
          <g className="origin-[165px_85px] transition-transform duration-1200 ease-bounce-md group-hover:-rotate-[15deg]">
            {/* Holographic Suspension Lines */}
            <path d="M165 85 L130 135 M165 85 L200 135" stroke="#818CF8" strokeWidth="2.5" strokeDasharray="5 3" opacity="0.8" />
            
            {/* Pan Bowl */}
            <path d="M130 135 C130 160, 200 160, 200 135 Z" fill="url(#panGradRight)" stroke="#818CF8" strokeWidth="2" filter="url(#neonGlow)"/>
            
            {/* Content Container */}
            <g transform="translate(165, 115)">
              {/* Lock Icon */}
              <g transform="scale(1.1) translate(0, -2)">
                <rect x="-5" y="-6" width="10" height="8" rx="2" fill="none" stroke="#818CF8" strokeWidth="1.5" />
                <path d="M-3 -6 L-3 -10 C-3 -12, 3 -12, 3 -10 L3 -6" fill="none" stroke="#818CF8" strokeWidth="1.5" />
              </g>
              <text x="0" y="15" fill="#3730A3" className="dark:fill-[#E0E7FF] font-black text-[10px] uppercase tracking-widest" textAnchor="middle" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.3))">Data</text>
            </g>
          </g>
          
          {/* Center Glowing Pivot */}
          <circle cx="100" cy="85" r="8" fill="#FFFFFF" filter="url(#heavyGlow)" />
          <circle cx="100" cy="85" r="6" fill="#FFFFFF" stroke="#6366F1" strokeWidth="2" />
          <circle cx="100" cy="85" r="2" fill="#312E81" />
        </g>
        
      </svg>
    </div>
  );
}
