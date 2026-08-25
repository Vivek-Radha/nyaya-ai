import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { Briefcase, Plus, ShieldAlert, Loader2, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal';

export default function CasesPage() {
  const { token } = useAuthStore();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Delete state
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [itemToDeleteName, setItemToDeleteName] = useState<string>('');

  const fetchCases = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${baseUrl}/api/cases/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCases(data.cases || []);
      }
    } catch (err) {
      console.error("Failed to fetch cases", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [token]);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${baseUrl}/api/cases/`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newTitle, description: newDesc, status: 'Open' })
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        setNewTitle('');
        setNewDesc('');
        fetchCases();
      }
    } catch (err) {
      console.error("Failed to create case", err);
    }
  };

  const handleDelete = async (): Promise<boolean> => {
    if (!itemToDelete) return false;
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${baseUrl}/api/cases/${itemToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setCases(prev => prev.filter(c => c.id !== itemToDelete));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to delete case", err);
      return false;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-transparent bg-gradient-to-r from-indigo-600 to-teal-500 dark:from-indigo-500 dark:to-teal-400 bg-clip-text flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-indigo-500" /> My Cases
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage and track your active legal matters.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md">
            <Plus className="h-4 w-4 mr-2" /> New Case
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {loading ? (
            <div className="flex justify-center items-center h-32 text-zinc-500">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading cases...
            </div>
          ) : cases.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 bg-white dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 text-zinc-500">
              <Briefcase className="h-8 w-8 mb-3 opacity-20" />
              <p>No cases found. Create one to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cases.map((c) => (
                <div key={c.id} className="bg-white dark:bg-zinc-900/80 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-teal-400 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{c.title}</h3>
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider",
                      c.status === 'Open' ? "bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400" : "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                    )}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">{c.description || "No description provided."}</p>
                  <div className="flex justify-between items-center text-xs text-zinc-500">
                    <div className="flex flex-col gap-1">
                      <span>ID: {c.id.substring(0, 8)}</span>
                      <span>{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToDelete(c.id);
                        setItemToDeleteName(c.title || "Case");
                      }}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete Case"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95">
            <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-white">Create New Case</h2>
            <form onSubmit={handleCreateCase} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">Case Title</label>
                <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Property Dispute" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">Description</label>
                <textarea 
                  value={newDesc} 
                  onChange={e => setNewDesc(e.target.value)} 
                  className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  rows={4}
                  placeholder="Briefly describe your case..."
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 text-white">Create Case</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmationModal 
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Delete this case?"
        description="This will permanently remove the case and its associated user-owned data."
        itemType="case"
        itemName={itemToDeleteName}
      />
    </DashboardLayout>
  );
}
