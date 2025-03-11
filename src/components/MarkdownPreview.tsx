
import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import 'katex/dist/katex.min.css';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Attachment } from '@/types';
import { createMarkdownComponents } from './markdown/MarkdownComponents';
import MermaidRenderer from './markdown/MermaidRenderer';
import SearchHighlighter from './markdown/SearchHighlighter';

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
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Create markdown components with attachment context
  const markdownComponents = createMarkdownComponents({ attachments });

  return (
    <div 
      ref={containerRef}
      className="prose prose-stone dark:prose-invert max-w-none p-4 prose-pre:relative"
    >
      <MermaidRenderer content={content} />
      <SearchHighlighter 
        searchQuery={searchQuery} 
        highlightSearchMatches={highlightSearchMatches} 
      />
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;
