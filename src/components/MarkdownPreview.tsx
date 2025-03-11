import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import 'katex/dist/katex.min.css';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Attachment } from '@/types';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import mermaid from 'mermaid';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MarkdownPreviewProps {
  content: string;
  attachments?: Attachment[];
  searchQuery?: string;
  highlightSearchMatches?: boolean;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ 
  content, 
  attachments = [],
  searchQuery = '',
  highlightSearchMatches = false
}) => {
  const mermaidContainerRef = useRef<HTMLDivElement>(null);
  const processedDiagrams = useRef(new Set<string>());
  const { toast } = useToast();
  
  // Initialize mermaid only once when component mounts
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    });
  }, []);
  
  // Process mermaid diagrams only when content changes
  useEffect(() => {
    // Use a debounced approach to prevent excessive rendering
    const renderDiagrams = () => {
      if (mermaidContainerRef.current) {
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

  // Highlight search matches in preview mode
  useEffect(() => {
    if (!searchQuery || !highlightSearchMatches) return;
    
    // Use a small delay to ensure ReactMarkdown has finished rendering
    const timer = setTimeout(() => {
      const container = mermaidContainerRef.current;
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
  }, [searchQuery, content, highlightSearchMatches]);

  const CopyButton = ({ content }: { content: string }) => {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 opacity-50 hover:opacity-100"
        onClick={() => {
          navigator.clipboard.writeText(content);
          toast({
            title: "Copied to clipboard",
            description: "Code has been copied to your clipboard.",
          });
        }}
      >
        <Copy className="h-3 w-3" />
      </Button>
    );
  };

  return (
    <div 
      ref={mermaidContainerRef}
      className="prose prose-stone dark:prose-invert max-w-none p-4 prose-pre:relative"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          // Define custom components for the markdown
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeContent = String(children).replace(/\n$/, '');
            
            if (!match) {
              return <code className={className} {...props}>{children}</code>;
            }
            
            return (
              <div className="relative">
                <SyntaxHighlighter
                  language={match[1]}
                  style={atomOneLight}
                  PreTag="div"
                >
                  {codeContent}
                </SyntaxHighlighter>
                <CopyButton content={codeContent} />
              </div>
            );
          },
          // Add unique IDs to mermaid diagrams
          pre({ node, className, children, ...props }) {
            const isMermaid = 
              className === 'language-mermaid' || 
              (children[0]?.props?.className === 'language-mermaid');
            
            if (isMermaid) {
              const diagramContent = String(children[0]?.props?.children || '');
              const diagramId = `diagram-${Math.random().toString(36).substring(2, 11)}`;
              
              return (
                <div 
                  id={diagramId}
                  data-id={diagramId}
                  className="mermaid"
                >
                  {diagramContent}
                </div>
              );
            }
            
            return <pre className={className} {...props}>{children}</pre>;
          },
          img({ src, alt, ...props }) {
            // Handle attachments with data URLs
            if (src && src.startsWith('attachment:')) {
              const attachmentId = src.replace('attachment:', '');
              const attachment = attachments.find(a => a.id === attachmentId);
              
              if (attachment && attachment.url) {
                return <img src={attachment.url} alt={alt || 'attachment'} {...props} />;
              }
            }
            
            return <img src={src} alt={alt} {...props} />;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;
