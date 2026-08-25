import { DashboardLayout } from '../layouts/DashboardLayout';
import { useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';

export default function PlaceholderPage() {
  const location = useLocation();
  const pageName = location.pathname.split('/').pop()?.replace('-', ' ') || 'Page';

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="h-16 w-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
          <Construction className="h-8 w-8 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-semibold text-zinc-100 mb-2 capitalize">{pageName}</h2>
        <p className="text-zinc-400 max-w-md">
          This feature is currently under development. Check back soon for updates!
        </p>
      </div>
    </DashboardLayout>
  );
}
