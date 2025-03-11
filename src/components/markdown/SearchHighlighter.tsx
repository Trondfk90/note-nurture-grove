
import React, { useEffect, useRef } from 'react';

interface SearchHighlighterProps {
  searchQuery: string;
  highlightSearchMatches: boolean;
}

const SearchHighlighter: React.FC<SearchHighlighterProps> = ({ 
  searchQuery, 
  highlightSearchMatches 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchQuery || !highlightSearchMatches) return;
    
    // Use a small delay to ensure ReactMarkdown has finished rendering
    const timer = setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;
      
      // Clear any existing highlights first
      const existingHighlights = container.querySelectorAll('.search-highlight');
      existingHighlights.forEach(el => {
        const parent = el.parentNode;
        if (parent) {
          const textContent = el.textContent || '';
          const textNode = document.createTextNode(textContent);
          parent.replaceChild(textNode, el);
        }
      });

      if (searchQuery.trim() === '') return;
      
      // Function to highlight text in a node
      const highlightText = (textNode: Node) => {
        const text = textNode.textContent || '';
        if (!text) return;
        
        const searchTermLower = searchQuery.toLowerCase();
        const textLower = text.toLowerCase();
        
        if (textLower.includes(searchTermLower)) {
          const parts = [];
          let lastIndex = 0;
          let index = textLower.indexOf(searchTermLower);
          
          while (index >= 0) {
            // Add text before match
            if (index > lastIndex) {
              parts.push(document.createTextNode(text.substring(lastIndex, index)));
            }
            
            // Add highlighted match
            const span = document.createElement('span');
            span.className = 'search-highlight bg-yellow-200 rounded-sm';
            span.textContent = text.substring(index, index + searchQuery.length);
            parts.push(span);
            
            lastIndex = index + searchQuery.length;
            index = textLower.indexOf(searchTermLower, lastIndex);
          }
          
          // Add remaining text
          if (lastIndex < text.length) {
            parts.push(document.createTextNode(text.substring(lastIndex)));
          }
          
          // Replace the original text node with our parts
          const parent = textNode.parentNode;
          if (parent) {
            parts.forEach(part => {
              parent.insertBefore(part, textNode);
            });
            parent.removeChild(textNode);
          }
          
          return true;
        }
        
        return false;
      };
      
      // Walk the DOM and find text nodes to highlight
      const walk = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          return highlightText(node);
        }
        
        // Skip code blocks, we don't want to highlight them
        if (node.nodeName === 'PRE' || node.nodeName === 'CODE') {
          return false;
        }
        
        // Skip mermaid diagrams
        if (node.nodeName === 'DIV' && 
            ((node as Element).classList?.contains('mermaid') || 
             (node as Element).querySelector('.mermaid'))) {
          return false;
        }
        
        let hasHighlight = false;
        const childNodes = Array.from(node.childNodes);
        
        // We need to create a copy because the childNodes collection
        // will change as we add/remove nodes during highlighting
        for (const child of childNodes) {
          if (walk(child)) {
            hasHighlight = true;
          }
        }
        
        return hasHighlight;
      };
      
      // Walk through the rendered markdown content
      walk(container);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, highlightSearchMatches]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default SearchHighlighter;
