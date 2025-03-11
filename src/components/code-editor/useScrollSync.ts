
import { useEffect } from 'react';

interface UseScrollSyncProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  lineNumbersRef: React.RefObject<HTMLDivElement>;
  highlightsRef: React.RefObject<HTMLDivElement>;
  editorContainerRef: React.RefObject<HTMLDivElement>;
}

export const useScrollSync = ({
  textareaRef,
  lineNumbersRef,
  highlightsRef,
  editorContainerRef
}: UseScrollSyncProps) => {
  // Handle scroll synchronization
  useEffect(() => {
    const textarea = textareaRef.current;
    const lineNumbers = lineNumbersRef.current;
    const highlights = highlightsRef.current;
    
    if (!textarea || !lineNumbers) return;
    
    // Function to sync line numbers scroll with textarea scroll
    const syncScroll = () => {
      if (lineNumbers) {
        lineNumbers.style.transform = `translateY(-${textarea.scrollTop}px)`;
      }
      
      if (highlights) {
        highlights.scrollTop = textarea.scrollTop;
      }
    };
    
    // Handle all events that might cause scrolling
    textarea.addEventListener('scroll', syncScroll, { passive: true });
    textarea.addEventListener('mousewheel', syncScroll, { passive: true });
    textarea.addEventListener('DOMMouseScroll', syncScroll, { passive: true }); // Firefox
    
    // Also add wheel event to the container to catch all scroll events
    const container = editorContainerRef.current;
    if (container) {
      container.addEventListener('wheel', () => {
        requestAnimationFrame(syncScroll);
      }, { passive: true });
    }
    
    // Initial sync
    syncScroll();
    
    return () => {
      textarea.removeEventListener('scroll', syncScroll);
      textarea.removeEventListener('mousewheel', syncScroll);
      textarea.removeEventListener('DOMMouseScroll', syncScroll);
      if (container) {
        container.removeEventListener('wheel', syncScroll);
      }
    };
  }, [textareaRef, lineNumbersRef, highlightsRef, editorContainerRef]);
};
