import { create } from 'zustand';

interface AuthGateState {
  isOpen: boolean;
  returnTo: string;
  defaultMode: 'login' | 'signup';
  openAuthGate: (returnTo?: string, mode?: 'login' | 'signup') => void;
  closeAuthGate: () => void;
}

export const useAuthGateStore = create<AuthGateState>((set) => ({
  isOpen: false,
  returnTo: '/citizen/dashboard',
  defaultMode: 'login',
  openAuthGate: (returnTo = '/citizen/dashboard', defaultMode = 'login') => set({ isOpen: true, returnTo, defaultMode }),
  closeAuthGate: () => set({ isOpen: false }),
}));
