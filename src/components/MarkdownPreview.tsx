
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import { Attachment } from '@/types';

interface MarkdownPreviewProps {
  content: string;
  attachments?: Attachment[];
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, attachments = [] }) => {
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
    <ReactMarkdown
      className="prose prose-sm dark:prose-invert max-w-none"
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex, rehypeRaw]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={dracula}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
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
  );
};

export default MarkdownPreview;
