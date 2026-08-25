import React from 'react';
import { useAskAIStore } from '../../../store/askAIStore';
import { AskAIHeader } from './AskAIHeader';
import { AskAIChatArea } from './AskAIChatArea';
import { ExternalLink, ArrowRightToLine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const EmbeddedAskAI: React.FC = () => {
  const { mode, setMode } = useAskAIStore();

  return (
    <div className="flex flex-col h-full min-h-0 bg-white/50 dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative shadow-sm">
      <AskAIHeader />
      
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence initial={false}>
          {mode === 'embedded' ? (
            <motion.div
              key="embedded-chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute inset-0 flex flex-col"
            >
              <AskAIChatArea />
            </motion.div>
          ) : (
            <motion.div
              key="popout-placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 p-6 text-center"
            >
              <div className="h-16 w-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                <ExternalLink className="h-8 w-8 text-indigo-500" />
              </div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                Ask AI is open in a floating panel
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">
                You can continue your conversation in the pop-out workspace, or bring it back here.
              </p>
              <button
                onClick={() => setMode('embedded')}
                className="flex items-center text-sm font-medium bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors shadow-sm"
              >
                <ArrowRightToLine className="h-4 w-4 mr-2" />
                Return to Embedded View
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
