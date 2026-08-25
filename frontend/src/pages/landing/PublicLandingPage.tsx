import React, { useEffect } from 'react';
import { Navbar } from '../../components/landing/Navbar';
import { ArrowRight, Scale, Search, Shield, BookOpen, FileText, Clock, MessageSquare, ChevronRight } from 'lucide-react';
import { useAuthGateStore } from '../../store/authGateStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion, useScroll, useTransform, useReducedMotion, useSpring, useMotionValue } from 'framer-motion';

export function PublicLandingPage() {
  const { openAuthGate } = useAuthGateStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const shouldReduceMotion = useReducedMotion();

  // Scroll Progress and Parallax
  const { scrollYProgress, scrollY } = useScroll();
  
  // Smooth scroll progress for indicator
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Parallax effects
  const bgY = useTransform(scrollY, [0, 1000], [0, shouldReduceMotion ? 0 : 200]);
  const heroVisualY = useTransform(scrollY, [0, 800], [0, shouldReduceMotion ? 0 : 60]);
  const featuresY = useTransform(scrollY, [0, 1500], [0, shouldReduceMotion ? 0 : -40]);

  useEffect(() => {
    const authQuery = searchParams.get('auth');
    if (authQuery === 'login' || authQuery === 'signup') {
      openAuthGate('/citizen/dashboard', authQuery);
      setSearchParams({});
    }
  }, [searchParams, openAuthGate, setSearchParams]);

  const handleProtectedAction = (returnTo: string = '/citizen/dashboard') => {
    if (user) {
      navigate(returnTo);
    } else {
      openAuthGate(returnTo);
    }
  };

  // --- ANIMATION VARIANTS --- //

  // Hero Container (Staggers its children)
  const heroContainerVars = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.15
      }
    }
  };

  // Premium text pop-in effect (used for headings line-by-line)
  const textPopVars = {
    hidden: { 
      opacity: 0, 
      y: 30,
      filter: shouldReduceMotion ? 'blur(0px)' : 'blur(6px)' 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      filter: 'blur(0px)',
      transition: { 
        type: "spring", 
        damping: 25, 
        stiffness: 100,
        duration: 0.8
      }
    }
  };

  // Fade up for descriptions
  const fadeUpVars = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  // Container for staggered grids (Cards)
  const staggerContainerVars = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  // Card items
  const cardVars = {
    hidden: { opacity: 0, y: 40, scale: 0.97 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1] 
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 font-inter selection:bg-indigo-500/30 overflow-x-hidden relative transition-colors">
      
      {/* Scroll Progress Indicator */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-indigo-500/50 origin-left z-[60]"
        style={{ scaleX }}
      />

      <Navbar />
      
      {/* Dynamic Background with Parallax */}
      <motion.div 
        style={{ y: bgY }}
        className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 via-zinc-50 to-zinc-50 dark:from-indigo-900/10 dark:via-zinc-950 dark:to-zinc-950 z-0 pointer-events-none transition-colors"
      />

      <main className="relative z-10 pt-32 pb-0">
        
        {/* ================= HERO SECTION ================= */}
        <section className="relative max-w-7xl mx-auto px-6 mb-24 pt-12 overflow-visible">
          {/* Spotlight Glow Behind Text */}
          <div className="hero-spotlight hero-spotlight-light dark:hero-spotlight-dark"></div>

          <motion.div 
            variants={heroContainerVars}
            initial="hidden"
            animate="visible"
            className="relative z-10 text-center max-w-4xl mx-auto space-y-8"
          >
            {/* Split heading into lines for premium reveal */}
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[1.1] text-zinc-900 dark:text-white flex flex-col items-center">
              <motion.span variants={textPopVars} className="inline-block">
                Understand Your Legal Situation
              </motion.span>
              <motion.span variants={textPopVars} className="inline-block mt-2">
                <span className="text-transparent bg-gradient-to-r from-indigo-600 to-teal-500 dark:from-indigo-500 dark:to-teal-400 bg-clip-text">
                  Before You Take the Next Step.
                </span>
              </motion.span>
            </h1>
            
            <motion.p variants={fadeUpVars} className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              Describe what happened, understand your possible legal options, explore relevant judgments, analyze documents, and prepare questions for a qualified lawyer.
            </motion.p>
            
            <motion.div variants={fadeUpVars} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleProtectedAction('/citizen/ask-ai')}
                className="group w-full sm:w-auto px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold text-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                Explore NyayaAI <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.a 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="#how-it-works"
                className="w-full sm:w-auto px-8 py-4 bg-white/50 dark:bg-zinc-900/50 backdrop-blur border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-2xl font-bold text-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-center"
              >
                How It Works
              </motion.a>
            </motion.div>
          </motion.div>
        </section>

        {/* ================= INTERACTIVE PREVIEW ================= */}
        <section className="max-w-5xl mx-auto px-6 mb-24">
          <motion.div 
            style={{ y: heroVisualY }}
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-[2rem] border border-zinc-200/80 dark:border-zinc-800/80 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl shadow-2xl overflow-hidden group"
          >
            {/* Browser Header */}
            <div className="h-12 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/50 dark:bg-zinc-950/50 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/80 transition-colors hover:bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400/80 transition-colors hover:bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-400/80 transition-colors hover:bg-green-500"></div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-zinc-900/50 rounded-md text-xs text-zinc-500 dark:text-zinc-400 font-medium font-mono">
                  <Scale className="w-3 h-3" />
                  nyaya-ai.com/preview
                </div>
              </div>
            </div>

            {/* Dashboard Mockup Content */}
            <div className="p-8">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex justify-between items-start mb-8"
              >
                <div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Interactive Preview</h3>
                  <p className="text-zinc-500 dark:text-zinc-400">Tell us what happened. This is a sample analysis.</p>
                </div>
                <div className="px-3 py-1 bg-black text-white dark:bg-white dark:text-black rounded-full text-xs font-bold uppercase tracking-wider">
                  Demo
                </div>
              </motion.div>

              {/* Chat Input Mockup */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.99 }}
                className="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm group-hover:border-indigo-500/50 transition-colors cursor-pointer"
                onClick={() => handleProtectedAction('/citizen/ask-ai')}
              >
                <p className="text-zinc-900 dark:text-white text-lg font-medium mb-4">
                  "My landlord has refused to return my security deposit after I vacated the apartment last month."
                </p>
                <div className="flex justify-end">
                  <button className="px-6 py-2.5 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl font-bold flex items-center shadow-md shadow-black/20 dark:shadow-white/20 transition-all">
                    Analyze Situation <Search className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </motion.div>

              {/* Fake AI Response Cards */}
              <motion.div 
                initial={{ opacity: 0, filter: 'blur(10px)' }}
                whileInView={{ opacity: 0.5, filter: 'blur(0px)' }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700"
              >
                <div className="p-5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-zinc-900 dark:text-white mb-2 flex items-center"><Shield className="w-4 h-4 mr-2 text-teal-500" /> Possible Legal Area</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Property Law, Rent Control Act, Consumer Protection</p>
                </div>
                <div className="p-5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-zinc-900 dark:text-white mb-2 flex items-center"><BookOpen className="w-4 h-4 mr-2 text-indigo-500" /> What You Should Know</h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Security deposits are legally required to be refunded within the stipulated agreement period...</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="mt-8 text-center"
              >
                <p className="text-zinc-500 dark:text-zinc-400 mb-4">Want to analyze your own situation?</p>
                <button 
                  onClick={() => handleProtectedAction('/citizen/ask-ai')}
                  className="px-6 py-2 border-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white font-bold rounded-lg hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 transition-colors"
                >
                  Sign in to Continue
                </button>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ================= FEATURE SHOWCASE ================= */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-6 mb-24 relative">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-zinc-900 dark:text-white mb-4">The Civilian Legal AI Workspace</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto">Everything you need to understand your situation and organize your case before speaking to a lawyer.</p>
          </motion.div>

          <motion.div 
            style={{ y: featuresY }}
            variants={staggerContainerVars}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, idx) => (
              <motion.div 
                variants={cardVars}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={idx}
                onClick={() => handleProtectedAction(feature.route)}
                className="group p-8 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-3xl hover:bg-white dark:hover:bg-zinc-900 transition-all cursor-pointer shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.03)] hover:border-indigo-500/30 dark:hover:border-indigo-400/30"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 transition-transform duration-300">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 flex items-center transition-colors">
                  {feature.title} <ChevronRight className="w-5 h-5 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-indigo-500" />
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ================= PROJECT & TEAM SECTION ================= */}
        <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 flex flex-col items-center">
          
          {/* Ambient Seamless Background Glow - subtle gradient sweep */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-zinc-50/0 to-transparent dark:from-indigo-500/10 opacity-60 pointer-events-none" style={{ animation: 'dev-ambient-glow 15s ease-in-out infinite' }} />
          {/* Base section gradient fading into footer */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-white dark:to-zinc-950 pointer-events-none"></div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
            }}
            className="relative z-10 w-full flex flex-col items-center"
          >
            {/* Heading Area */}
            <motion.div variants={fadeUpVars} className="text-center mb-16 relative">
              <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter mb-6 leading-tight">
                BUILT BY HUMANS.<br className="hidden md:block" /> 
                <span className="text-transparent bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-500 dark:from-indigo-400 dark:via-blue-400 dark:to-teal-300 bg-clip-text">POWERED BY INTELLIGENCE.</span>
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto text-lg font-medium">
                Designed, trained and engineered to make legal intelligence more accessible.
              </p>
            </motion.div>

            {/* Cards Grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              
              {/* VIVEK */}
              <DeveloperCard 
                name="Vivek"
                alias="PANTHER OP"
                role="UI & AI DEVELOPER"
                glowColor="indigo"
              />

              {/* SUHAS */}
              <DeveloperCard 
                name="Suhas"
                alias="MUNNA"
                role="UX & AI TRAINER"
                glowColor="teal"
              />

              {/* PREETHAM */}
              <DeveloperCard 
                name="Preetham"
                alias="PANDU"
                role="AI PROMPT ENGINEER"
                glowColor="purple"
              />

            </div>
          </motion.div>
        </section>

      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-zinc-200/60 dark:border-zinc-900 bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-black py-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-zinc-900 dark:text-white" strokeWidth={2.5} />
            <span className="font-bold text-zinc-900 dark:text-white tracking-tight">NYAYA-AI</span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-2xl">
            Disclaimer: NyayaAI provides general legal information and AI-assisted analysis. It is not a substitute for advice from a qualified advocate or legal professional.
          </p>
          <div className="text-sm font-medium text-zinc-400">
            © {new Date().getFullYear()} NyayaAI.
          </div>
        </motion.div>
      </footer>
    </div>
  );
}

