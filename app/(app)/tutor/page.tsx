'use client';

import { useState, useRef, useEffect } from 'react';
import { chat } from '@/lib/llm';
import { saveChatHistory, getChatHistory, type ChatMessage as ChatEntry } from '@/lib/db';
import { createClient } from '@/utils/supabase/client';
import type { RagSearchResult } from '@/lib/rag/rag-engine';
import CitationCard from '@/components/rag/CitationCard';
import { getSemanticCacheMetrics, type CacheStats } from '@/lib/cache/semantic-cache';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface ExtendedChatEntry extends ChatEntry {
  provider?: string;
  cached?: boolean;
  latencyMs?: number;
  citations?: RagSearchResult[];
}

export default function TutorPage() {
  const [messages, setMessages] = useState<ExtendedChatEntry[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<string>('');
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
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
    setCacheStats(getSemanticCacheMetrics());
  }, [supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ExtendedChatEntry = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    const newMessagesAfterUser = [...messages, userMsg];
    setMessages(newMessagesAfterUser);

    if (userId) {
      saveChatHistory(supabase, userId, newMessagesAfterUser);
    }

    setInput('');
    setIsLoading(true);

    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const history = [...messages.slice(-10), userMsg].map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const response = await chat(history);
      setProvider(response.provider);
      setCacheStats(getSemanticCacheMetrics());

      const assistantMsg: ExtendedChatEntry = {
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        provider: response.provider,
        cached: response.cached,
        latencyMs: response.latencyMs,
        citations: response.citations,
      };

      const newMessagesAfterAssistant = [...newMessagesAfterUser, assistantMsg];
      setMessages(newMessagesAfterAssistant);

      if (userId) {
        saveChatHistory(supabase, userId, newMessagesAfterAssistant);
      }
    } catch (error) {
      const errorMsg: ExtendedChatEntry = {
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
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  };

  const handleClear = () => {
    setMessages([]);
    if (userId) {
      saveChatHistory(supabase, userId, []);
    }
  };

  const quickPrompts = [
    '📖 Explain Article 32 and the 5 types of Writs',
    '💰 What is the difference between Repo Rate and Reverse Repo Rate?',
    '📐 Explain the shortcut for Percentage & Profit-Loss problems',
    '⚔️ Battles of Plassey and Buxar with Treaty of Allahabad',
    '🔭 Vision defects: Myopia vs Hypermetropia and corrective lenses',
    '🌊 Himalayan vs Peninsular Rivers and SW Monsoon',
  ];

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
          font-size: 1.15rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .tech-badges {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .badge-cache {
          font-size: 0.7rem;
          padding: 0.2rem 0.6rem;
          background: rgba(16, 185, 129, 0.12);
          color: var(--success);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 9999px;
          font-weight: 700;
        }

        .badge-rag {
          font-size: 0.7rem;
          padding: 0.2rem 0.6rem;
          background: rgba(59, 130, 246, 0.12);
          color: var(--accent-blue);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 9999px;
          font-weight: 700;
        }

        .chat-messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
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
        .welcome-sub { color: var(--text-secondary); font-size: 0.95rem; max-width: 540px; margin-bottom: 2rem; }

        .quick-prompts {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.6rem;
          max-width: 650px;
          width: 100%;
        }

        .quick-prompt {
          padding: 0.85rem 1.1rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
          font-size: 0.82rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 200ms;
          text-align: left;
        }

        .quick-prompt:hover {
          border-color: var(--accent-blue);
          color: var(--text-primary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }

        .msg-bubble {
          max-width: 80%;
          padding: 1.1rem 1.35rem;
          border-radius: 1rem;
          font-size: 0.9rem;
          line-height: 1.65;
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
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .msg-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.6rem;
          padding-top: 0.4rem;
          border-top: 1px solid rgba(255,255,255,0.05);
          font-size: 0.68rem;
        }

        .msg-time {
          color: var(--text-tertiary);
        }

        .msg-meta-tag {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-family: 'JetBrains Mono', monospace;
          color: var(--text-secondary);
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
          padding: 0.85rem 1.1rem;
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
          color: var(--text-primary);
          font-size: 0.92rem;
          resize: none;
          min-height: 48px;
          max-height: 140px;
          outline: none;
          transition: border-color 150ms;
          font-family: var(--font-body);
          line-height: 1.5;
        }

        .input-wrapper textarea:focus { border-color: var(--accent-blue); }
        .input-wrapper textarea::placeholder { color: var(--text-tertiary); }

        .send-btn {
          width: 48px;
          height: 48px;
          background: var(--gradient-hero);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          flex-shrink: 0;
          transition: all 150ms;
          color: white;
        }

        .send-btn:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(59,130,246,0.35);
        }

        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .clear-btn {
          font-size: 0.78rem;
          color: var(--text-tertiary);
          cursor: pointer;
          transition: color 150ms;
        }
        .clear-btn:hover { color: var(--error); }

        @media (max-width: 768px) {
          .msg-bubble { max-width: 92%; }
          .quick-prompts { grid-template-columns: 1fr; }
          .chat-messages-area { padding: 1rem; }
          .input-area { padding: 0.75rem 1rem; }
        }
      `}</style>

      <div className="tutor-container">
        <div className="tutor-header">
          <div className="tutor-title">
            <span>🤖 AI Tutor</span>
            <div className="tech-badges">
              <span className="badge-rag">📚 Verified Sources</span>
              <span className="badge-cache">⚡ Semantic Cache</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {cacheStats && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                ⚡ Saved ~<strong>{cacheStats.tokensSaved}</strong> tokens
              </span>
            )}
            {messages.length > 0 && (
              <button className="clear-btn" onClick={handleClear}>
                🗑️ Clear Chat
              </button>
            )}
          </div>
        </div>

        <div className="chat-messages-area">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-icon">🧠</div>
              <h2 className="welcome-title">AI Tutor & Knowledge Base</h2>
              <p className="welcome-sub">
                Ask any exam question or concept doubt. Answers are cross-verified with official NCERT textbooks, standard references (Laxmikanth, Spectrum), and historical PYQs.
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
                    <div>
                      <div className="markdown-body">
                        <ReactMarkdown 
                          remarkPlugins={[remarkMath]} 
                          rehypePlugins={[rehypeKatex]}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>

                      {/* RAG Citations Component */}
                      {msg.citations && msg.citations.length > 0 && (
                        <CitationCard citations={msg.citations} />
                      )}

                      <div className="msg-footer">
                        <div className="msg-meta-tag">
                          {msg.cached ? (
                            <span style={{ color: 'var(--success)', fontWeight: 700 }}>
                              ⚡ Instant Semantic Cache ({msg.latencyMs ?? 2}ms)
                            </span>
                          ) : msg.provider ? (
                            <span>via {msg.provider} ({msg.latencyMs ?? 850}ms)</span>
                          ) : null}
                        </div>
                        <div className="msg-time" suppressHydrationWarning>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div>{msg.content}</div>
                      <div className="msg-time" suppressHydrationWarning style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.4rem', fontSize: '0.65rem' }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  )}
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
              placeholder="Ask about any concept, theorem, formula, or textbook doubt..."
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
