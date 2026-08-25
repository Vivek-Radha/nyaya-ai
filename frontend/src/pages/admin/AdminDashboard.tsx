import { useAuthStore } from '../../store/authStore';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserCheck, Briefcase, Activity, FileText, Settings, Shield, Cpu, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const adminNav = [
  { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Lawyers', href: '/admin/lawyers', icon: UserCheck },
  { name: 'Cases', href: '/admin/cases', icon: Briefcase },
  { name: 'System Health', href: '/admin/health', icon: Activity },
  { name: 'AI Analytics', href: '/admin/ai-stats', icon: Cpu },
  { name: 'Audit Logs', href: '/admin/logs', icon: FileText },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminDashboard() {
  const { user, signOut } = useAuthStore();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950/80 backdrop-blur-md flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <Shield className="h-5 w-5 text-indigo-400 mr-2" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            NYAYA-AI Admin
          </h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {adminNav.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive ? "bg-indigo-500/10 text-indigo-400" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                )}
              >
                <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-indigo-400" : "text-zinc-500")} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-semibold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">System Admin</p>
              <p className="text-xs text-zinc-500">{user?.email}</p>
            </div>
            <button onClick={signOut} className="text-zinc-500 hover:text-zinc-300">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 z-10 bg-zinc-950/80 backdrop-blur-md">
          <h2 className="text-lg font-medium text-zinc-100">Command Center</h2>
          <div className="flex items-center gap-4">
            <span className="flex items-center text-sm text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
              All systems operational
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 z-10">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-zinc-900/80 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-zinc-100">1,248</div>
                  <p className="text-xs text-teal-400 mt-1">+12% this month</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/80 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">Verified Lawyers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-zinc-100">45</div>
                  <p className="text-xs text-teal-400 mt-1">3 pending approval</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/80 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">Total Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-zinc-100">382</div>
                  <p className="text-xs text-indigo-400 mt-1">214 active</p>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/80 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">AI Tokens (Groq)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-zinc-100">1.2M</div>
                  <p className="text-xs text-red-400 mt-1">Approaching quota</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="col-span-2">
                <Card className="bg-zinc-900/40 border-zinc-800 h-full">
                  <CardHeader>
                    <CardTitle className="text-zinc-100">Recent User Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-800/50 last:border-0">
                          <div className="flex gap-4">
                            <span className="text-sm font-mono text-zinc-500">10:{i}4 AM</span>
                            <span className="text-sm text-zinc-300">User citizen_{i}@example.com uploaded new evidence</span>
                          </div>
                          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">Event</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card className="bg-zinc-900/40 border-zinc-800 h-full">
                  <CardHeader>
                    <CardTitle className="text-zinc-100">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/10">
                      <UserCheck className="mr-2 h-4 w-4" /> Review Lawyer Profiles
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-teal-400 border-teal-500/20 hover:bg-teal-500/10">
                      <FileText className="mr-2 h-4 w-4" /> Export Platform Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-red-400 border-red-500/20 hover:bg-red-500/10">
                      <Activity className="mr-2 h-4 w-4" /> Clear Cache
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
