import React, { useState, useEffect } from 'react';
import { useAuthGateStore } from '../../store/authGateStore';
import { Scale, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../../store/authStore';
import { Input } from './Input';
import { Button } from './Button';

export function AuthGateModal() {
  const { isOpen, closeAuthGate, returnTo, defaultMode } = useAuthGateStore();
  const navigate = useNavigate();
  
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    console.log("Google Client ID exists:", Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID));
  }, []);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Sync mode with store when opened
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setError('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
    }
  }, [isOpen, defaultMode]);

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    console.log("Google Sign-In callback received.");
    console.log("Token received:", Boolean(credentialResponse.credential));
    
    setLoading(true);
    setError('');
    
    try {
      const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
      console.log("Backend authentication request sent to:", `${baseUrl}/api/auth/google`);
      
      const response = await fetch(`${baseUrl}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      
      console.log("Backend response received with status:", response.status);
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error("Login failure:", data.detail);
        throw new Error(data.detail || 'Google Login failed');
      }
      
      console.log("Login success! Storing JWT...");
      useAuthStore.getState().setToken(data.access_token);
      await useAuthStore.getState().initialize();
      closeAuthGate();
      navigate(returnTo, { replace: true });
    } catch (err: unknown) {
      console.error("Authentication error caught:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    }
    setLoading(false);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (!fullName) return setError('Please enter your full name.');
      if (password !== confirmPassword) return setError('Passwords do not match.');
      if (password.length < 6) return setError('Password must be at least 6 characters long.');
    }
    
    if (!email) return setError('Please enter your email address.');
    if (!password) return setError('Please enter a password.');

    setLoading(true);

    try {
      const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
      
      if (mode === 'login') {
        const response = await fetch(`${baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Login failed');
        
        useAuthStore.getState().setToken(data.access_token);
      } else {
        // Signup
        const response = await fetch(`${baseUrl}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, full_name: fullName, role: 'citizen' })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Signup failed');
        
        useAuthStore.getState().setToken(data.access_token);
      }

      await useAuthStore.getState().initialize();
      closeAuthGate();
      navigate(returnTo, { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError('Cannot connect to the server. Please ensure the backend is running.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    }
    setLoading(false);
  };

  // We do not return null here, because unmounting <GoogleLogin> causes 
  // 'google.accounts.id.initialize() is called multiple times' in the GIS SDK.
  // Instead, we keep it mounted and hide it with CSS visibility/opacity.

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity"
        onClick={closeAuthGate}
      ></div>

      {/* Modal */}
      <div className={`relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}>
        
        {/* Close button */}
        <button 
          onClick={closeAuthGate}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-teal-500 shadow-lg">
              <div className="absolute inset-0 bg-white/10 dark:bg-black/10 rounded-2xl"></div>
              <Scale className="w-7 h-7 text-white z-10" strokeWidth={2.5} />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-center text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h3>
          <p className="text-center text-zinc-500 dark:text-zinc-400 mb-8 text-sm">
            {mode === 'login' ? 'Sign in to continue to NyayaAI' : 'Create a free NyayaAI account to use AI-powered legal tools and save your progress.'}
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 p-3 rounded-xl text-sm text-center mb-6 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
                <Input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required={mode === 'signup'}
                  className="rounded-xl"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required 
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
                {mode === 'login' && (
                  <button type="button" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Forgot password?</button>
                )}
              </div>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required 
                className="rounded-xl"
              />
            </div>
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Confirm Password</label>
                <Input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required={mode === 'signup'}
                  className="rounded-xl"
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full rounded-xl py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 mt-2"
              disabled={loading}
            >
              {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase font-medium">
                <span className="bg-white dark:bg-zinc-950 px-3 text-zinc-500">Or</span>
              </div>
            </div>
            
            <div className="flex justify-center w-full min-h-[44px]">
              {loading ? (
                <button 
                  disabled 
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded text-sm font-medium transition-colors"
                >
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting to Google...
                </button>
              ) : (
                <div 
                  className="w-full flex justify-center"
                >
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                      setError('Google Sign-In could not be completed. Please try again.');
                      console.error("Google Login Button onError fired. The popup likely failed to initialize or was blocked.");
                    }}
                    useOneTap={false}
                    theme="outline"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                    width="100%"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/50 text-center">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline ml-1 focus:outline-none"
              >
                {mode === 'login' ? "Sign Up" : "Sign In"}
                <ArrowRight className="inline-block w-4 h-4 ml-1 -mt-0.5" />
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
