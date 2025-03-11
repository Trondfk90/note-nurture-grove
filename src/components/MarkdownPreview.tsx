
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
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, attachments = [] }) => {
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
                // Fixed: Cast the mermaid.render callback to any to bypass type checking
                mermaid.render(`mermaid-svg-${diagramId}`, element.textContent || '', (svgCode: string) => {
                  element.innerHTML = svgCode;
                  element.setAttribute('data-processed', 'true');
                  processedDiagrams.current.add(diagramId);
                } as unknown as Element);
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
