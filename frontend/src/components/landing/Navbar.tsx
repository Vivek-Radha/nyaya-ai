import { useState, useRef, useEffect } from 'react';
import { Scale, Menu, Sun, Moon, ChevronDown, User, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAuthGateStore } from '../../store/authGateStore';
import { useTheme } from '../ThemeProvider';
import { cn } from '../../lib/utils';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuthStore();
  const { openAuthGate } = useAuthGateStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProtectedAction = (returnTo: string) => {
    setIsMobileMenuOpen(false);
    if (user) {
      navigate(returnTo);
    } else {
      openAuthGate(returnTo);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/citizen/dashboard' },
    { name: 'Ask AI', path: '/citizen/ask-ai' },
    { name: 'My Cases', path: '/citizen/cases' },
    { name: 'Documents', path: '/citizen/documents' },
    { name: 'Timeline', path: '/citizen/timeline' },
    { name: 'Saved Judgments', path: '/citizen/judgments' }
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
      isScrolled 
        ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 shadow-sm"
        : "bg-transparent border-transparent"
    )}>
      <div className={cn(
        "max-w-7xl mx-auto px-6 flex items-center justify-between transition-all duration-500 ease-out",
        isScrolled ? "h-16" : "h-20"
      )}>
        
        {/* Logo */}
        <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
          <Scale className="w-6 h-6 text-zinc-900 dark:text-white" strokeWidth={2.5} />
          <span className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight">NYAYA-AI</span>
        </Link>

        {/* Desktop Links - Mirroring Dashboard */}
        {location.pathname !== '/' && (
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <button 
                  key={link.name}
                  onClick={() => handleProtectedAction(link.path)} 
                  className={cn(
                    "transition-colors",
                    isActive 
                      ? "text-indigo-600 dark:text-indigo-400 font-semibold" 
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                  )}
                >
                  {link.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Auth Buttons or User Dropdown */}
        <div className="hidden lg:flex items-center gap-4 text-sm font-medium">
          {user ? (
            <>
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              
              {/* Profile Dropdown */}
              <div className="relative ml-2" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pl-4 pr-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
                >
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-none mb-1">{user?.full_name || user?.email?.split('@')[0] || 'User'}</p>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-none capitalize">{user?.role || 'Citizen'}</p>
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center text-sm font-bold text-white dark:text-zinc-900">
                    {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition-transform", isDropdownOpen ? "rotate-180" : "")} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-2">
                      <Link to="/citizen/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors">
                        <User className="mr-3 h-4 w-4" /> Edit Profile
                      </Link>
                      <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1 mx-2"></div>
                      <button 
                        onClick={() => {
                          setIsDropdownOpen(false);
                          signOut();
                        }} 
                        className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <LogOut className="mr-3 h-4 w-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
                Login
              </Link>
              <Link to="/signup" className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg lg:hidden text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 space-y-4 shadow-lg">
          {location.pathname !== '/' && (
            <div className="flex flex-col space-y-3 text-sm font-medium">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <button 
                    key={link.name}
                    onClick={() => handleProtectedAction(link.path)} 
                    className={cn(
                      "text-left py-1",
                      isActive 
                        ? "text-indigo-600 dark:text-indigo-400 font-bold" 
                        : "text-zinc-600 dark:text-zinc-400"
                    )}
                  >
                    {link.name}
                  </button>
                );
              })}
            </div>
          )}
          <div className="flex flex-col space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            {user ? (
              <>
                <Link to="/citizen/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-600 dark:text-zinc-300 font-medium py-1">
                  Edit Profile
                </Link>
                <button onClick={() => { setIsMobileMenuOpen(false); signOut(); }} className="text-left text-red-600 dark:text-red-400 font-medium py-1">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-600 dark:text-zinc-300 font-medium">
                  Login
                </Link>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="text-center py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
