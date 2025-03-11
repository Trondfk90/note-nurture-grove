
import React from 'react';
import CodeBlock from './CodeBlock';
import { Attachment } from '@/types';

interface MarkdownComponentsProps {
  attachments: Attachment[];
}

export const createMarkdownComponents = ({ attachments }: MarkdownComponentsProps) => {
  return {
    // Define custom components for the markdown
    code({ className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const codeContent = String(children).replace(/\n$/, '');
      
      if (!match) {
        return <code className={className} {...props}>{children}</code>;
      }
      
      return <CodeBlock language={match[1]} value={codeContent} />;
    },
    
    // Add unique IDs to mermaid diagrams
    pre({ node, className, children, ...props }: any) {
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
    
    img({ src, alt, ...props }: any) {
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
  };
};
