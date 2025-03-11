
import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidRendererProps {
  content: string;
}

const MermaidRenderer: React.FC<MermaidRendererProps> = ({ content }) => {
  const processedDiagrams = useRef(new Set<string>());
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize mermaid when component mounts
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    });
  }, []);

  // Process mermaid diagrams whenever content changes
  useEffect(() => {
    const renderDiagrams = () => {
      if (containerRef.current) {
        try {
          // Find elements with class 'mermaid' that haven't been processed
          const diagramElements = document.querySelectorAll('.mermaid');
          
          diagramElements.forEach((element) => {
            const diagramId = element.id || element.getAttribute('data-id');
            if (diagramId && !processedDiagrams.current.has(diagramId)) {
              try {
                // Create a proper callback function first
                const callback = function(svgCode: string) {
                  element.innerHTML = svgCode;
                  element.setAttribute('data-processed', 'true');
                  processedDiagrams.current.add(diagramId);
                };
                
                // Then use type casting separately when passing to mermaid.render
                mermaid.render(
                  `mermaid-svg-${diagramId}`, 
                  element.textContent || '', 
                  callback as unknown as Element
                );
              } catch (err) {
                console.error('Error rendering specific diagram:', err);
              }
            }
          });
        } catch (error) {
          console.error('Mermaid initialization error:', error);
        }
      }
    };
    
    // Small delay to ensure the DOM is updated
    const timer = setTimeout(renderDiagrams, 200);
    return () => clearTimeout(timer);
  }, [content]);

  return <div ref={containerRef}>{content}</div>;
};

export default MermaidRenderer;
