
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Image, FileText, Loader2, SendHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/store/appContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistant: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I\'m your AI assistant. I can help you with note formatting, answer questions, or convert images to markdown. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { setCurrentNote, updateNoteContent } = useAppContext();

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
                setOpen(false);
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
              setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="relative" title="AI Assistant">
          <Bot className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" /> AI Assistant
          </DialogTitle>
        </DialogHeader>
        
        <Tabs 
          defaultValue="chat" 
          className="flex-1 flex flex-col" 
          value={activeTab} 
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="convert">Text to Markdown</TabsTrigger>
            <TabsTrigger value="image">Image to Markdown</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4 py-2 space-y-4">
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
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg px-3 py-2 bg-muted flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <p>Thinking...</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="convert" className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
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
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg px-3 py-2 bg-muted flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <p>Converting to markdown...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="image" className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
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
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg px-3 py-2 bg-muted flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <p>Processing image...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex items-center gap-2 mt-auto">
          <Textarea
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="resize-none"
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
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIAssistant;
