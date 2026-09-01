import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { FileText, UploadCloud, Loader2, Trash2, Eye, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { DeleteConfirmationModal } from '../../components/ui/DeleteConfirmationModal';
import { DocumentViewer } from '../../components/ui/DocumentViewer';
import { getApiUrl, fetchWithTimeout } from '../../lib/api';

export default function DocumentsPage() {
  const { token } = useAuthStore();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [itemToDeleteName, setItemToDeleteName] = useState<string>('');


  // Viewer state
  const [documentToView, setDocumentToView] = useState<any | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetchWithTimeout(getApiUrl('/api/documents/'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error("Failed to fetch documents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [token]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    
    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        // We use the existing AI upload endpoint so it gets processed by OCR/Text extraction
        await fetchWithTimeout(getApiUrl('/api/ai/upload'), {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        }, 90000);
      } catch (err) {
        console.error("Failed to upload", err);
      }
    }
    
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    fetchDocuments();
  };

  const handleDelete = async (): Promise<boolean> => {
    if (!itemToDelete) return false;
    try {
      const res = await fetchWithTimeout(getApiUrl(`/api/documents/${itemToDelete}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.document_id !== itemToDelete));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to delete document", err);
      return false;
    }
  };

  const handleCardDownload = async (e: React.MouseEvent, docId: string, filename: string) => {
    e.stopPropagation();
    try {
      const res = await fetchWithTimeout(getApiUrl(`/api/documents/${docId}/view?download=true`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'document';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-transparent bg-gradient-to-r from-indigo-600 to-teal-500 dark:from-indigo-500 dark:to-teal-400 bg-clip-text flex items-center gap-2">
              <FileText className="h-6 w-6 text-indigo-500" /> Documents
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Access all your securely stored legal documents and evidence.</p>
          </div>
          <div>
            <input 
              type="file" 
              multiple 
              className="hidden" 
              ref={fileInputRef}
              accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp"
              onChange={handleFileUpload}
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md">
              {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UploadCloud className="h-4 w-4 mr-2" />} 
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {loading ? (
            <div className="flex justify-center items-center h-32 text-zinc-500">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading documents...
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 bg-white dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 text-zinc-500">
              <FileText className="h-8 w-8 mb-3 opacity-20" />
              <p>No documents found. Upload one to securely store it.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div 
                  key={doc.document_id || doc.id} 
                  onClick={() => setDocumentToView(doc)}
                  className="bg-white dark:bg-zinc-900/80 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow group flex flex-col relative overflow-hidden cursor-pointer"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-teal-400 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-1 rounded">
                      {doc.original_filename ? doc.original_filename.split('.').pop() : 'Unknown'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 truncate" title={doc.original_filename}>{doc.original_filename || "Untitled"}</h3>
                  <p className="text-xs text-zinc-500 mb-4">Uploaded {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Date unavailable'}</p>
                  
                  <div className="flex items-center justify-end gap-2 mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDocumentToView(doc);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10 rounded-lg transition-all"
                      title="View Document"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => handleCardDownload(e, doc.document_id, doc.original_filename)}
                      className="p-1.5 text-zinc-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:text-teal-400 dark:hover:bg-teal-500/10 rounded-lg transition-all"
                      title="Download Document"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToDelete(doc.document_id);
                        setItemToDeleteName(doc.original_filename || "Untitled");
                      }}
                      className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete Document"
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
      
      <DeleteConfirmationModal 
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title="Delete this document?"
        description="This will permanently remove the document and its text contents from our servers."
        itemType="document"
        itemName={itemToDeleteName}
      />

      {documentToView && (
        <DocumentViewer
          isOpen={!!documentToView}
          onClose={() => setDocumentToView(null)}
          documentId={documentToView.document_id}
          filename={documentToView.original_filename || 'document'}
          mimeType={documentToView.mime_type || ''}
          token={token!}
        />
      )}
    </DashboardLayout>
  );
}
