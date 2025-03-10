
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
    <div className="markdown-body prose prose-sm max-w-none dark:prose-invert">
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
              <div className="overflow-x-auto my-6 rounded-md border">
                <table className={`${className || ''} min-w-full border-collapse`} {...props}>
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-muted/50">{children}</thead>;
          },
          tbody({ children }) {
            return <tbody className="divide-y divide-border">{children}</tbody>;
          },
          tr({ children }) {
            return <tr className="divide-x divide-border">{children}</tr>;
          },
          th({ children }) {
            return <th className="px-4 py-2 text-left font-semibold">{children}</th>;
          },
          td({ children }) {
            return <td className="px-4 py-2">{children}</td>;
          },
          pre({ children }) {
            return <pre className="bg-muted rounded-md p-4 overflow-x-auto">{children}</pre>;
          },
          a({ href, children, title, ...props }) {
            return (
              <a 
                href={href} 
                title={title}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
                {...props}
              >
                {children}
              </a>
            );
          },
          img({ src, alt, title, ...props }) {
            return (
              <img
                src={src}
                alt={alt || ''}
                title={title}
                className="max-w-full h-auto rounded-md my-4"
                {...props}
              />
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary/20 pl-4 py-1 my-4 italic">
                {children}
              </blockquote>
            );
          },
          h1({ children, id }) {
            return <h1 id={id} className="text-2xl font-bold mt-6 mb-4 pb-1 border-b">{children}</h1>;
          },
          h2({ children, id }) {
            return <h2 id={id} className="text-xl font-bold mt-5 mb-3">{children}</h2>;
          },
          h3({ children, id }) {
            return <h3 id={id} className="text-lg font-bold mt-4 mb-2">{children}</h3>;
          },
          h4({ children, id }) {
            return <h4 id={id} className="text-base font-bold mt-4 mb-2">{children}</h4>;
          },
          h5({ children, id }) {
            return <h5 id={id} className="text-sm font-bold mt-3 mb-1">{children}</h5>;
          },
          h6({ children, id }) {
            return <h6 id={id} className="text-xs font-bold mt-3 mb-1">{children}</h6>;
          },
          ul({ children }) {
            return <ul className="list-disc pl-6 my-4">{children}</ul>;
          },
          ol({ children, start }) {
            return <ol start={start} className="list-decimal pl-6 my-4">{children}</ol>;
          },
          li({ children }) {
            return <li className="my-1">{children}</li>;
          },
          hr() {
            return <hr className="my-6 border-t border-muted" />;
          },
          p({ children }) {
            return <p className="my-4 leading-relaxed">{children}</p>;
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
          },
          // Support for definition lists
          dl({ children }) {
            return <dl className="my-4">{children}</dl>;
          },
          dt({ children }) {
            return <dt className="font-bold">{children}</dt>;
          },
          dd({ children }) {
            return <dd className="ml-4 my-2">{children}</dd>;
          },
          // Support for abbreviations
          abbr({ title, children }) {
            return (
              <abbr title={title} className="cursor-help border-b border-dotted">
                {children}
              </abbr>
            );
          },
          // Support for superscript and subscript
          sup({ children }) {
            return <sup className="text-xs">{children}</sup>;
          },
          sub({ children }) {
            return <sub className="text-xs">{children}</sub>;
          },
          // Support for keyboard keys
          kbd({ children }) {
            return (
              <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted border border-gray-300 rounded shadow-sm">
                {children}
              </kbd>
            );
          },
          // Support for footnotes (rendered at the bottom)
          section({ children, className }) {
            if (className?.includes('footnotes')) {
              return (
                <section className="mt-8 pt-6 border-t border-muted">
                  <h2 className="text-lg font-bold mb-4">Footnotes</h2>
                  {children}
                </section>
              );
            }
            return <section className={className}>{children}</section>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;
