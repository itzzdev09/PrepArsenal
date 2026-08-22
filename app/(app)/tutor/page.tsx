'use client';

import { useState, useRef, useEffect } from 'react';
import { chat } from '@/lib/llm';
import { saveChatHistory, getChatHistory, type ChatMessage as ChatEntry } from '@/lib/db';
import { createClient } from '@/utils/supabase/client';

export default function TutorPage() {
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        getChatHistory(supabase, data.user.id).then(history => {
          setMessages(history);
        });
      }
    });
  }, [supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatEntry = { role: 'user', content: text, timestamp: new Date().toISOString() };
    const newMessagesAfterUser = [...messages, userMsg];
    setMessages(newMessagesAfterUser);
    
    if (userId) {
      saveChatHistory(supabase, userId, newMessagesAfterUser);
    }
    
    setInput('');
    setIsLoading(true);

    // Auto-resize textarea back
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      // Build message history for context
      const history = [...messages.slice(-10), userMsg].map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const response = await chat(history);
      setProvider(response.provider);

      const assistantMsg: ChatEntry = {
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
      };
      
      const newMessagesAfterAssistant = [...newMessagesAfterUser, assistantMsg];
      setMessages(newMessagesAfterAssistant);
      
      if (userId) {
        saveChatHistory(supabase, userId, newMessagesAfterAssistant);
      }
    } catch (error) {
      const errorMsg: ChatEntry = {
        role: 'assistant',
        content: '⚠️ Something went wrong. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  };

  const handleClear = () => {
    if (confirm('Clear all chat history?')) {
      setMessages([]);
      if (userId) {
        saveChatHistory(supabase, userId, []);
      }
    }
  };

  const quickPrompts = [
    '📐 Explain the shortcut for Percentage problems',
    '🧮 How to solve Profit & Loss questions quickly?',
    '📖 Explain Article 32 of the Indian Constitution',
    '💰 What is the difference between Repo Rate and Reverse Repo Rate?',
    '🧠 Tips for solving Seating Arrangement in less time',
    '📝 Common idioms asked in SSC CGL English',
  ];

  const formatMessage = (content: string) => {
    // Basic markdown-ish rendering
    return content
      .split('\n')
      .map((line, i) => {
        // Bold
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Inline code
        line = line.replace(/`([^`]+)`/g, '<code>$1</code>');
        // Headings
        if (line.startsWith('### ')) return `<h4 style="margin:0.5rem 0;font-size:0.95rem">${line.slice(4)}</h4>`;
        if (line.startsWith('## ')) return `<h3 style="margin:0.75rem 0;font-size:1rem">${line.slice(3)}</h3>`;
        if (line.startsWith('# ')) return `<h2 style="margin:0.75rem 0;font-size:1.1rem">${line.slice(2)}</h2>`;
        // List items
        if (line.startsWith('- ') || line.startsWith('* ')) return `<div style="padding-left:1rem;margin:0.15rem 0">• ${line.slice(2)}</div>`;
        if (/^\d+\.\s/.test(line)) return `<div style="padding-left:1rem;margin:0.15rem 0">${line}</div>`;
        // Empty line
        if (!line.trim()) return '<br/>';
        return `<div>${line}</div>`;
      })
      .join('');
  };

  return (
    <div>
      <style jsx>{`
        .tutor-container {
          display: flex;
          flex-direction: column;
          height: calc(100vh);
        }

        .tutor-header {
          padding: 1.25rem 2rem;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
        }
        .tutor-title {
          font-size: 1.1rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .tutor-provider {
          font-size: 0.7rem;
          padding: 0.2rem 0.5rem;
          background: rgba(16,185,129,0.12);
          color: var(--success);
          border-radius: 0.25rem;
          font-weight: 600;
        }

        .chat-messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .welcome-screen {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
        }
        .welcome-icon { font-size: 3rem; margin-bottom: 1rem; }
        .welcome-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
        .welcome-sub { color: var(--text-secondary); font-size: 0.95rem; max-width: 500px; margin-bottom: 2rem; }
        .quick-prompts {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
          max-width: 600px;
          width: 100%;
        }
        .quick-prompt {
          padding: 0.75rem 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 200ms;
          text-align: left;
        }
        .quick-prompt:hover {
          border-color: var(--accent-blue);
          color: var(--text-primary);
          transform: translateY(-1px);
        }

        .msg-bubble {
          max-width: 75%;
          padding: 1rem 1.25rem;
          border-radius: 1rem;
          font-size: 0.9rem;
          line-height: 1.6;
          animation: fadeInUp 250ms ease forwards;
        }
        .msg-bubble.user {
          align-self: flex-end;
          background: var(--accent-blue);
          color: white;
          border-bottom-right-radius: 0.25rem;
        }
        .msg-bubble.assistant {
          align-self: flex-start;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-bottom-left-radius: 0.25rem;
        }
        .msg-time {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.5);
          margin-top: 0.35rem;
        }
        .msg-bubble.assistant .msg-time {
          color: var(--text-tertiary);
        }

        .loading-indicator {
          align-self: flex-start;
          display: flex;
          gap: 0.35rem;
          padding: 1rem 1.25rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 1rem;
          animation: fadeIn 200ms ease;
        }
        .loading-dot {
          width: 8px;
          height: 8px;
          background: var(--accent-blue);
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }
        .loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-dot:nth-child(3) { animation-delay: 0.4s; }

        .input-area {
          padding: 1rem 2rem 1.5rem;
          border-top: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
          flex-shrink: 0;
        }
        .input-wrapper {
          display: flex;
          gap: 0.75rem;
          align-items: flex-end;
        }
        .input-wrapper textarea {
          flex: 1;
          padding: 0.75rem 1rem;
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
          color: var(--text-primary);
          font-size: 0.9rem;
          resize: none;
          min-height: 44px;
          max-height: 120px;
          outline: none;
          transition: border-color 150ms;
          font-family: var(--font-body);
          line-height: 1.5;
        }
        .input-wrapper textarea:focus { border-color: var(--accent-blue); }
        .input-wrapper textarea::placeholder { color: var(--text-tertiary); }

        .send-btn {
          width: 44px;
          height: 44px;
          background: var(--gradient-hero);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
          transition: all 150ms;
          color: white;
        }
        .send-btn:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(59,130,246,0.3);
        }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .clear-btn {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          cursor: pointer;
          transition: color 150ms;
        }
        .clear-btn:hover { color: var(--error); }

        @media (max-width: 768px) {
          .msg-bubble { max-width: 90%; }
          .quick-prompts { grid-template-columns: 1fr; }
          .chat-messages-area { padding: 1rem; }
          .input-area { padding: 0.75rem 1rem; }
        }
      `}</style>

      <div className="tutor-container">
        <div className="tutor-header">
          <div className="tutor-title">
            🤖 AI Tutor
            {provider && <span className="tutor-provider">via {provider}</span>}
          </div>
          {messages.length > 0 && (
            <button className="clear-btn" onClick={handleClear}>
              🗑️ Clear Chat
            </button>
          )}
        </div>

        <div className="chat-messages-area">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-icon">🤖</div>
              <h2 className="welcome-title">Ask Me Anything</h2>
              <p className="welcome-sub">
                I&apos;m your AI exam prep tutor. Ask me about concepts, shortcuts, question approaches,
                or anything related to your target exams. Try a prompt below:
              </p>
              <div className="quick-prompts">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    className="quick-prompt"
                    onClick={() => {
                      setInput(prompt);
                      if (textareaRef.current) textareaRef.current.focus();
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`msg-bubble ${msg.role}`}>
                  {msg.role === 'assistant' ? (
                    <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                  ) : (
                    msg.content
                  )}
                  <div className="msg-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="loading-indicator">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about any concept, shortcut, or exam question..."
              rows={1}
            />
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
