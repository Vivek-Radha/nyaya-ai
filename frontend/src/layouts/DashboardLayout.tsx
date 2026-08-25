import React from 'react';
import { Navbar } from '../components/landing/Navbar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden font-inter transition-colors duration-300">
      
      {/* Spotlight glow behind text for both modes */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 via-zinc-50 to-zinc-50 dark:from-indigo-900/10 dark:via-zinc-950 dark:to-zinc-950 z-0 pointer-events-none transition-colors"></div>
      {/* Unified Top Navbar */}
      <Navbar />

      {/* Main content */}
      <main className="flex-1 w-full pt-16 relative z-10 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
