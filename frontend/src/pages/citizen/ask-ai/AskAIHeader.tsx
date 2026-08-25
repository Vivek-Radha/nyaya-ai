import React from 'react';
import { useAskAIStore } from '../../../store/askAIStore';
import { Bot, Plus, Maximize2, Minimize2, ExternalLink, ArrowRightToLine } from 'lucide-react';

export const AskAIHeader: React.FC<{ onPointerDown?: (e: React.PointerEvent) => void }> = ({ onPointerDown }) => {
  const { startNewChat, mode, setMode, isMaximized, toggleMaximize } = useAskAIStore();

  return (
    <div 
      onPointerDown={onPointerDown}
      className={`bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between rounded-t-xl z-10 relative ${onPointerDown ? 'cursor-move select-none touch-none' : ''}`}
    >
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center">
          <Bot className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400" /> Ask AI
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Powered by NYAYA-AI Legal Agent</p>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={startNewChat}
          className="flex items-center text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-lg transition-colors border border-zinc-200 dark:border-zinc-700 shadow-sm"
          title="New Chat"
        >
          <Plus className="h-3.5 w-3.5 sm:mr-1.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        {mode === 'embedded' ? (
          <button
            onClick={() => setMode('popout')}
            className="flex items-center justify-center h-8 w-8 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
            title="Pop out Ask AI"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        ) : (
          <>
            <button
              onClick={toggleMaximize}
              className="flex items-center justify-center h-8 w-8 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
              title={isMaximized ? "Restore" : "Expand"}
            >
              {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={() => {
                if (isMaximized) toggleMaximize();
                setMode('embedded');
              }}
              className="flex items-center justify-center h-8 w-8 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
              title="Return to Ask AI"
            >
              <ArrowRightToLine className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
