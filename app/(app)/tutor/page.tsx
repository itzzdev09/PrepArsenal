'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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

const ALL_PROMPT_POOL = [
  // Polity & Constitution
  { text: '📖 Explain Article 32 and the 5 types of Writs with exam examples', category: 'Polity', icon: '🏛️' },
  { text: '📜 Key differences between Money Bill (Art 110) vs Financial Bill (Art 117)', category: 'Polity', icon: '⚖️' },
  { text: '🏛️ What is the Basic Structure Doctrine and Kesavananda Bharati case?', category: 'Polity', icon: '📜' },
  { text: '🚨 Emergency Provisions: National (Art 352) vs State (Art 356) vs Financial (Art 360)', category: 'Polity', icon: '🚨' },
  { text: '🗳️ Election Commission of India: Powers, Composition & Key Articles', category: 'Polity', icon: '🗳️' },

  // Quantitative Aptitude
  { text: '📐 Explain the 20-second shortcut for Percentage & Successive Discount', category: 'Quant', icon: '📐' },
  { text: '💰 Compound Interest vs Simple Interest 2-year & 3-year difference shortcuts', category: 'Quant', icon: '🧮' },
  { text: '⏱️ Time, Speed & Distance: Train crossing moving pole / bridge tricks', category: 'Quant', icon: '🚆' },
  { text: '📊 Alligation & Mixture rule: Step-by-step method for fast solving', category: 'Quant', icon: '📊' },
  { text: '🔢 Fast tricks to find Unit Digits, Remainder Theorem & Divisibility rules', category: 'Quant', icon: '🔢' },

  // Economics & Banking
  { text: '🏦 What is the difference between Repo Rate, Reverse Repo Rate and SDF?', category: 'Economics', icon: '🏦' },
  { text: '📈 Inflation types: Cost-Push vs Demand-Pull vs Core Inflation explained', category: 'Economics', icon: '📈' },
  { text: '💵 Balance of Payments (BoP): Current Account vs Capital Account breakdown', category: 'Economics', icon: '💵' },
  { text: '🌾 Priority Sector Lending (PSL) targets for Commercial & Regional Rural Banks', category: 'Economics', icon: '🌾' },
  { text: '📉 Fiscal Deficit vs Revenue Deficit vs Primary Deficit formulas and meaning', category: 'Economics', icon: '📉' },

  // Modern & Ancient History
  { text: '⚔️ Battles of Plassey (1757) & Buxar (1764) with Treaty of Allahabad details', category: 'History', icon: '⚔️' },
  { text: '📜 Chronology of Governor Generals & Viceroys from Dalhousie to Mountbatten', category: 'History', icon: '📜' },
  { text: '🔥 Non-Cooperation Movement (1920) vs Civil Disobedience Movement (1930)', category: 'History', icon: '🔥' },
  { text: '🏛️ Indus Valley Civilization: Major sites, Town Planning & Lothal Dockyard', category: 'History', icon: '🏛️' },
  { text: '👑 Buddhism vs Jainism: Councils, Key Doctrines & Four Noble Truths', category: 'History', icon: '👑' },

  // Geography & Climate
  { text: '🌊 Himalayan vs Peninsular Rivers and why Narmada/Tapi form Estuaries', category: 'Geography', icon: '🌊' },
  { text: '🌧️ Southwest Monsoon mechanism & why Tamil Nadu coast receives Winter rain', category: 'Geography', icon: '🌧️' },
  { text: '🌍 Major Ocean Currents: Warm vs Cold currents (Gulf Stream, Labrador, Kuroshio)', category: 'Geography', icon: '🌍' },
  { text: '🏔️ Mountain Passes of India: Nathu La, Zoji La, Shipki La & Rohtang tricks', category: 'Geography', icon: '🏔️' },

  // General Science
  { text: '🔭 Vision defects: Myopia vs Hypermetropia, causes and corrective lenses', category: 'Science', icon: '🔭' },
  { text: '💡 Total Internal Reflection (TIR): Diamonds, Mirage & Optical Fibres in exams', category: 'Science', icon: '💡' },
  { text: '🧬 DNA vs RNA and Mitosis vs Meiosis differences frequently asked in PYQs', category: 'Science', icon: '🧬' },
  { text: '⚡ Newton\'s 3 Laws of Motion with real-world competitive exam examples', category: 'Science', icon: '⚡' },

  // Reasoning & English
  { text: '🧠 Quick elimination strategies for Syllogisms (Some, All, No, Only a few)', category: 'Reasoning', icon: '🧠' },
  { text: '🪑 Circle and Linear Seating Arrangement: Left vs Right direction tips', category: 'Reasoning', icon: '🪑' },
  { text: '📝 Top 25 high-frequency Idioms and One-Word Substitutions in SSC CGL', category: 'English', icon: '📝' },
];

