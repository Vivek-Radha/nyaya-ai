import { useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../components/ThemeProvider';
import { useSettingsStore } from '../../store/settingsStore';
import { Button } from '../../components/ui/Button';
import { User, Mail, Shield, Bell, Moon, Sun, Lock, Activity, Loader2, CheckCircle2 } from 'lucide-react';
import { getApiUrl, formatApiError, fetchWithTimeout } from '../../lib/api';

export default function ProfilePage() {
  const { user, token, setToken, setUser } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { notificationsEnabled, setNotificationsEnabled } = useSettingsStore();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const response = await fetchWithTimeout(getApiUrl('/api/auth/update_profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: fullName,
          password: password || undefined
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Failed to update profile');
      
      setToken(data.access_token);
      setUser(data.user);
      setSuccessMsg('Profile updated successfully!');
      setPassword('');
    } catch (err: any) {
      setErrorMsg(formatApiError(err, 'Failed to update profile'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Compact Header */}
        <div className="flex items-center gap-6 mb-6 pt-2 shrink-0">
          <div className="relative group">
            {/* Ambient blur removed for B&W Theme */}
            <div className="relative h-20 w-20 rounded-full bg-zinc-900 dark:bg-white flex items-center justify-center text-3xl font-extrabold text-white dark:text-zinc-900 shadow-xl border-2 border-zinc-200 dark:border-zinc-800 transition-transform duration-500 group-hover:scale-105">
              {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 p-1.5 rounded-full border-2 border-white dark:border-zinc-950 shadow-sm">
              <Shield className="w-3 h-3" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-transparent bg-gradient-to-r from-indigo-600 to-teal-500 dark:from-indigo-500 dark:to-teal-400 bg-clip-text leading-tight">
              {user?.full_name || 'User Account'}
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">{user?.email}</p>
            <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 text-[10px] font-bold uppercase tracking-wider border border-teal-200 dark:border-teal-500/20">
              Citizen Access
            </div>
          </div>
        </div>

        {/* 2-Column Grid to save space */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 flex-1">
          
          {/* Account Settings Card */}
          <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col overflow-hidden transition-colors h-full">
            <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/20 shrink-0">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center">
                <User className="mr-2 h-4 w-4 text-indigo-500" /> Personal Information
              </h3>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm font-medium outline-none" 
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input 
                    type="email" 
                    disabled
                    value={user?.email || ''} 
                    className="w-full pl-9 pr-3 py-2 bg-zinc-100/70 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500 focus:outline-none cursor-not-allowed text-sm font-medium" 
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Update Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm font-medium outline-none" 
                  />
                </div>
              </div>
            </div>
            
            {/* Action Bar */}
            <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-950/40 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex-1 pr-2">
                {successMsg && <p className="text-xs text-teal-600 dark:text-teal-400 font-bold flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/> {successMsg}</p>}
                {errorMsg && <p className="text-xs text-red-600 dark:text-red-400 font-bold line-clamp-1">{errorMsg}</p>}
              </div>
              <Button 
                onClick={handleSave} 
                disabled={loading}
                className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] px-5 py-1.5 h-auto text-sm font-bold transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : null}
                Save Changes
              </Button>
            </div>
          </div>

          {/* Preferences Card */}
          <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col overflow-hidden transition-colors h-full">
            <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/20 shrink-0">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center">
                <Activity className="mr-2 h-4 w-4 text-teal-500" /> System Preferences
              </h3>
            </div>
            
            <div className="p-2 flex-1 overflow-y-auto">
              {/* Theme Toggle */}
              <div 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Dark Mode</p>
                    <p className="text-xs text-zinc-500 font-medium">Adjust app appearance</p>
                  </div>
                </div>
                <button 
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${theme === 'dark' ? 'bg-indigo-500' : 'bg-zinc-300'}`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="h-px bg-zinc-100 dark:bg-zinc-800/60 mx-3 my-1"></div>

              {/* Notifications Toggle */}
              <div 
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Notifications</p>
                    <p className="text-xs text-zinc-500 font-medium">Receive case alerts</p>
                  </div>
                </div>
                <button 
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${notificationsEnabled ? 'bg-teal-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
