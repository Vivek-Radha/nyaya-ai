import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { Calendar, Plus, Loader2, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal';
import { getApiUrl, fetchWithTimeout } from '../../lib/api';

export default function TimelinePage() {
  const { token } = useAuthStore();
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<string>('');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('');

  // Delete state
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [itemToDeleteName, setItemToDeleteName] = useState<string>('');

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await fetchWithTimeout(getApiUrl('/api/cases/'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCases(data.cases || []);
          if (data.cases && data.cases.length > 0) {
            setSelectedCase(data.cases[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch cases", err);
      }
    };
    fetchCases();
  }, [token]);

  const fetchTimeline = async (caseId: string) => {
    if (!caseId) return;
    try {
      setLoading(true);
      const res = await fetchWithTimeout(getApiUrl(`/api/timeline/${caseId}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.timeline || []);
      }
    } catch (err) {
      console.error("Failed to fetch timeline", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCase) {
      fetchTimeline(selectedCase);
    }
  }, [selectedCase, token]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim() || !newDate.trim() || !selectedCase) return;
    
    try {
      const res = await fetchWithTimeout(getApiUrl('/api/timeline/'), {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ case_id: selectedCase, description: newDesc, event_date: newDate })
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        setNewDesc('');
        setNewDate('');
        fetchTimeline(selectedCase);
      }
    } catch (err) {
      console.error("Failed to add event", err);
    }
  };

  const handleDelete = async (): Promise<boolean> => {
    if (!itemToDelete) return false;
    try {
      const res = await fetchWithTimeout(getApiUrl(`/api/timeline/${itemToDelete}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setEvents(prev => prev.filter(e => e.id !== itemToDelete));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to delete event", err);
      return false;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-transparent bg-gradient-to-r from-indigo-600 to-teal-500 dark:from-indigo-500 dark:to-teal-400 bg-clip-text flex items-center gap-2">
              <Calendar className="h-6 w-6 text-indigo-500" /> Timeline
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Track hearings, deadlines, and significant events.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} disabled={!selectedCase} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md">
            <Plus className="h-4 w-4 mr-2" /> Add Event
          </Button>
        </div>

        {cases.length > 0 && (
          <div className="mb-6">
            <select 
              value={selectedCase} 
              onChange={e => setSelectedCase(e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {cases.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-2 pl-4">
          {cases.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-48 bg-white dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 text-zinc-500">
               <p>Create a Case first to add timeline events.</p>
             </div>
          ) : loading ? (
            <div className="flex justify-center items-center h-32 text-zinc-500">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading timeline...
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 bg-white dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 text-zinc-500">
              <Calendar className="h-8 w-8 mb-3 opacity-20" />
              <p>No events recorded for this case yet.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-indigo-200 dark:border-indigo-900/50 ml-3 space-y-8 pb-8">
              {events.map((e) => (
                <div key={e.id} className="relative pl-8 group">
                  <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-indigo-500 border-4 border-zinc-50 dark:border-zinc-950"></div>
                  <div className="bg-white dark:bg-zinc-900/80 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow relative">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                        {new Date(e.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      <button
                        onClick={() => {
                          setItemToDelete(e.id);
                          setItemToDeleteName("Event");
                        }}
                        className="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all absolute right-2 top-2"
                        title="Delete Event"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-zinc-800 dark:text-zinc-200 mt-1 pr-6">{e.description}</p>
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
            <h2 className="text-xl font-bold mb-4 text-zinc-900 dark:text-white">Add Event to Timeline</h2>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">Date</label>
                <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">Description</label>
                <textarea 
                  value={newDesc} 
                  onChange={e => setNewDesc(e.target.value)} 
                  className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  rows={3}
                  placeholder="What happened or what is due?"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 text-white">Add Event</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmationModal 
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Delete this event?"
        description="This will permanently remove the timeline event from this case."
        itemType="timeline"
        itemName={itemToDeleteName}
      />
    </DashboardLayout>
  );
}
