import React from 'react'
import { Scale } from 'lucide-react'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors">
      {/* Global Background ambient light */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-zinc-50 to-zinc-50 dark:from-indigo-900/20 dark:via-zinc-950 dark:to-zinc-950 z-0 transition-colors"></div>

      {/* Left branding panel */}
      <div className="hidden md:flex flex-col justify-between w-1/2 p-12 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-white/10 relative overflow-hidden shadow-2xl z-10 transition-colors">
        
        {/* Massive Ambient glow inside panel */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

        {/* Graphical Weight Scale Watermark (Neon Glitch Effect) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
          <Scale className="w-96 h-96 text-indigo-500/20" strokeWidth={1.5} />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-[49%] -translate-y-[50%] pointer-events-none z-0 mix-blend-screen">
          <Scale className="w-96 h-96 text-teal-400/20" strokeWidth={1.5} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-5 mb-8">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-teal-500 shadow-[0_0_40px_rgba(79,70,229,0.5)] animate-[pulse_3s_ease-in-out_infinite]">
              <div className="absolute inset-0 bg-white/10 rounded-2xl"></div>
              <Scale className="w-8 h-8 text-white z-10 drop-shadow-lg" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent tracking-tighter uppercase font-mono transition-colors">
              NYAYA<span className="text-transparent bg-gradient-to-r from-indigo-500 to-teal-400 bg-clip-text">-AI</span>
            </h1>
          </div>
          <p className="text-indigo-900/80 dark:text-indigo-200/80 text-sm font-medium leading-relaxed max-w-md drop-shadow-sm dark:drop-shadow-md transition-colors">The futuristic legal operating system. <br/>Justice made simple with Artificial Intelligence.</p>
        </div>
        
        <div className="relative z-10 space-y-6 w-full">
          <div className="p-6 rounded-2xl bg-white/50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 backdrop-blur-xl shadow-xl dark:shadow-2xl relative overflow-hidden group max-w-lg w-full transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-teal-500/5 dark:from-indigo-500/10 dark:to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <blockquote className="space-y-3 relative z-10">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200 leading-relaxed italic transition-colors">
                "NYAYA-AI helped me understand my legal rights in minutes, instead of spending hours researching complex jargon. It feels like magic."
              </p>
              <footer className="text-xs font-bold text-teal-400 tracking-wider uppercase">— A Citizen of India</footer>
            </blockquote>
          </div>
        </div>
      </div>
      
      {/* Right Form panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-transparent z-10 relative">
        <div className="w-full max-w-md space-y-8 p-10 rounded-3xl bg-white/80 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 backdrop-blur-2xl shadow-xl dark:shadow-2xl relative transition-colors">
          <div className="absolute inset-0 rounded-3xl border border-indigo-500/10 pointer-events-none"></div>
          {children}
        </div>
      </div>
    </div>
  )
}
