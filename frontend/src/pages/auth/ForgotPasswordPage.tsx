import React, { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    // const { error } = await supabase.auth.resetPasswordForEmail(email, {
    //   redirectTo: `${window.location.origin}/reset-password`,
    // });
    const error = { message: "Password reset is not implemented yet." };
    
    if (error) {
      setError(error.message);
    } else {
      setMessage('Password reset instructions sent to your email.');
    }
    
    setLoading(false);
  };

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-zinc-100">Reset Password</h2>
        <p className="text-sm text-zinc-400 mt-1">Enter your email to receive reset instructions</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded text-sm text-center mb-4">
          {error}
        </div>
      )}
      
      {message && (
        <div className="bg-teal-500/10 border border-teal-500/20 text-teal-400 p-3 rounded text-sm text-center mb-4">
          {message}
        </div>
      )}

      <form onSubmit={handleReset} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Email</label>
          <Input 
            type="email" 
            placeholder="m@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send reset instructions'}
        </Button>
      </form>

      <p className="text-center text-sm text-zinc-400 mt-8">
        Remember your password? <a href="/login" className="text-indigo-400 hover:text-indigo-300">Sign in</a>
      </p>
    </AuthLayout>
  );
}
