import { create } from 'zustand';
import { useAuthStore } from './authStore';

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

interface AskAIState {
  // Chat State
  messages: Message[];
  input: string;
  loading: boolean;
  error: string | null;
  attachments: AttachmentInfo[];
  conversationId: string | null;
  
  // UI State
  mode: AskAIMode;
  isMaximized: boolean;
  
  // Floating Panel State
  position: { x: number, y: number };
  dimensions: { width: number, height: number };

  // Actions
  setInput: (value: string) => void;
  setMode: (mode: AskAIMode) => void;
  toggleMaximize: () => void;
  setPosition: (pos: { x: number, y: number }) => void;
  setDimensions: (dim: { width: number, height: number }) => void;
  reset: () => void;
  
  // Complex Actions
  handleSend: (text?: string) => Promise<void>;
  handleFileUpload: (files: FileList) => Promise<void>;
  startNewChat: () => void;
  removeAttachment: (index: number) => void;
}

export const useAskAIStore = create<AskAIState>((set, get) => ({
  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello. I am NYAYA-AI, your legal assistant. How can I help you understand your legal situation today?'
    }
  ],
  input: '',
  loading: false,
  error: null,
  attachments: [],
  conversationId: null,
  
  mode: 'embedded',
  isMaximized: false,
  
  position: { x: 24, y: 24 },
  dimensions: { width: 420, height: 600 },

  setInput: (value) => set({ input: value }),
  setMode: (mode) => set({ mode }),
  toggleMaximize: () => set((state) => ({ isMaximized: !state.isMaximized })),
  setPosition: (pos) => set({ position: pos }),
  setDimensions: (dim) => set({ dimensions: dim }),
  
  reset: () => set({
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Hello. I am NYAYA-AI, your legal assistant. How can I help you understand your legal situation today?'
      }
    ],
    input: '',
    loading: false,
    error: null,
    attachments: [],
    conversationId: null,
    mode: 'embedded',
    isMaximized: false,
    position: { x: 24, y: 24 },
    dimensions: { width: 420, height: 600 }
  }),
  
  startNewChat: () => {
    set({
      conversationId: null,
      messages: [{
        id: 'welcome',
        role: 'assistant',
        content: 'Hello. I am NYAYA-AI, your legal assistant. How can I help you understand your legal situation today?'
      }],
      attachments: [],
      error: null
    });
  },

  removeAttachment: (index) => {
    set((state) => ({
      attachments: state.attachments.filter((_, i) => i !== index)
    }));
  },

  handleSend: async (textOverride?: string) => {
    const { input, attachments, loading, conversationId } = get();
    const token = useAuthStore.getState().token;
    const text = textOverride ?? input;
    
    const readyAttachments = attachments.filter(a => a.status === 'ready');
    if ((!text.trim() && readyAttachments.length === 0) || loading) return;
    
    if (attachments.some(a => a.status === 'uploading')) {
        set({ error: "Please wait for all documents to finish processing." });
        return;
    }
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, attachments: [...readyAttachments] };
    
    set((state) => ({
      messages: [...state.messages, userMsg],
      input: '',
      attachments: [],
      loading: true,
      error: null
    }));
    
    try {
      const formData = new FormData();
      formData.append('message', text || "Analyze attached documents");
      if (conversationId) formData.append('conversation_id', conversationId);
      
      if (readyAttachments.length > 0 && readyAttachments[0].id) {
          formData.append('document_id', readyAttachments[0].id);
      }

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${baseUrl}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.conversation_id && !get().conversationId) {
        set({ conversationId: data.conversation_id });
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
      
      set((state) => ({ messages: [...state.messages, aiMsg] }));
      
    } catch (err: any) {
      console.error("AskAI Fetch Error:", err);
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        set({ error: 'Unable to connect to the NyayaAI server. The server might be down, or the document is too large.' });
      } else {
        set({ error: err.message || 'An unexpected error occurred.' });
      }
    } finally {
      set({ loading: false });
    }
  },

  handleFileUpload: async (files: FileList) => {
    const { attachments } = get();
    const token = useAuthStore.getState().token;
    
    const newFiles = Array.from(files);
    if (attachments.length + newFiles.length > 5) {
      set({ error: "Maximum 5 files allowed" });
      return;
    }
    const oversized = newFiles.find(f => f.size > 10 * 1024 * 1024);
    if (oversized) {
      set({ error: "Each file must be under 10MB" });
      return;
    }

    const newAttachments: AttachmentInfo[] = newFiles.map(file => ({ file, status: 'uploading' }));
    set((state) => ({ 
      attachments: [...state.attachments, ...newAttachments],
      error: null
    }));

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

    for (const att of newAttachments) {
      try {
        const formData = new FormData();
        formData.append('file', att.file);
        // Ensure we fetch the most recent conversationId in the loop in case it updated
        const currentConversationId = get().conversationId;
        if (currentConversationId) formData.append('conversation_id', currentConversationId);

        const response = await fetch(`${baseUrl}/api/ai/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();

        if (data.error || !response.ok) {
            let errorMsg = data.error || 'Upload failed';
            if (!data.error && data.detail) {
                errorMsg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
            }
            throw new Error(errorMsg);
        }

        if (data.conversation_id && !get().conversationId) {
            set({ conversationId: data.conversation_id });
        }

        set((state) => ({
          attachments: state.attachments.map(a => 
            a.file === att.file ? { ...a, status: 'ready', id: data.document_id } : a
          )
        }));

      } catch (err: any) {
        console.error("Upload error:", err);
        set((state) => ({
          attachments: state.attachments.map(a => 
            a.file === att.file ? { ...a, status: 'error', error: err.message } : a
          )
        }));
      }
    }
  }
}));
