import { create } from 'zustand'

interface User {
  id: string;
  email: string;
  role: string;
  full_name?: string;
}

interface AuthState {
  user: User | null;
  role: 'citizen' | 'lawyer' | 'admin' | null;
  loading: boolean;
  token: string | null;
  setUser: (user: User | null) => void;
  setRole: (role: 'citizen' | 'lawyer' | 'admin' | null) => void;
  setToken: (token: string | null) => void;
  initialize: () => Promise<void>;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  token: localStorage.getItem('token'),
  loading: true,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setToken: (token) => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    set({ token });
  },
  initialize: async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Decode token or fetch user profile from backend
        // For simplicity, we just extract from token payload (not fully secure, but ok for now)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user = { id: payload.sub, email: payload.email, role: payload.role, full_name: payload.full_name };
        set({ user, role: payload.role as 'citizen' | 'lawyer' | 'admin' });
      } else {
        set({ user: null, role: null });
      }
    } catch (error) {
      console.error("Auth init error", error)
      localStorage.removeItem('token');
      set({ user: null, role: null, token: null });
    } finally {
      set({ loading: false })
    }
  },
  signOut: () => {
    localStorage.removeItem('token');
    set({ user: null, role: null, token: null });
  }
}))
