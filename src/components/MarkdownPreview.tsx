
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
          code({ className, children, ...props }) {
            // Remove `node` from props destructuring as it's not needed
            const match = /language-(\w+)/.exec(className || '');
            
            // Check if it's an inline code block
            if (!className) {
              return (
                <code {...props}>
                  {children}
                </code>
              );
            }

            const language = match?.[1];
            const value = String(children).replace(/\n$/, '');

            if (language === 'mermaid') {
              return (
                <div className="mermaid">{value}</div>
              );
            }

            // Fix the SyntaxHighlighter component props
            return (
              <SyntaxHighlighter
                // Cast style to the correct type
                style={tomorrow as any}
                language={language}
                // Remove props that cause ref conflicts
                PreTag="div"
                // Spread remaining compatible props
                // This works because we're not including ref
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
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;
