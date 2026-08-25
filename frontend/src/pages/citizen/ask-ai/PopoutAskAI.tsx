import React, { useRef, useEffect } from 'react';
import { useAskAIStore } from '../../../store/askAIStore';
import { AskAIHeader } from './AskAIHeader';
import { AskAIChatArea } from './AskAIChatArea';
import { motion, AnimatePresence } from 'framer-motion';

export const PopoutAskAI: React.FC = () => {
  const { mode, isMaximized, position, dimensions, setPosition, setDimensions } = useAskAIStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle resizing
  const startResize = (e: React.PointerEvent, direction: 'horizontal' | 'vertical' | 'both') => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = dimensions.width;
    const startHeight = dimensions.height;

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (direction === 'horizontal' || direction === 'both') {
        const deltaX = startX - moveEvent.clientX; // dragging left increases width
        const newWidth = Math.max(360, Math.min(window.innerWidth * 0.9, startWidth + deltaX));
        setDimensions({ ...useAskAIStore.getState().dimensions, width: newWidth });
      }
      
      if (direction === 'vertical' || direction === 'both') {
        const deltaY = startY - moveEvent.clientY; // dragging up increases height
        const maxHeight = window.innerHeight - 80 - position.y; // respect navbar and current Y
        const newHeight = Math.max(450, Math.min(maxHeight, startHeight + deltaY));
        setDimensions({ ...useAskAIStore.getState().dimensions, height: newHeight });
      }
    };

    const onPointerUp = () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  // Handle Dragging
  const startDrag = (e: React.PointerEvent) => {
    // Only allow drag if not maximized or mobile
    if (isMaximized || (typeof window !== 'undefined' && window.innerWidth < 768)) return;
    
    e.preventDefault();
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startPosX = position.x;
    const startPosY = position.y;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startMouseX;
      const deltaY = moveEvent.clientY - startMouseY;
      
      const newX = Math.max(0, Math.min(window.innerWidth - dimensions.width, startPosX - deltaX));
      // Subtract 80px (approx 5rem) to prevent dragging over the top navbar
      const newY = Math.max(0, Math.min(window.innerHeight - dimensions.height - 80, startPosY - deltaY));
      
      setPosition({ x: newX, y: newY });
    };

    const onPointerUp = () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  const currentWidth = isMobile || isMaximized ? '100vw' : `${dimensions.width}px`;
  const currentHeight = isMobile || isMaximized ? 'calc(100vh - 5rem - 1px)' : `${dimensions.height}px`;
  
  // Use explicit top/left instead of bottom/right for easier dragging math,
  // but since we stored position originally based on bottom/right logic, 
  // wait, our position {x, y} is technically right/bottom based on the original default.
  // Actually, position.x = right offset, position.y = bottom offset.
  const currentRight = isMobile || isMaximized ? 0 : `${position.x}px`;
  const currentBottom = isMobile || isMaximized ? 0 : `${position.y}px`;
  
  const currentBorderRadius = isMobile || isMaximized ? 0 : 16;
  const currentZIndex = isMobile || isMaximized ? 40 : 50; // Below Navbar (z-50) when maximized

  return (
    <AnimatePresence>
      {mode === 'popout' && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            right: currentRight,
            bottom: currentBottom,
            width: currentWidth,
            height: currentHeight,
            borderRadius: currentBorderRadius,
            zIndex: currentZIndex,
            transformOrigin: 'bottom right',
          }}
          className={`flex flex-col bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl shadow-2xl ${
            isMobile || isMaximized ? '' : 'border border-zinc-200/50 dark:border-zinc-800/50'
          } overflow-hidden`}
        >
          <AskAIHeader onPointerDown={startDrag} />
          <div className="flex-1 relative overflow-hidden flex flex-col bg-transparent">
            <AskAIChatArea />
          </div>

          {!isMaximized && !isMobile && (
            <>
              <div 
                className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-indigo-500/20 transition-colors z-20"
                onPointerDown={(e) => startResize(e, 'horizontal')}
              />
              <div 
                className="absolute left-0 top-0 right-0 h-2 cursor-row-resize hover:bg-indigo-500/20 transition-colors z-20"
                onPointerDown={(e) => startResize(e, 'vertical')}
              />
              <div 
                className="absolute left-0 top-0 w-4 h-4 cursor-nwse-resize hover:bg-indigo-500/30 transition-colors z-30"
                onPointerDown={(e) => startResize(e, 'both')}
              />
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
