
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Image, Loader2, SendHorizontal, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/store/appContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistant: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I\'m your AI assistant. I can help you with note formatting, answer questions, or convert images to markdown. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { updateNoteContent, setShowAIPanel } = useAppContext();

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      // Call Azure AI API
      const response = await fetch('/api/azure-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          operation: activeTab
        })
      });
      
      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      
      // Add assistant response to chat
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      
      // If in convert mode, offer to insert into current note
      if (activeTab === 'convert' || activeTab === 'image') {
        toast({
          title: "Conversion Complete",
          description: "Would you like to insert this markdown into your current note?",
          action: (
            <Button 
              onClick={() => {
                updateNoteContent(prev => prev + '\n\n' + data.content);
                toast({
                  title: "Markdown Inserted",
                  description: "The generated markdown has been added to your note"
                });
              }}
              variant="outline"
            >
              Insert
            </Button>
          ),
        });
      }
    } catch (error) {
      console.error('Error calling Azure AI:', error);
      toast({
        title: "Error",
        description: "Failed to get a response from the AI. Please try again.",
        variant: "destructive"
      });
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Show loading message
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: `[Uploaded image: ${file.name}]` 
    }]);
    setLoading(true);
    
    // Create form data
    const formData = new FormData();
    formData.append('image', file);
    
    // Mock image processing since we're using a fake API
    setTimeout(() => {
      setLoading(false);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '![Image description](data:image/placeholder.jpg)\n\nI\'ve processed your image. Here\'s the generated markdown content based on the image. You can edit this further if needed.' 
      }]);
      
      toast({
        title: "Image Processed",
        description: "Would you like to insert this markdown into your current note?",
        action: (
          <Button 
            onClick={() => {
              updateNoteContent(prev => 
                prev + '\n\n![Image description](data:image/placeholder.jpg)\n\nImage content here.'
              );
              toast({
                title: "Markdown Inserted",
                description: "The generated markdown has been added to your note"
              });
            }}
            variant="outline"
          >
            Insert
          </Button>
        ),
      });
    }, 1500);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <h3 className="font-medium">AI Assistant</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setShowAIPanel(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Tabs 
        defaultValue="chat" 
        className="flex-1 flex flex-col" 
        value={activeTab} 
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-3 mx-3 mt-3">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="convert">Text to Markdown</TabsTrigger>
          <TabsTrigger value="image">Image to Markdown</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="flex-1 flex flex-col m-0">
          <div className="flex-1 overflow-y-auto mb-4 p-3 space-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-3 py-2 bg-muted flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <p className="text-sm">Thinking...</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="convert" className="flex-1 flex flex-col m-0 p-0">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-3">
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm">
                Paste your text below and I'll convert it to clean markdown format.
                You can include formatting instructions in your message.
              </p>
            </div>
            <div className="flex-1 overflow-y-auto py-2 space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg px-3 py-2 bg-muted flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <p className="text-sm">Converting to markdown...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="image" className="flex-1 flex flex-col m-0 p-0">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-3">
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm">
                Upload an image and I'll extract text and convert it to markdown.
                I can also describe the image content.
              </p>
              <Button 
                variant="outline" 
                className="w-full mt-2 flex items-center gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="h-4 w-4" /> Upload Image
              </Button>
              <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            <div className="flex-1 overflow-y-auto py-2 space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg px-3 py-2 bg-muted flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <p className="text-sm">Processing image...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2">
          <Textarea
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="resize-none text-sm"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="h-9 w-9 flex-shrink-0"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
