import { useAuthStore } from '../../store/authStore';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, Calendar, FileText, MessageSquare, PieChart, LogOut, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const lawyerNav = [
  { name: 'Dashboard', href: '/lawyer/dashboard', icon: LayoutDashboard },
  { name: 'Assigned Cases', href: '/lawyer/cases', icon: Briefcase },
  { name: 'Clients', href: '/lawyer/clients', icon: Users },
  { name: 'Calendar', href: '/lawyer/calendar', icon: Calendar },
  { name: 'Evidence Review', href: '/lawyer/evidence', icon: FileText },
  { name: 'Messages', href: '/lawyer/messages', icon: MessageSquare },
  { name: 'Analytics', href: '/lawyer/analytics', icon: PieChart },
  { name: 'Settings', href: '/lawyer/settings', icon: Settings },
];

export default function LawyerDashboard() {
  const { user, signOut } = useAuthStore();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950/80 backdrop-blur-md flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
            NYAYA-AI <span className="text-xs font-normal text-zinc-500 uppercase ml-1">Pro</span>
          </h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {lawyerNav.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive ? "bg-teal-500/10 text-teal-400" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                )}
              >
                <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-teal-400" : "text-zinc-500")} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-sm font-semibold">
              {user?.email?.[0].toUpperCase() || 'L'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">Advocate {user?.email?.split('@')[0]}</p>
              <p className="text-xs text-zinc-500">Lawyer</p>
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
          <h2 className="text-lg font-medium text-zinc-100">Lawyer Workspace</h2>
        </header>

        <main className="flex-1 overflow-y-auto p-8 z-10">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-zinc-900/80 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">Assigned Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-zinc-100">12</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/80 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">Pending Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-zinc-100">5</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/80 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">Upcoming Deadlines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-zinc-100">2</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/80 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">AI Tokens Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-zinc-100">45K</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-zinc-100">Recent Assignments</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-zinc-900/40 border-zinc-800">
                      <CardContent className="p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-zinc-200">Civil Rights Violation #{i}</p>
                          <p className="text-sm text-zinc-500">Assigned 2 hours ago</p>
                        </div>
                        <Button size="sm" variant="outline">Review</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4 text-zinc-100">Today's Schedule</h3>
                <Card className="bg-zinc-900/40 border-zinc-800">
                  <CardContent className="p-0 divide-y divide-zinc-800">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex gap-4 items-center">
                        <span className="text-teal-400 font-mono text-sm">10:00 AM</span>
                        <p className="text-zinc-200 text-sm">Client Consultation - Rajesh Kumar</p>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between bg-zinc-800/20">
                      <div className="flex gap-4 items-center">
                        <span className="text-teal-400 font-mono text-sm">02:30 PM</span>
                        <p className="text-zinc-200 text-sm">Evidence Review - CAS-092</p>
                      </div>
                    </div>
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
