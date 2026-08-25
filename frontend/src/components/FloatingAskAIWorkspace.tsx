import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PopoutAskAI } from '../pages/citizen/ask-ai/PopoutAskAI';
import { useAskAIStore } from '../store/askAIStore';
import { useAuthStore } from '../store/authStore';

export const FloatingAskAIWorkspace: React.FC = () => {
  const location = useLocation();
  const { mode, setMode, reset } = useAskAIStore();
  const { user } = useAuthStore();

  // Define routes where the floating Ask AI should NOT be shown
  const excludedRoutes = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/citizen/profile',
    '/lawyer/dashboard',
    '/admin/dashboard'
  ];

  const isExcluded = excludedRoutes.includes(location.pathname);

  useEffect(() => {
    if (!user) {
      reset(); // completely reset state (which also sets mode='embedded') on logout
    } else {
      // Check if this user has ever seen the initial popup
      const userId = user.id;
      const key = `askAIState_${userId}`;
      const hasSeen = localStorage.getItem(key);
      
      if (!hasSeen && !isExcluded) {
        setMode('popout'); // Automatically open for first-time user
        localStorage.setItem(key, 'true'); // Remember they've seen it
      } else if (isExcluded && mode === 'popout') {
        setMode('embedded'); // just hide it if they navigate to an excluded route
      }
    }
  }, [user, isExcluded, mode, setMode, reset]);

  // Do not early return on `mode !== 'popout'` so AnimatePresence inside PopoutAskAI can play the exit animation
  if (isExcluded) return null;

  return <PopoutAskAI />;
};
