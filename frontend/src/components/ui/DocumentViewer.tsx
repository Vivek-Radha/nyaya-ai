import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { getApiUrl, formatApiError, fetchWithTimeout } from '../../lib/api';

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  filename: string;
  mimeType: string;
  token: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  isOpen,
  onClose,
  documentId,
  filename,
  mimeType,
  token
}) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !documentId) {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        setObjectUrl(null);
      }
      return;
    }

    const fetchDocument = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchWithTimeout(getApiUrl(`/api/documents/${documentId}/view`), {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
          throw new Error('Failed to load document');
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setObjectUrl(url);
      } catch (err) {
        console.error("Error fetching document:", err);
        setError(formatApiError(err, "Could not load the document. It may have been deleted or you don't have permission."));
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, documentId, token]);

  const handleDownload = () => {
    if (!objectUrl) return;
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isPdf = mimeType.includes('pdf');
  const isImage = mimeType.includes('image');
  const canPreview = isPdf || isImage;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed top-[80px] inset-x-0 bottom-0 z-40 flex items-center justify-center bg-zinc-900/80 dark:bg-black/80 backdrop-blur-sm p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{ maxWidth: '1350px' }}
            className="w-full h-full flex flex-col bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate" title={filename}>
                  {filename}
                </h2>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Button 
                  onClick={handleDownload} 
                  disabled={loading || !!error || !objectUrl} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                >
                  <Download className="w-4 h-4" /> <span className="hidden sm:inline">Download</span>
                </Button>
                <button 
                  onClick={onClose}
                  className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-transparent hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Body */}
            <div className="flex-1 overflow-auto bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center relative">
              {loading ? (
                <div className="flex flex-col items-center text-zinc-500 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                  <p>Loading document securely...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center text-red-500 gap-3 max-w-md text-center p-6 bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30">
                  <AlertCircle className="w-10 h-10 mb-2" />
                  <p className="font-medium">{error}</p>
                </div>
              ) : !canPreview ? (
                <div className="flex flex-col items-center text-zinc-500 gap-4 max-w-md text-center p-8 bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                  <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full">
                    <FileText className="w-12 h-12 text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white mb-2">No Preview Available</h3>
                    <p className="text-sm">This file type cannot be previewed in the browser natively. Please download it to view its contents.</p>
                  </div>
                  <Button onClick={handleDownload} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white w-full">
                    Download File
                  </Button>
                </div>
              ) : isPdf ? (
                <iframe
                  src={`${objectUrl}#toolbar=0`}
                  className="w-full h-full border-none"
                  title={filename}
                />
              ) : (
                <div className="p-4 w-full h-full flex items-center justify-center">
                  <img 
                    src={objectUrl || ''} 
                    alt={filename} 
                    className="max-w-full max-h-full object-contain rounded shadow-md"
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
