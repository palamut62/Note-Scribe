import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApp } from '@/lib/app-state';
import { useT } from '@/lib/use-t';
import { Note } from '@/lib/types';
import { ChatMessage, chatWithNote } from '@/lib/ai';
import { Bot, Send, Trash2, X, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function extractText(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

interface Props {
  note: Note;
  onClose: () => void;
}

export function AiChatPanel({ note, onClose }: Props) {
  const { settings } = useApp();
  const t = useT();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setMessages([]);
  }, [note.id]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const apiKey = settings.provider === 'openrouter' ? settings.openrouterApiKey : settings.nvidiaApiKey;
    const model = settings.provider === 'openrouter' ? settings.openrouterModel : settings.nvidiaModel;

    if (!apiKey || !model) {
      toast({ title: t('ai.not.configured'), description: t('ai.not.configured.desc'), variant: 'destructive' });
      return;
    }

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const noteContent = extractText(note.content);
      const reply = await chatWithNote(newMessages, noteContent, settings.provider, apiKey, model, settings.language ?? 'tr', settings.aiPrompts?.chat);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err: unknown) {
      toast({ title: t('ai.error'), description: (err as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [t('ai.chat.q1'), t('ai.chat.q2'), t('ai.chat.q3')];

  return (
    <div className="flex flex-col h-full border-l border-border bg-background" style={{ width: 300 }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">{t('ai.chat.title')}</span>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => setMessages([])} title={t('ai.chat.clear')}>
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={onClose}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-xs text-muted-foreground mt-8 space-y-2">
            <Bot className="h-8 w-8 mx-auto opacity-30" />
            <p>{t('ai.chat.empty')}</p>
            <div className="space-y-1 text-left mt-4">
              {suggestions.map(s => (
                <button
                  key={s}
                  className="w-full text-left px-2 py-1.5 text-xs rounded-md border border-border hover:bg-accent/50 transition-colors"
                  onClick={() => setInput(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="h-3 w-3 text-primary" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-accent text-accent-foreground'
            }`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-3 w-3" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="h-3 w-3 text-primary" />
            </div>
            <div className="bg-accent rounded-lg px-3 py-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border shrink-0">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            className="flex-1 resize-none text-xs bg-accent/30 border border-border rounded-md px-2 py-1.5 outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground min-h-[60px] max-h-[120px]"
            placeholder={t('ai.chat.placeholder')}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
          />
          <Button
            size="icon"
            className="h-8 w-8 self-end shrink-0"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            title={t('ai.chat.send')}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="text-[10px] text-muted-foreground/50 mt-1">{t('ai.chat.hint')}</div>
      </div>
    </div>
  );
}
