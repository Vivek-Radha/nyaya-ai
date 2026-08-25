import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { TrashDeleteAnimation, DeletableItemType } from './TrashDeleteAnimation';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean> | boolean;
  title?: string;
  description?: string;
  itemType?: DeletableItemType;
  itemName?: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  itemType = 'generic',
  itemName
}) => {
  const [deleteState, setDeleteState] = useState<'confirm' | 'animating' | 'error'>('confirm');

  useEffect(() => {
    if (isOpen) {
      setDeleteState('confirm');
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setDeleteState('animating');
    
    // Enforce minimum animation time
    const minAnimPromise = new Promise(resolve => setTimeout(resolve, 900));
    
    try {
      const success = await onConfirm();
      await minAnimPromise;
      if (success) {
        onClose();
      } else {
        setDeleteState('error');
      }
    } catch (e) {
      await minAnimPromise;
      setDeleteState('error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col"
          >
            {deleteState === 'confirm' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">{title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6">{description}</p>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={onClose} className="border-zinc-200 dark:border-zinc-800">
                    Cancel
                  </Button>
                  <Button onClick={handleConfirm} className="bg-red-600 hover:bg-red-700 text-white border-0">
                    Delete
                  </Button>
                </div>
              </motion.div>
            )}

            {deleteState === 'animating' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-4">
                <TrashDeleteAnimation isAnimating={true} itemType={itemType} itemName={itemName} />
                <p className="text-sm font-medium text-zinc-500 mt-4 animate-pulse">Deleting securely...</p>
              </motion.div>
            )}

            {deleteState === 'error' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Deletion Failed</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6">Unable to delete this item. Please try again.</p>
                <div className="flex justify-center gap-3 w-full">
                  <Button variant="outline" onClick={onClose} className="flex-1 border-zinc-200 dark:border-zinc-800">
                    Cancel
                  </Button>
                  <Button onClick={handleConfirm} className="flex-1 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 border-0">
                    Try Again
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
