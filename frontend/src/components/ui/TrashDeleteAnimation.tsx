import React from 'react';
import { motion } from 'framer-motion';
import { FileText, MessageSquare, Briefcase, Clock, BookOpen, File } from 'lucide-react';

export type DeletableItemType = 'document' | 'chat' | 'case' | 'timeline' | 'judgment' | 'generic';

interface TrashDeleteAnimationProps {
  isAnimating: boolean;
  itemType?: DeletableItemType;
  itemName?: string;
}

const icons = {
  document: FileText,
  chat: MessageSquare,
  case: Briefcase,
  timeline: Clock,
  judgment: BookOpen,
  generic: File
};

export const TrashDeleteAnimation: React.FC<TrashDeleteAnimationProps> = ({ 
  isAnimating, 
  itemType = 'generic',
  itemName
}) => {
  const IconComponent = icons[itemType];

  const lidVariants = {
    idle: { rotateZ: 0 },
    animating: { 
      rotateZ: [0, 50, 50, 0],
      transition: { duration: 0.9, times: [0, 0.2, 0.65, 0.8], ease: "easeInOut" }
    }
  };

  const bodyVariants = {
    idle: { y: 0, scale: 1 },
    animating: {
      y: [0, 0, 0, 0, -8, 0],
      scale: [1, 1, 1, 1, 1.1, 1],
      transition: { duration: 0.9, times: [0, 0.2, 0.65, 0.8, 0.9, 1], ease: "easeInOut" }
    }
  };

  const itemVariants = {
    idle: { y: -20, opacity: 1, scale: 1, rotateZ: 0 },
    animating: {
      y: [-20, -40, 20, 20],
      opacity: [1, 1, 0, 0],
      scale: [1, 1.1, 0.3, 0],
      rotateZ: [0, -10, 15, 15],
      transition: { duration: 0.9, times: [0, 0.2, 0.6, 1], ease: "easeInOut" }
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-8 overflow-hidden h-48 relative">
      {/* The Item being deleted */}
      <motion.div
        className="absolute top-2 flex flex-col items-center z-0 pointer-events-none"
        variants={itemVariants}
        initial="idle"
        animate={isAnimating ? "animating" : "idle"}
      >
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-md rounded-xl p-3 flex flex-col items-center gap-2">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-500">
            <IconComponent className="w-6 h-6" />
          </div>
          {itemName && (
            <div className="text-[10px] font-bold text-zinc-500 max-w-[80px] truncate text-center">
              {itemName}
            </div>
          )}
        </div>
      </motion.div>

      {/* The Trash Can */}
      <div className="relative w-[72px] h-24 flex flex-col items-center mt-16 pointer-events-none z-10">
        <motion.div
          variants={bodyVariants}
          initial="idle"
          animate={isAnimating ? "animating" : "idle"}
          className="relative w-full h-full flex flex-col items-center origin-bottom"
        >
          {/* Lid */}
          <motion.div 
            className="w-[84px] flex flex-col items-center absolute -top-3 z-20 origin-[right_bottom]"
            variants={lidVariants}
            initial="idle"
            animate={isAnimating ? "animating" : "idle"}
          >
            <div className="w-6 h-1.5 bg-zinc-400 dark:bg-zinc-500 rounded-t-md" />
            <div className="w-full h-1.5 bg-zinc-400 dark:bg-zinc-500 rounded-md" />
          </motion.div>
          
          {/* Body */}
          <div className="w-[68px] h-20 bg-zinc-100 dark:bg-zinc-800/80 rounded-b-xl border-2 border-zinc-400 dark:border-zinc-500 border-t-0 flex justify-center gap-2 pt-3 backdrop-blur-sm z-10 overflow-hidden relative">
            {/* Front Lip (to visually swallow the item) */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-zinc-300 dark:bg-zinc-700 shadow-inner z-20" />
            {/* Grooves */}
            <div className="w-1 h-12 bg-zinc-300 dark:bg-zinc-600 rounded-full z-10" />
            <div className="w-1 h-12 bg-zinc-300 dark:bg-zinc-600 rounded-full z-10" />
            <div className="w-1 h-12 bg-zinc-300 dark:bg-zinc-600 rounded-full z-10" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
