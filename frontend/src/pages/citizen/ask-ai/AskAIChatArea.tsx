import React, { useRef, useEffect } from 'react';
import { useAskAIStore } from '../../../store/askAIStore';
import { Bot, User, Loader2, Search, FileText, Calendar, ShieldAlert, Paperclip, X, Send } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const AskAIChatArea: React.FC = () => {
  const { 
    messages, 
    input, 
    setInput, 
    loading, 
    error, 
    attachments, 
    handleSend, 
    handleFileUpload, 
    removeAttachment 
  } = useAskAIStore();
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const getToolIcon = (toolName: string) => {
    if (toolName.includes('Document')) return <FileText className="h-3 w-3 mr-1" />;
    if (toolName.includes('Case')) return <Search className="h-3 w-3 mr-1" />;
    if (toolName.includes('Timeline')) return <Calendar className="h-3 w-3 mr-1" />;
    return <ShieldAlert className="h-3 w-3 mr-1" />;
  };

  const formatText = (text: string) => {
    const lines = text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="text-zinc-900 dark:text-white font-semibold">{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      return <p key={i} className="mb-2 last:mb-0">{renderedParts}</p>;
    });
    return <>{lines}</>;
  };

  const suggestions = [
    "Explain my case in simple language",
    "Analyze my uploaded notice",
    "What deadlines should I know about?",
    "Draft a response to this notice"
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Chat Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              {/* Avatar */}
              <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-1 shadow-sm ${
                msg.role === 'user' ? 'bg-indigo-600 ml-3' : 'bg-white dark:bg-zinc-800 mr-3 border border-zinc-200 dark:border-zinc-700'
              }`}>
                {msg.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />}
              </div>

              {/* Message Bubble */}
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Tool Badges */}
                {msg.tools && msg.tools.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {msg.tools.map((t, i) => (
                      <div key={i} className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-2 py-1 rounded-md text-[10px] text-teal-600 dark:text-teal-400 uppercase tracking-wider font-medium shadow-sm">
                        {getToolIcon(t.tool_name)}
                        {t.tool_name}
                      </div>
                    ))}
                  </div>
                )}

                <div className={`p-4 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-sm' 
                    : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 rounded-tl-sm'
                }`}>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b border-indigo-400/30">
                      {msg.attachments.map((att, i) => (
                        <div key={i} className="flex items-center text-xs bg-indigo-900/50 px-2 py-1 rounded text-white">
                          <FileText className="h-3 w-3 mr-1" />
                          {att.file.name}
                        </div>
                      ))}
                    </div>
                  )}
                  {formatText(msg.content)}
                </div>
                
                {/* Actions */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1 items-start w-full">
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold">Suggested Actions:</span>
                    <ul className="list-disc pl-4 text-xs text-zinc-700 dark:text-zinc-300">
                      {msg.actions.map((action, i) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1 items-start w-full">
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold">Sources:</span>
                    {msg.sources.map((s, i) => (
                      <span key={i} className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900/80 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-800">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Disclaimer */}
                {msg.disclaimer && (
                  <div className="mt-3 text-[10px] text-zinc-500 dark:text-zinc-600 max-w-sm italic">
                    {msg.disclaimer}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex flex-row max-w-[80%]">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-white dark:bg-zinc-800 mr-3 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mt-1 shadow-sm">
                <Bot className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-tl-sm flex items-center shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Thinking...
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm flex items-center justify-center">
            <ShieldAlert className="h-4 w-4 mr-2" /> {error}
          </div>
        )}
        
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 rounded-b-xl">
        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.map((s, i) => (
              <button 
                key={i} 
                onClick={() => handleSend(s)}
                className="text-xs bg-zinc-50 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-600 dark:hover:text-indigo-300 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-full transition-colors shadow-sm"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((att, idx) => (
              <div key={idx} className={`flex items-center border rounded-md px-3 py-1.5 text-xs ${
                  att.status === 'error' ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400' :
                  att.status === 'uploading' ? 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400' :
                  'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
              }`}>
                {att.status === 'uploading' ? (
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                ) : att.status === 'error' ? (
                    <ShieldAlert className="h-3 w-3 mr-2" />
                ) : (
                    <FileText className="h-3 w-3 mr-2" />
                )}
                <span className="truncate max-w-[250px] font-medium mr-2" title={att.error}>
                    {att.status === 'uploading' ? 'Processing...' : att.status === 'error' ? `Failed: ${att.error}` : att.file.name}
                </span>
                
                {att.status === 'ready' && <span className="mr-2 text-green-600 dark:text-green-400">✓ Ready</span>}
                
                <button 
                  onClick={() => removeAttachment(idx)}
                  className="ml-auto text-current opacity-70 hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex gap-2 relative">
          <input 
            type="file" 
            multiple 
            className="hidden" 
            ref={fileInputRef}
            accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileUpload(e.target.files);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-xl transition-colors flex items-center justify-center shadow-sm"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask NYAYA-AI about your legal situation..."
            className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-sm"
            disabled={loading}
          />
          <Button 
            onClick={() => handleSend()} 
            disabled={loading || (!input.trim() && attachments.length === 0)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-auto px-5 shadow-md shadow-indigo-500/20"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
