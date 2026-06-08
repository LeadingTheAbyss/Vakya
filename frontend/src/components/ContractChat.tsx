import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, ChevronDown } from 'lucide-react';
import { chatWithContract } from '../api/client';
import { useApp } from '../context/AppContext';
import logoImg from '../images/logo.png';
import './ContractChat.css';

interface Message {
  role: 'human' | 'assistant';
  content: string;
}

interface ContractChatProps {
  clauses: any[];
  filename?: string;
}

const SUGGESTIONS = [
  'What are the biggest risks in this contract?',
  'Explain the payment terms simply.',
  'Is this contract MSME-friendly?',
  'What should I negotiate first?',
];

const ContractChat = ({ clauses, filename }: ContractChatProps) => {
  const { language } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const open = () => {
    setIsOpen(true);
    if (!hasOpened) {
      setHasOpened(true);
      // Add a greeting message
      setMessages([{
        role: 'assistant',
        content: language === 'hi'
          ? `नमस्ते! मैं **${filename || 'इस अनुबंध'}** के बारे में आपके सवालों का जवाब देने के लिए यहाँ हूँ। खंडों, जोखिमों, या भारतीय कानून के बारे में कुछ भी पूछें।`
          : `Hi! I've analyzed **${filename || 'this contract'}** and I'm ready to answer your questions. Ask me about specific clauses, risks, negotiation tactics, or anything about Indian contract law.`,
      }]);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: 'human', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const { reply } = await chatWithContract({
        message: text.trim(),
        clauses,
        history: messages,
      });
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: language === 'hi'
          ? 'माफ़ करें, अभी जवाब नहीं मिला। कृपया दोबारा कोशिश करें।'
          : 'Sorry, I couldn\'t get a response right now. Please try again.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Render simple markdown-ish bold
  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : part
    );
  };

  return (
    <div className="contract-chat-root">
      {/* Floating toggle button */}
      {!isOpen && (
        <button
          className="chat-fab"
          onClick={open}
          title="Ask about this contract"
        >
          <span className="chat-fab-label">
            {language === 'hi' ? 'Vakya AI से पूछें' : 'Ask Vakya AI'}
          </span>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="chat-panel animate-slide-up">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-header-icon">
                <img src={logoImg} alt="Vakya" className="chat-header-logo" />
              </div>
              <div>
                <div className="chat-header-title">Vakya AI</div>
              </div>
            </div>
            <button className="chat-close" onClick={() => setIsOpen(false)}>
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg chat-msg--${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="chat-msg-avatar">
                  <img src={logoImg} alt="Vakya" className="chat-avatar-logo" />
                  </div>
                )}
                <div className="chat-msg-bubble">
                  {renderContent(msg.content)}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chat-msg chat-msg--assistant">
                <div className="chat-msg-avatar">
                  <img src={logoImg} alt="Vakya" className="chat-avatar-logo" />
                </div>
                <div className="chat-msg-bubble chat-msg-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}

            {/* Suggestions (only shown when no user messages yet) */}
            {messages.length === 1 && !isLoading && (
              <div className="chat-suggestions">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    className="chat-suggestion-chip"
                    onClick={() => sendMessage(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="chat-input-row">
            <input
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={language === 'hi' ? 'अनुबंध के बारे में पूछें...' : 'Ask about this contract…'}
              disabled={isLoading}
            />
            <button
              className="chat-send"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractChat;
