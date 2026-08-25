import { useState, useEffect } from 'react';

import { DashboardLayout } from '../../layouts/DashboardLayout';
import { MessageSquare, Briefcase, ArrowRight, ShieldAlert, Zap, Scale, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { InteractiveScale } from '../../components/InteractiveScale';
import { useAuthStore } from '../../store/authStore';
import { useAskAIStore } from '../../store/askAIStore';
import { motion, AnimatePresence } from 'framer-motion';
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal';

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Delete feature state
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [chatToDeleteName, setChatToDeleteName] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const { conversationId: activeChatId, reset: resetActiveChat } = useAskAIStore();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
        const res = await fetch(`${baseUrl}/api/ai/conversations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations || []);
        }
      } catch (err) {
        console.error("Failed to fetch conversations", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [token]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleDeleteChat = async (): Promise<boolean> => {
    if (!chatToDelete) return false;
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${baseUrl}/api/ai/conversations/${chatToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setConversations(prev => prev.filter(c => c.conversation_id !== chatToDelete));
        setToast({ message: 'Conversation deleted.', type: 'success' });
        
        // Reset active chat if the deleted one is currently open
        if (activeChatId === chatToDelete) {
          resetActiveChat();
        }
        return true;
      } else {
        throw new Error('Deletion failed');
      }
    } catch (err) {
      console.error(err);
      setToast({ message: 'Unable to delete conversation. Please try again.', type: 'error' });
      return false;
    }
  };

  // ANIMATION VARIANTS
  const containerVars = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const cardVars = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  const textPopVars = {
    hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: { type: "spring", damping: 25, stiffness: 100, duration: 0.8 } 
    }
  };

  return (
    <DashboardLayout>
      <motion.div 
        variants={containerVars}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-8rem)] pb-6 grid-rows-[auto_minmax(0,1fr)] min-h-0"
      >
        
        {/* Main Hero Card */}
        <motion.div variants={cardVars} className="md:col-span-3 rounded-3xl p-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-sm z-0"></div>
          
          <div className="relative z-10 flex h-full items-center justify-between">
            <div className="max-w-2xl flex flex-col justify-center h-full py-2">
              <motion.div variants={textPopVars} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 text-xs font-semibold mb-4 border border-teal-200 dark:border-teal-500/20 uppercase tracking-wider w-max">
                <Zap className="w-3 h-3" /> GenZ Law OS Active
              </motion.div>
              <motion.h2 variants={textPopVars} className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight text-transparent bg-gradient-to-r from-indigo-600 to-teal-500 dark:from-indigo-500 dark:to-teal-400 bg-clip-text leading-tight">
                Welcome back. Let's conquer your case.
              </motion.h2>
              <motion.p variants={textPopVars} className="text-zinc-600 dark:text-indigo-200/80 text-base sm:text-lg font-medium leading-relaxed mb-6 max-w-xl">
                Understand your legal standing, draft smart notices, and get real-time guidance powered by next-gen AI.
              </motion.p>
              <motion.div variants={textPopVars} className="flex flex-wrap gap-4 mt-auto">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button onClick={() => navigate('/citizen/ask-ai')} className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 border-0 rounded-xl px-8 shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-shadow hover:shadow-xl">
                    <MessageSquare className="mr-2 h-4 w-4" /> Ask AI Now
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button onClick={() => navigate('/citizen/cases')} variant="outline" className="border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl px-8 backdrop-blur-md transition-colors">
                    <Briefcase className="mr-2 h-4 w-4" /> New Case
                  </Button>
                </motion.div>
              </motion.div>
            </div>
            
            {/* GenZ Vaporwave Interactive Scale */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, duration: 1, type: "spring" }}
              className="hidden lg:block relative w-56 h-56 mr-8"
            >
               <InteractiveScale />
            </motion.div>
          </div>
        </motion.div>

        {/* Feature / Aesthetic Card */}
        <motion.div variants={cardVars} whileHover={{ y: -4 }} className="md:col-span-1 rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl dark:shadow-2xl relative overflow-hidden group h-full min-h-0 transition-shadow hover:shadow-2xl dark:hover:shadow-indigo-500/10">
          {/* Abstract Tech Background Removed for B&W Theme */}
          
          {/* Large faded decorative icon in background */}
          <Scale className="absolute -bottom-10 -right-10 w-64 h-64 text-indigo-500 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 group-hover:scale-110 transition-all duration-700 transform rotate-12" />

          <div className="relative z-10 h-full flex flex-col justify-end p-8">
            <Scale className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-4 transform group-hover:-translate-y-1 transition-transform duration-300" />
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3 leading-tight transition-colors">Master Your Rights</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium transition-colors">Access AI-driven analysis of modern law tailored to your specific situation.</p>
          </div>
        </motion.div>

        {/* Recent Cases List */}
        <motion.div variants={cardVars} className="md:col-span-2 rounded-3xl p-6 bg-white dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 shadow-lg flex flex-col h-full overflow-hidden min-h-0">
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-indigo-500" /> Recent Activity
            </h3>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-full h-8 px-4 transition-colors">
                VIEW ALL <ArrowRight className="ml-1 h-3 w-3"/>
              </Button>
            </motion.div>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 pb-2">
            {loading ? (
              <div className="text-zinc-500 text-sm p-4 text-center">Loading recent activity...</div>
            ) : conversations.length === 0 ? (
              <div className="text-zinc-500 text-sm p-4 text-center">No recent chats yet. Start a new one!</div>
            ) : (
              conversations.map((c, index) => {
                const firstUserMsg = c.messages?.find((m: any) => m.role === 'user');
                const title = firstUserMsg ? firstUserMsg.content : 'New Chat';
                const date = new Date(c.updated_at).toLocaleDateString();
                const displayId = c.conversation_id.substring(0, 4).toUpperCase();
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + (index * 0.05), duration: 0.4 }}
                    whileHover={{ scale: 1.01, x: 4 }}
                    whileTap={{ scale: 0.99 }}
                    key={c.conversation_id} 
                    onClick={() => navigate('/citizen/ask-ai', { state: { conversationId: c.conversation_id } })}
                    className="group relative bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800/50 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors hover:shadow-md cursor-pointer overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-900 dark:bg-white transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300"></div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 overflow-hidden w-full pr-4">
                        <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xs tracking-wider shadow-inner transition-colors group-hover:bg-indigo-200 dark:group-hover:bg-indigo-500/20">
                          {displayId}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-zinc-900 dark:text-zinc-100 font-semibold mb-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{title}</h4>
                          <p className="text-xs text-zinc-500 font-medium">{date} • {c.conversation_id.substring(0, 8)}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setChatToDelete(c.conversation_id);
                              setChatToDeleteName(title);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete Conversation"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400 transition-colors group-hover:bg-teal-200 dark:group-hover:bg-teal-500/20">
                            ACTIVE
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

      </motion.div>

      <DeleteConfirmationModal
        isOpen={!!chatToDelete}
        onClose={() => setChatToDelete(null)}
        onConfirm={handleDeleteChat}
        title="Delete this conversation?"
        description="This action cannot be undone."
        itemType="chat"
        itemName={chatToDeleteName}
      />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={`fixed bottom-6 left-1/2 z-50 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold flex items-center gap-2 ${
              toast.type === 'success' 
                ? 'bg-zinc-900 text-white border-zinc-800 dark:bg-white dark:text-zinc-900' 
                : 'bg-red-600 text-white border-red-700'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
