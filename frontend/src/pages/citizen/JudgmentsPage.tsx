import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { BookOpen, Plus, Loader2, ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal';
import { getApiUrl, fetchWithTimeout } from '../../lib/api';

export default function JudgmentsPage() {
  const { token } = useAuthStore();
  const [judgments, setJudgments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newUrl, setNewUrl] = useState('');

  // Delete state
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [itemToDeleteName, setItemToDeleteName] = useState<string>('');

  const fetchJudgments = async () => {
    try {
      setLoading(true);
      const res = await fetchWithTimeout(getApiUrl('/api/judgments/'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setJudgments(data.judgments || []);
      }
    } catch (err) {
      console.error("Failed to fetch judgments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJudgments();
  }, [token]);

  const handleSaveJudgment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    try {
      const res = await fetchWithTimeout(getApiUrl('/api/judgments/'), {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newTitle, summary: newSummary, url: newUrl })
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        setNewTitle('');
        setNewSummary('');
        setNewUrl('');
        fetchJudgments();
      }
    } catch (err) {
      console.error("Failed to save judgment", err);
    }
  };

  const handleDelete = async (): Promise<boolean> => {
    if (!itemToDelete) return false;
    try {
      const res = await fetchWithTimeout(getApiUrl(`/api/judgments/${itemToDelete}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setJudgments(prev => prev.filter(j => j.id !== itemToDelete));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to delete judgment", err);
      return false;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-transparent bg-gradient-to-r from-indigo-600 to-teal-500 dark:from-indigo-500 dark:to-teal-400 bg-clip-text flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-indigo-500" /> Saved Judgments
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Your library of relevant legal precedents and case laws.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md">
            <Plus className="h-4 w-4 mr-2" /> Save Judgment
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {loading ? (
            <div className="flex justify-center items-center h-32 text-zinc-500">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading library...
            </div>
          ) : judgments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 bg-white dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 text-zinc-500">
              <BookOpen className="h-8 w-8 mb-3 opacity-20" />
              <p>No judgments saved yet. Build your legal library.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {judgments.map((j) => (
                <div key={j.id} className="bg-white dark:bg-zinc-900/80 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-teal-400 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 mt-1">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-1 leading-tight">{j.title}</h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-3">{j.summary}</p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">Saved {new Date(j.saved_at).toLocaleDateString()}</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setItemToDelete(j.id);
                              setItemToDeleteName(j.title || "Judgment");
                            }}
                            className="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete Judgment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          {j.url && (
                            <a href={j.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                              Read Source <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
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
            <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-white">Save Legal Judgment</h2>
            <form onSubmit={handleSaveJudgment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">Case Name / Citation</label>
                <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Kesavananda Bharati v. State of Kerala" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">Summary / Holding</label>
                <textarea 
                  value={newSummary} 
                  onChange={e => setNewSummary(e.target.value)} 
                  className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  rows={4}
                  placeholder="What was the core holding?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">Source URL (Optional)</label>
                <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://..." type="url" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 text-white">Save Judgment</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmationModal 
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Delete this judgment?"
        description="This will permanently remove this judgment from your saved library."
        itemType="judgment"
        itemName={itemToDeleteName}
      />
    </DashboardLayout>
  );
}
