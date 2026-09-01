import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { getApiUrl, formatApiError, fetchWithTimeout } from '../../../lib/api';

export type ToolUsed = { tool_name: string, result_summary: string };
export type AttachmentInfo = { file: File, id?: string, status: 'uploading' | 'ready' | 'error', error?: string };
export type Message = { 
  id: string; 
  role: 'user' | 'assistant'; 
  content: string; 
  tools?: ToolUsed[]; 
  sources?: string[]; 
  actions?: string[]; 
  disclaimer?: string; 
  attachments?: AttachmentInfo[]; 
};

export type AskAIMode = 'embedded' | 'popout';

interface AskAIContextType {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  loading: boolean;
  error: string | null;
  attachments: AttachmentInfo[];
  conversationId: string | null;
  mode: AskAIMode;
  setMode: (mode: AskAIMode) => void;
  isMaximized: boolean;
  toggleMaximize: () => void;
  handleSend: (text?: string) => Promise<void>;
  handleFileUpload: (files: FileList) => Promise<void>;
  startNewChat: () => void;
  removeAttachment: (index: number) => void;
}

const AskAIContext = createContext<AskAIContextType | undefined>(undefined);

export const useAskAI = () => {
  const context = useContext(AskAIContext);
  if (!context) {
    throw new Error('useAskAI must be used within an AskAIProvider');
  }
  return context;
};

export const AskAIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { token } = useAuthStore();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello. I am NYAYA-AI, your legal assistant. How can I help you understand your legal situation today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(location.state?.conversationId || null);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<AttachmentInfo[]>([]);
  
  const [mode, setMode] = useState<AskAIMode>('embedded');
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (conversationId && messages.length === 1 && messages[0].id === 'welcome') {
      const loadHistory = async () => {
        try {
          setLoading(true);
          const res = await fetchWithTimeout(getApiUrl(`/api/ai/conversations/${conversationId}`), {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.conversation && data.conversation.messages) {
              const loadedMsgs = data.conversation.messages.map((m: any, i: number) => ({
                id: `hist-${i}`,
                role: m.role,
                content: m.content
              }));
              setMessages(loadedMsgs);
            }
          }
        } catch (err) {
          console.error("Failed to load conversation", err);
        } finally {
          setLoading(false);
        }
      };
      loadHistory();
    }
  }, [conversationId, token]);

  const startNewChat = () => {
    setConversationId(null);
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: 'Hello. I am NYAYA-AI, your legal assistant. How can I help you understand your legal situation today?'
    }]);
    setAttachments([]);
    setError(null);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async (text: string = input) => {
    const readyAttachments = attachments.filter(a => a.status === 'ready');
    if ((!text.trim() && readyAttachments.length === 0) || loading) return;
    
    if (attachments.some(a => a.status === 'uploading')) {
        setError("Please wait for all documents to finish processing.");
        return;
    }
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, attachments: [...readyAttachments] };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachments([]);
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('message', text || "Analyze attached documents");
      if (conversationId) formData.append('conversation_id', conversationId);
      
      if (readyAttachments.length > 0 && readyAttachments[0].id) {
          formData.append('document_id', readyAttachments[0].id);
      }

      const response = await fetchWithTimeout(getApiUrl('/api/ai/chat'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      }, 90000);
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }
      
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: data.message || "I couldn't generate a response.",
        tools: data.intent && data.intent !== 'unknown' ? [{tool_name: data.intent.replace(/_/g, ' '), result_summary: 'Intent classified'}] : undefined,
        sources: data.sources,
        actions: data.actions,
        disclaimer: data.disclaimer
      };
      
      setMessages(prev => [...prev, aiMsg]);
      
    } catch (err: any) {
      console.error("AskAI Fetch Error:", err);
      setError(formatApiError(err, 'Unable to get AI response. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    const newFiles = Array.from(files);
    if (attachments.length + newFiles.length > 5) {
      setError("Maximum 5 files allowed");
      return;
    }
    const oversized = newFiles.find(f => f.size > 10 * 1024 * 1024);
    if (oversized) {
      setError("Each file must be under 10MB");
      return;
    }

    const newAttachments: AttachmentInfo[] = newFiles.map(file => ({ file, status: 'uploading' }));
    setAttachments(prev => [...prev, ...newAttachments]);
    setError(null);

    for (const att of newAttachments) {
      try {
        const formData = new FormData();
        formData.append('file', att.file);
        if (conversationId) formData.append('conversation_id', conversationId);

        const response = await fetchWithTimeout(getApiUrl('/api/ai/upload'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }, 90000);

        const data = await response.json();

        if (data.error || !response.ok) {
            let errorMsg = data.error || 'Upload failed';
            if (!data.error && data.detail) {
                errorMsg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
            }
            throw new Error(errorMsg);
        }

        if (data.conversation_id && !conversationId) {
            setConversationId(data.conversation_id);
        }

        setAttachments(prev => prev.map(a => 
            a.file === att.file ? { ...a, status: 'ready', id: data.document_id } : a
        ));

      } catch (err: any) {
        console.error("Upload error:", err);
        setAttachments(prev => prev.map(a => 
            a.file === att.file ? { ...a, status: 'error', error: formatApiError(err, 'Upload failed') } : a
        ));
      }
    }
  };

  const toggleMaximize = () => setIsMaximized(prev => !prev);

  return (
    <AskAIContext.Provider value={{
      messages,
      input,
      setInput,
      loading,
      error,
      attachments,
      conversationId,
      mode,
      setMode,
      isMaximized,
      toggleMaximize,
      handleSend,
      handleFileUpload,
      startNewChat,
      removeAttachment
    }}>
      {children}
    </AskAIContext.Provider>
  );
};
