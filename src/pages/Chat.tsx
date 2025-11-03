import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Download, Mail, Loader2, FileText, BookOpen, FlaskConical, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  documents?: Array<{
    id: string;
    filename: string;
    subject: string;
    semester: string;
    branch: string;
    document_type: string;
    file_path: string;
  }>;
}

const getDocumentIcon = (type: string) => {
  switch (type) {
    case 'Notes':
      return BookOpen;
    case 'PYQ':
      return FileText;
    case 'Lab':
      return FlaskConical;
    case 'Question Bank':
      return ClipboardList;
    default:
      return FileText;
  }
};

const STORAGE_KEY = 'vtu-mitra-chat-history';

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
    return [
      {
        role: 'assistant',
        content: 'Hi! I\'m VTU MITRA, your AI study assistant. Ask me for study materials, lab programs, or PYQs like "I need Data Structures notes for 3rd sem CSE" or "Show me lab programs for 4th sem ISE".',
      },
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: input },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        documents: data.documents || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      toast.error('Failed to get response. Please try again.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (document: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Download started!');
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const handleEmailDocument = async (document: any) => {
    if (!user?.email) return;

    try {
      toast.info('Sending email...');
      
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          documentId: document.id,
          recipientEmail: user.email,
        },
      });

      if (error) throw error;

      toast.success(`Document sent to ${user.email}!`);
    } catch (error: any) {
      console.error('Email error:', error);
      toast.error('Failed to send email');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <Navbar />
      
      <div className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <ScrollArea className="h-[calc(100vh-200px)] pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <Card
                  className={`max-w-[80%] p-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>

                  {message.documents && message.documents.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {message.documents.map((doc) => {
                        const Icon = getDocumentIcon(doc.document_type);
                        return (
                          <Card key={doc.id} className="p-4 bg-background/50">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <Icon className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate">{doc.filename}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {doc.subject} • {doc.semester} • {doc.branch}
                                </p>
                                <Badge variant="secondary" className="mt-2">
                                  {doc.document_type}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                onClick={() => handleDownload(doc)}
                                className="flex-1"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEmailDocument(doc)}
                                className="flex-1"
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                Email
                              </Button>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <Card className="p-4 bg-card">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="mt-4 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask for study materials, lab programs, or PYQs..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
