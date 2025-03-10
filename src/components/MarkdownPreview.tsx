
import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import mermaid from 'mermaid';
import 'katex/dist/katex.min.css';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'neutral',
  securityLevel: 'loose',
});

interface MarkdownPreviewProps {
  content: string;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content }) => {
  useEffect(() => {
    // Re-process mermaid diagrams after markdown rendering
    setTimeout(() => {
      try {
        // Explicitly define type for mermaid.init
        const initFunction = mermaid.init as (
          config?: string | undefined,
          nodes?: string | Element | NodeListOf<Element> | undefined
        ) => void;
        
        initFunction(undefined, '.mermaid');
      } catch (error) {
        console.error('Error initializing mermaid diagrams:', error);
      }
    }, 100);
  }, [content]);

  return (
    <div className="markdown-body prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          code({ className, children }) {
            const match = /language-(\w+)/.exec(className || '');
            
            // Check if it's an inline code block
            if (!className) {
              return <code className="bg-muted px-1.5 py-0.5 rounded text-sm">{children}</code>;
            }

            const language = match?.[1];
            const value = String(children).replace(/\n$/, '');

            if (language === 'mermaid') {
              return (
                <div className="mermaid">{value}</div>
              );
            }

            return (
              <SyntaxHighlighter
                style={tomorrow as any}
                language={language}
                PreTag="div"
              >
                {value}
              </SyntaxHighlighter>
            );
          },
          table({ className, children, ...props }) {
            return (
              <div className="overflow-x-auto">
                <table className={className} {...props}>
                  {children}
                </table>
              </div>
            );
          },
          pre({ children }) {
            return <pre className="bg-muted rounded-md p-4 overflow-x-auto">{children}</pre>;
          },
          a({ href, children, ...props }) {
            return (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
                {...props}
              >
                {children}
              </a>
            );
          },
          img({ src, alt, ...props }) {
            return (
              <img
                src={src}
                alt={alt || ''}
                className="max-w-full h-auto rounded-md"
                {...props}
              />
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary/20 pl-4 italic">
                {children}
              </blockquote>
            );
          },
          h1({ children }) {
            return <h1 className="text-2xl font-bold my-4">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold my-3">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-bold my-2">{children}</h3>;
          },
          ul({ children }) {
            return <ul className="list-disc pl-6 my-2">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-6 my-2">{children}</ol>;
          },
          hr() {
            return <hr className="my-4 border-t border-muted" />;
          },
          p({ children }) {
            return <p className="my-2">{children}</p>;
          },
          strong({ children }) {
            return <strong className="font-bold">{children}</strong>;
          },
          em({ children }) {
            return <em className="italic">{children}</em>;
          },
          del({ children }) {
            return <del className="line-through">{children}</del>;
          },
          input({ type, checked, ...props }) {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="mr-1 h-4 w-4 rounded border-gray-300"
                  {...props}
                />
              );
            }
            return <input type={type} {...props} />;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;
