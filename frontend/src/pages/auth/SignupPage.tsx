import React, { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import { useLocation, useNavigate } from 'react-router-dom';

export default function SignupPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || '/citizen/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName) {
      setError('Please enter your full name.');
      return;
    }
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter a password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName, role: 'citizen' })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Signup failed');
      }
      
      // We log them in automatically after signup
      useAuthStore.getState().setToken(data.access_token);
      await useAuthStore.getState().initialize();
      navigate(from, { replace: true });
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

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 transition-colors">Create an account</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 transition-colors">Get started with NYAYA-AI</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded text-sm text-center mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-teal-500/10 border border-teal-500/20 text-teal-400 p-3 rounded text-sm text-center mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4" noValidate>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors">Full Name</label>
          <Input 
            type="text" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors">Email</label>
          <Input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors">Password</label>
          <Input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            minLength={6}
          />
        </div>
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-8 transition-colors">
        Already have an account? <a href="/login" className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 font-medium">Sign in</a>
      </p>
    </AuthLayout>
  );
}