// ----------------------------------------------------
// DEVELOPER CARD COMPONENT (WITH MOUSE PARALLAX)
// ----------------------------------------------------

interface DeveloperCardProps {
  name: string;
  alias: string;
  role: string;
  glowColor: 'indigo' | 'teal' | 'purple';
}

function DeveloperCard({ name, alias, role, glowColor }: DeveloperCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Very subtle parallax movement for inner elements
  const xOffset = useTransform(mouseX, [-0.5, 0.5], [-6, 6]);
  const yOffset = useTransform(mouseY, [-0.5, 0.5], [-6, 6]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Maps for dynamic colors
  const glowMaps = {
    indigo: 'from-indigo-50/50 via-white to-indigo-500/5 dark:from-indigo-500/0 dark:via-indigo-500/10 dark:to-indigo-500/30',
    teal: 'from-cyan-50/50 via-white to-cyan-500/5 dark:from-cyan-500/0 dark:via-cyan-500/10 dark:to-cyan-500/30',
    purple: 'from-violet-50/50 via-white to-violet-500/5 dark:from-violet-500/0 dark:via-violet-500/10 dark:to-violet-500/30',
  };
  
  const ringMaps = {
    indigo: 'border-indigo-400/30 dark:border-indigo-400/50',
    teal: 'border-cyan-400/30 dark:border-teal-400/50',
    purple: 'border-violet-400/30 dark:border-purple-400/50',
  };

  const nodeMaps = {
    indigo: 'bg-indigo-500 dark:bg-indigo-400',
    teal: 'bg-cyan-500 dark:bg-teal-400',
    purple: 'bg-violet-500 dark:bg-purple-400',
  };

  const textHoverMaps = {
    indigo: 'group-hover/devcard:text-indigo-600 dark:group-hover/devcard:text-indigo-300',
    teal: 'group-hover/devcard:text-teal-600 dark:group-hover/devcard:text-teal-300',
    purple: 'group-hover/devcard:text-purple-600 dark:group-hover/devcard:text-purple-300',
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40, scale: 0.97, filter: 'blur(8px)' },
        visible: { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          filter: 'blur(0px)',
          transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="group/devcard relative w-full rounded-[24px] bg-white/90 dark:bg-zinc-950/40 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-black/40 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-black/60 overflow-hidden cursor-default transition-all duration-500"
    >
      {/* Base ambient lighting */}
      <div className={`absolute inset-0 bg-gradient-to-br ${glowMaps[glowColor]} opacity-70 transition-opacity duration-700 ease-bounce-sm group-hover/devcard:opacity-100 pointer-events-none`} />
      
      {/* Top subtle highlight border for 3D effect */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-zinc-100 dark:via-white/10 to-transparent"></div>

      <motion.div 
        style={{ x: xOffset, y: yOffset }}
        className="relative z-10 p-8 flex flex-col items-center h-full"
      >
        
        {/* Futuristic Tech Orb */}
        <div className="relative w-16 h-16 mb-8 flex items-center justify-center">
          {/* Static minimal track */}
          <div className="absolute inset-0 rounded-full border border-zinc-200/60 dark:border-zinc-800/60" />
          
          {/* Animated concentric rings */}
          <div className={`absolute inset-1 rounded-full border-t border-r ${ringMaps[glowColor]} opacity-30 group-hover/devcard:opacity-100 transition-opacity duration-700`} style={{ animation: 'rotate-slow 12s linear infinite' }} />
          <div className={`absolute inset-3 rounded-full border-b border-l ${ringMaps[glowColor]} opacity-20 group-hover/devcard:opacity-80 transition-opacity duration-700`} style={{ animation: 'rotate-slow 18s linear infinite reverse' }} />
          
          {/* Glowing central node */}
          <div className={`w-1.5 h-1.5 rounded-full ${nodeMaps[glowColor]} shadow-[0_0_12px_currentColor] group-hover/devcard:scale-[1.7] transition-all duration-700 ease-bounce-sm`}></div>
        </div>

        {/* Content */}
        <div className="text-center mt-auto">
          <h3 className={`text-2xl font-black text-zinc-900 dark:text-white tracking-tight mb-1 transition-colors duration-500 ${textHoverMaps[glowColor]}`}>
            {name}
          </h3>
          <p className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-[0.25em] mb-4">
            {alias}
          </p>
          <div className="h-px w-6 bg-zinc-300 dark:bg-zinc-700 mx-auto mb-4 group-hover/devcard:w-12 transition-all duration-700 ease-bounce-sm"></div>
          <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest leading-relaxed">
            {role}
          </p>
        </div>

      </motion.div>
    </motion.div>
  );
}

const features = [
  {
    icon: Search,
    title: "AI Legal Analysis",
    desc: "Explain what happened in normal language. NyayaAI identifies possible legal areas and explains the situation simply.",
    route: '/citizen/ask-ai'
  },
  {
    icon: BookOpen,
    title: "Relevant Judgments",
    desc: "Find potentially relevant judgments and legal sources to help understand how courts have ruled.",
    route: '/citizen/judgments'
  },
  {
    icon: Shield,
    title: "Know Your Rights",
    desc: "Understand your potentially relevant rights and available actions in clear, jargon-free language.",
    route: '/citizen/ask-ai'
  },
  {
    icon: FileText,
    title: "Document Intelligence",
    desc: "Upload PDFs, DOCX files, and images. NyayaAI extracts and analyzes the contents instantly.",
    route: '/citizen/documents'
  },
  {
    icon: MessageSquare,
    title: "AI Draft Generator",
    desc: "Generate structured drafts like complaints and notices based on your specific situation.",
    route: '/citizen/drafts'
  },
  {
    icon: Clock,
    title: "Case Timeline",
    desc: "Extract important dates and organize events chronologically from your uploaded documents.",
    route: '/citizen/timeline'
  }
];
