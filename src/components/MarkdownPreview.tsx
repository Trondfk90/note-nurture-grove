
import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import { Attachment } from '@/types';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import mermaid from 'mermaid';

interface MarkdownPreviewProps {
  content: string;
  attachments?: Attachment[];
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, attachments = [] }) => {
  const mermaidRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Initialize mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    });
    
    // Render any mermaid diagrams
    renderMermaidDiagrams();
  }, [content]);
  
  const renderMermaidDiagrams = () => {
    mermaidRefs.current.forEach((element) => {
      if (element) {
        try {
          mermaid.parse(element.textContent || '');
          const id = `mermaid-${Math.floor(Math.random() * 10000)}`;
          
          // Fix: Using the correct number of arguments for mermaid.render
          mermaid.render(id, element.textContent || '').then(result => {
            element.innerHTML = result.svg;
          }).catch(error => {
            console.error('Mermaid rendering error:', error);
          });
        } catch (error) {
          console.error('Mermaid parsing error:', error);
        }
      }
    });
  };

  const CopyButton = ({ content }: { content: string }) => {
    const [copied, setCopied] = React.useState(false);

    const copy = () => {
      navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "The code has been copied to your clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <Button 
        className="absolute right-2 top-2 h-8 w-8 p-0 opacity-60 hover:opacity-100" 
        variant="secondary" 
        size="icon" 
        onClick={copy}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    );
  };

  const processContent = (markdown: string) => {
    // Process @attachment links
    let processedMarkdown = markdown.replace(
      /(!?\[.*?\])\(@attachment\/([^)]+)\)/g,
      (match, linkText, attachmentId) => {
        const attachment = attachments.find(att => att.id === attachmentId);
        if (attachment) {
          return `${linkText}(${attachment.url})`;
        }
        return match;
      }
    );

    // Process @note links
    processedMarkdown = processedMarkdown.replace(
      /(!?\[.*?\])\(@note\/([^)]+)\)/g,
      (match, linkText) => {
        return `${linkText}(javascript:void(0))`;
      }
    );

    // Process @tag links
    processedMarkdown = processedMarkdown.replace(
      /(!?\[.*?\])\(@tag\/([^)]+)\)/g,
      (match, linkText) => {
        return `${linkText}(javascript:void(0))`;
      }
    );

    // Process @search links
    processedMarkdown = processedMarkdown.replace(
      /(!?\[.*?\])\(@search\/([^)]+)\)/g,
      (match, linkText) => {
        return `${linkText}(javascript:void(0))`;
      }
    );

    // Process wiki-style links [[text|link]] or [[link]]
    processedMarkdown = processedMarkdown.replace(
      /\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g,
      (match, text, link) => {
        if (link) {
          return `[${text}](javascript:void(0))`;
        }
        return `[${text}](javascript:void(0))`;
      }
    );

    return processedMarkdown;
  };

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeContent = String(children).replace(/\n$/, '');
            
            // Handle mermaid diagrams
            if (match && match[1] === 'mermaid') {
              const mermaidRef = (ref: HTMLDivElement) => {
                mermaidRefs.current.push(ref);
              };
              
              return (
                <div ref={mermaidRef} className="mermaid mt-4 mb-4">
                  {codeContent}
                </div>
              );
            }
            
            // Handle regular code blocks
            if (match) {
              return (
                <div className="relative group">
                  <SyntaxHighlighter
                    style={dracula as any}
                    language={match[1]}
                    PreTag="div"
                  >
                    {codeContent}
                  </SyntaxHighlighter>
                  <CopyButton content={codeContent} />
                </div>
              );
            }
            
            // Handle inline code
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          a({ node, children, href, ...props }) {
            if (href?.startsWith('javascript:void(0)')) {
              return (
                <a
                  className="cursor-pointer text-primary hover:text-primary/80"
                  onClick={(e) => e.preventDefault()}
                  {...props}
                >
                  {children}
                </a>
              );
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            );
          },
          img({ node, src, alt, ...props }) {
            return (
              <img 
                src={src} 
                alt={alt || ''} 
                className="max-w-full rounded-md my-4" 
                loading="lazy"
                {...props} 
              />
            );
          }
        }}
      >
        {processContent(content)}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;