function getRandomSubset<T>(array: T[], size: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, size);
}

export default function TutorPage() {
  const [messages, setMessages] = useState<ExtendedChatEntry[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<string>('');
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Dynamic Prompt Rotation state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePrompts, setActivePrompts] = useState<typeof ALL_PROMPT_POOL>(ALL_PROMPT_POOL.slice(0, 6));

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  const shufflePrompts = useCallback((category = selectedCategory) => {
    let pool = ALL_PROMPT_POOL;
    if (category !== 'All') {
      pool = ALL_PROMPT_POOL.filter(p => p.category === category);
    }
    setActivePrompts(getRandomSubset(pool, Math.min(6, pool.length)));
  }, [selectedCategory]);

  useEffect(() => {
    setMounted(true);
    shufflePrompts('All');

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        getChatHistory(supabase, data.user.id).then(history => {
          setMessages(history);
        });
      }
    });
    setCacheStats(getSemanticCacheMetrics());

    // Check for prefilled question context from practice arena
    if (typeof window !== 'undefined') {
      const initialPrompt = sessionStorage.getItem('tutor_initial_prompt');
      if (initialPrompt) {
        setInput(initialPrompt);
        sessionStorage.removeItem('tutor_initial_prompt');
      }
    }
  }, [supabase, shufflePrompts]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    shufflePrompts(cat);
  };

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

  const categories = ['All', 'Quant', 'Polity', 'Economics', 'History', 'Geography', 'Science', 'Reasoning'];

  return (
    <div suppressHydrationWarning>
      <style jsx>{`
        .tutor-container {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 64px);
        }

        .tutor-header {
          padding: 1rem 2rem;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
        }

        .tutor-title {
          font-size: 1.15rem;
          font-weight: 800;
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

        .welcome-icon { font-size: 3rem; margin-bottom: 0.75rem; }
        .welcome-title { font-size: 1.6rem; font-weight: 800; margin-bottom: 0.5rem; }
        .welcome-sub { color: var(--text-secondary); font-size: 0.92rem; max-width: 580px; margin-bottom: 1.75rem; line-height: 1.55; }

        .prompt-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 680px;
          width: 100%;
          margin-bottom: 1rem;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .category-pills {
          display: flex;
          gap: 0.4rem;
          overflow-x: auto;
        }

        .cat-pill {
          padding: 0.3rem 0.65rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 150ms;
          white-space: nowrap;
        }
        .cat-pill:hover { border-color: var(--accent-blue); color: var(--text-primary); }
        .cat-pill.active { background: var(--accent-blue); border-color: var(--accent-blue); color: white; }

        .shuffle-btn {
          padding: 0.35rem 0.75rem;
          background: rgba(168, 85, 247, 0.12);
          border: 1px solid rgba(168, 85, 247, 0.3);
          border-radius: 0.5rem;
          font-size: 0.78rem;
          font-weight: 700;
          color: #c084fc;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          transition: all 150ms;
        }
        .shuffle-btn:hover { background: rgba(168, 85, 247, 0.22); transform: scale(1.03); }

        .quick-prompts {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.65rem;
          max-width: 680px;
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
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          line-height: 1.45;
        }

        .quick-prompt:hover {
          border-color: var(--accent-blue);
          color: var(--text-primary);
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.18);
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
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }} suppressHydrationWarning>
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
                Ask any exam question, shortcut formula, or concept doubt. Answers are verified against official NCERT textbooks, standard references (Laxmikanth, Spectrum), and historical PYQs.
              </p>

              {/* Dynamic Prompt Controls */}
              <div className="prompt-controls">
                <div className="category-pills">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => handleCategoryChange(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <button
                  className="shuffle-btn"
                  onClick={() => shufflePrompts(selectedCategory)}
                  title="Show different questions"
                >
                  <span>🔄</span>
                  <span>Shuffle Prompts</span>
                </button>
              </div>

              {/* Dynamic Prompt Cards */}
              <div className="quick-prompts">
                {activePrompts.map((prompt, i) => (
                  <button
                    key={i}
                    className="quick-prompt"
                    onClick={() => {
                      setInput(prompt.text);
                      if (textareaRef.current) textareaRef.current.focus();
                    }}
                  >
                    <span>{prompt.icon}</span>
                    <span>{prompt.text}</span>
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

                      {/* Verified Citations Component */}
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
                          {mounted && msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div>{msg.content}</div>
                      <div className="msg-time" suppressHydrationWarning style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.4rem', fontSize: '0.65rem' }}>
                        {mounted && msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
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
