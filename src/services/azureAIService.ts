
interface AzureAIResponse {
  content: string;
}

interface AzureAIRequest {
  messages: { role: 'user' | 'assistant'; content: string }[];
  operation: string;
}

export const callAzureAI = async (request: AzureAIRequest): Promise<AzureAIResponse> => {
  // This is a mock implementation that will be replaced with actual Azure AI API calls
  // when environment variables are configured
  
  console.log('Mock Azure AI call:', request);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Find the last user message without using findLast (for compatibility)
  const lastUserMessage = request.messages
    .filter(m => m.role === 'user')
    .slice(-1)[0]?.content || '';
  
  // Generate different responses based on the operation
  switch (request.operation) {
    case 'convert':
      return {
        content: convertTextToMarkdown(lastUserMessage)
      };
    case 'image':
      return {
        content: '![Image analysis](placeholder.jpg)\n\n' +
                'This is a placeholder for image analysis. In a real implementation, ' +
                'this would contain extracted text and description from the image.'
      };
    case 'chat':
    default:
      return {
        content: generateChatResponse(lastUserMessage, request.messages)
      };
  }
};

// Helper function to convert text to markdown
const convertTextToMarkdown = (text: string): string => {
  // This is a simple mock implementation
  // In a real scenario, we would use Azure AI to intelligently format the text
  
  let markdown = text;
  
  // Simple transformations for demo purposes
  const lines = text.split('\n');
  
  if (lines.length > 1) {
    // Detect headers
    markdown = lines.map(line => {
      if (/^([A-Z][a-z]+\s?)+:/.test(line)) {
        return `## ${line}`;
      }
      
      // Detect list items
      if (/^\d+\.\s/.test(line)) {
        return line; // Keep numbered lists as they are
      }
      if (/^[-*]\s/.test(line)) {
        return line; // Keep bullet lists as they are
      }
      if (/^[A-Za-z][\w\s]+:/.test(line)) {
        return `**${line.split(':')[0]}:** ${line.split(':').slice(1).join(':')}`;
      }
      
      return line;
    }).join('\n\n');
  }
  
  return markdown;
};

// Helper function to generate a chat response
const generateChatResponse = (
  message: string, 
  conversation: { role: 'user' | 'assistant'; content: string }[]
): string => {
  // Simple keyword-based responses
  if (message.toLowerCase().includes('markdown')) {
    return 'Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents. Here are some basics:\n\n' +
           '- Use # for headings (more # means smaller heading)\n' +
           '- Use **text** for bold or *text* for italic\n' +
           '- Use - or * for bullet points\n' +
           '- Use 1. 2. etc. for numbered lists\n' +
           '- Use [text](URL) for links\n' +
           '- Use ![alt text](URL) for images\n\n' +
           'Would you like more examples?';
  }
  
  if (message.toLowerCase().includes('help') || message.toLowerCase().includes('can you')) {
    return 'I can help you with:\n\n' +
           '1. Converting text to well-formatted markdown\n' +
           '2. Extracting text and content from images\n' +
           '3. Answering questions about note-taking\n' +
           '4. Suggesting formatting for different types of notes\n' +
           '5. Helping organize information from various sources\n\n' +
           'Just let me know what you need assistance with!';
  }
  
  if (message.toLowerCase().includes('thank')) {
    return "You're welcome! Is there anything else I can help you with?";
  }
  
  // Default response
  return "I understand you're asking about \"" + message + "\". How can I help you with that specifically? I can format notes, extract information from text or images, or answer questions about note-taking.";
};
