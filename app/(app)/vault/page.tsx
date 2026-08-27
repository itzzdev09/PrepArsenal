'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getFavoriteFormulas, updateFavoriteFormulas } from '@/lib/db';
import { useRouter } from 'next/navigation';
import { FORMULA_DB, Formula, FormulaCategory } from '@/lib/formulas';

const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: string; color: string; bg: string; border: string }
> = {
  All: {
    label: 'All Formulas',
    icon: '⚡',
    color: '#f8fafc',
    bg: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.15)'
  },
  'Speed, Time & Motion': {
    label: 'Speed & Motion',
    icon: '🚤',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.12)',
    border: 'rgba(56, 189, 248, 0.3)'
  },
  'Logical Reasoning': {
    label: 'Logical Reasoning',
    icon: '🧠',
    color: '#c084fc',
    bg: 'rgba(192, 132, 252, 0.12)',
    border: 'rgba(192, 132, 252, 0.3)'
  },
  Arithmetic: {
    label: 'Arithmetic',
    icon: '🧮',
    color: '#34d399',
    bg: 'rgba(52, 211, 153, 0.12)',
    border: 'rgba(52, 211, 153, 0.3)'
  },
  'Algebra & Numbers': {
    label: 'Algebra & Numbers',
    icon: '🔢',
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.12)',
    border: 'rgba(251, 191, 36, 0.3)'
  },
  'Geometry & Mensuration': {
    label: 'Geometry & 3D',
    icon: '📐',
    color: '#f472b6',
    bg: 'rgba(244, 114, 182, 0.12)',
    border: 'rgba(244, 114, 182, 0.3)'
  },
  'Modern Math & Stats': {
    label: 'Modern Math & Stats',
    icon: '🎲',
    color: '#818cf8',
    bg: 'rgba(129, 140, 248, 0.12)',
    border: 'rgba(129, 140, 248, 0.3)'
  },
  'Tricks & Shortcuts': {
    label: 'Tricks & Shortcuts',
    icon: '🪄',
    color: '#fb923c',
    bg: 'rgba(251, 146, 60, 0.12)',
    border: 'rgba(251, 146, 60, 0.3)'
  }
};

export default function FormulaVaultPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>('All');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadVault() {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      const favs = await getFavoriteFormulas(supabase, user.id);
      setFavorites(favs);
      setLoading(false);
    }
    loadVault();
  }, [router, supabase]);

  const toggleFavorite = async (id: string) => {
    if (!userId) return;

    let newFavs: string[];
    if (favorites.includes(id)) {
      newFavs = favorites.filter((f) => f !== id);
    } else {
      newFavs = [...favorites, id];
    }

    setFavorites(newFavs);
    await updateFavoriteFormulas(supabase, userId, newFavs);
  };

  const copyToClipboard = (formula: Formula) => {
    navigator.clipboard.writeText(formula.content);
    setCopiedId(formula.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 1800);
  };

  const toggleExpand = (id: string) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Extract available subcategories based on active category
  const availableSubcategories = useMemo(() => {
    const formulas =
      categoryFilter === 'All'
        ? FORMULA_DB
        : FORMULA_DB.filter((f) => f.category === categoryFilter);
    const subcats = Array.from(new Set(formulas.map((f) => f.subcategory).filter(Boolean)));
    return ['All', ...subcats];
  }, [categoryFilter]);

  // Reset subcategory if category changed and current subcategory is not in list
  useEffect(() => {
    if (subcategoryFilter !== 'All' && !availableSubcategories.includes(subcategoryFilter)) {
      setSubcategoryFilter('All');
    }
  }, [categoryFilter, availableSubcategories, subcategoryFilter]);

  // Counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: FORMULA_DB.length };
    FORMULA_DB.forEach((f) => {
      counts[f.category] = (counts[f.category] || 0) + 1;
    });
    return counts;
  }, []);

  const filteredFormulas = useMemo(() => {
    return FORMULA_DB.filter((f) => {
      if (onlyFavorites && !favorites.includes(f.id)) return false;
      if (categoryFilter !== 'All' && f.category !== categoryFilter) return false;
      if (subcategoryFilter !== 'All' && f.subcategory !== subcategoryFilter) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const varText = Object.entries(f.variables || {})
          .map(([k, v]) => `${k} ${v}`)
          .join(' ');
        const haystack = `${f.name} ${f.content} ${f.category} ${f.subcategory || ''} ${varText} ${f.tip || ''} ${f.example || ''}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [categoryFilter, subcategoryFilter, onlyFavorites, favorites, search]);

  // Sort: favorites first, then preserve taxonomy order
  const sortedFormulas = useMemo(() => {
    return [...filteredFormulas].sort((a, b) => {
      const aFav = favorites.includes(a.id);
      const bFav = favorites.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });
  }, [filteredFormulas, favorites]);

  if (loading) {
    return (
      <div className="vault-loading">
        <div className="loading-spinner">⚡</div>
        <p>Loading Formula Vault...</p>
        <style jsx>{`
          .vault-loading {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 80vh;
            gap: 1rem;
            color: var(--text-secondary);
          }
          .loading-spinner {
            font-size: 2.5rem;
            animation: pulse 1.5s infinite ease-in-out;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.2); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  const categoryKeys = [
    'All',
    'Speed, Time & Motion',
    'Logical Reasoning',
    'Arithmetic',
    'Algebra & Numbers',
    'Geometry & Mensuration',
    'Modern Math & Stats',
    'Tricks & Shortcuts'
  ];

  return (
    <div className="vault-page">
      <style jsx>{`
        .vault-page {
          padding: 2rem 1.5rem;
          max-width: 1350px;
          margin: 0 auto;
          min-height: 90vh;
        }

        .vault-header {
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 1rem;
          border-bottom: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
          padding-bottom: 1.5rem;
        }

        .header-left {
          max-width: 700px;
        }

        .vault-title-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.3);
          margin-bottom: 0.75rem;
        }

        .vault-title {
          font-size: 2.25rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #ffffff 30%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .vault-subtitle {
          color: var(--text-secondary, #94a3b8);
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .vault-stats {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .stat-badge {
          padding: 0.5rem 1rem;
          background: var(--bg-card, #111827);
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.1));
          border-radius: 0.75rem;
          font-size: 0.85rem;
          color: var(--text-secondary, #94a3b8);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .stat-badge strong {
          color: var(--text-primary, #ffffff);
        }

        /* Controls Section */
        .vault-controls {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .search-and-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-container {
          position: relative;
          flex: 1;
          min-width: 280px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary, #94a3b8);
          pointer-events: none;
          font-size: 1rem;
        }

        .vault-search {
          width: 100%;
          background: var(--bg-card, #0f172a);
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.12));
          padding: 0.85rem 2.75rem 0.85rem 2.75rem;
          border-radius: 0.85rem;
          color: var(--text-primary, #f8fafc);
          outline: none;
          font-size: 0.95rem;
          transition: all 200ms;
        }

        .vault-search:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
        }

        .clear-search-btn {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: var(--text-secondary, #94a3b8);
          cursor: pointer;
          font-size: 1rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.35rem;
        }

        .fav-filter-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-card, #0f172a);
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.12));
          color: var(--text-secondary, #94a3b8);
          padding: 0.85rem 1.25rem;
          border-radius: 0.85rem;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 200ms;
          white-space: nowrap;
        }

        .fav-filter-btn:hover {
          border-color: #f59e0b;
          color: #f59e0b;
        }

        .fav-filter-btn.active {
          background: rgba(245, 158, 11, 0.15);
          border-color: #f59e0b;
          color: #f59e0b;
        }

        /* Category Tabs */
        .category-tabs {
          display: flex;
          gap: 0.6rem;
          overflow-x: auto;
          padding-bottom: 0.4rem;
          scrollbar-width: thin;
        }

        .cat-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-card, #0f172a);
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
          padding: 0.6rem 1.1rem;
          border-radius: 2rem;
          cursor: pointer;
          color: var(--text-secondary, #94a3b8);
          font-size: 0.85rem;
          font-weight: 600;
          white-space: nowrap;
          transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .cat-tab:hover {
          color: var(--text-primary, #ffffff);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .cat-tab.active {
          background: var(--cat-bg, rgba(255, 255, 255, 0.12));
          color: var(--cat-color, #ffffff);
          border-color: var(--cat-border, rgba(255, 255, 255, 0.3));
          box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.3);
        }

        .cat-count {
          font-size: 0.75rem;
          padding: 0.15rem 0.45rem;
          border-radius: 1rem;
          background: rgba(0, 0, 0, 0.25);
          opacity: 0.85;
        }

        /* Subcategory Chips */
        .subcategory-bar {
          display: flex;
          gap: 0.45rem;
          overflow-x: auto;
          padding-bottom: 0.3rem;
          align-items: center;
          scrollbar-width: none;
        }

        .subcat-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary, #64748b);
          margin-right: 0.3rem;
          white-space: nowrap;
        }

        .subcat-chip {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 0.35rem 0.8rem;
          border-radius: 0.6rem;
          font-size: 0.8rem;
          color: var(--text-secondary, #94a3b8);
          cursor: pointer;
          white-space: nowrap;
          transition: all 180ms;
        }

        .subcat-chip:hover {
          color: var(--text-primary, #ffffff);
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .subcat-chip.active {
          background: rgba(56, 189, 248, 0.15);
          color: #38bdf8;
          border-color: rgba(56, 189, 248, 0.4);
          font-weight: 600;
        }

        /* Grid */
        .formula-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 1.5rem;
        }

        /* Formula Card */
        .formula-card {
          background: var(--bg-card, #0f172a);
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
          border-radius: 1.15rem;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: transform 220ms, border-color 220ms, box-shadow 220ms;
          overflow: hidden;
        }

        .formula-card:hover {
          transform: translateY(-3px);
          border-color: var(--card-border-hover, rgba(255, 255, 255, 0.2));
          box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.4);
        }

        .fc-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 0.85rem;
        }

        .fc-badges {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.4rem;
        }

        .fc-category-badge {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 0.2rem 0.6rem;
          border-radius: 0.4rem;
        }

        .fc-subcat-badge {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text-secondary, #94a3b8);
          background: rgba(255, 255, 255, 0.05);
          padding: 0.2rem 0.5rem;
          border-radius: 0.4rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .fc-fav-btn {
          background: none;
          border: none;
          font-size: 1.3rem;
          cursor: pointer;
          opacity: 0.4;
          padding: 0.1rem;
          transition: transform 200ms, opacity 200ms;
          line-height: 1;
        }

        .fc-fav-btn:hover {
          opacity: 0.9;
          transform: scale(1.2);
        }

        .fc-fav-btn.is-fav {
          opacity: 1;
          color: #f59e0b;
        }

        .fc-name {
          font-weight: 700;
          font-size: 1.15rem;
          color: var(--text-primary, #f8fafc);
          line-height: 1.4;
          margin-bottom: 1rem;
        }

        /* Formula Box */
        .fc-formula-box {
          position: relative;
          background: var(--bg-input, #090d16);
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.09));
          border-radius: 0.85rem;
          padding: 1.15rem 1rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .fc-content {
          font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, monospace;
          font-size: 1.05rem;
          font-weight: 600;
          color: #f1f5f9;
          line-height: 1.5;
          word-break: break-word;
          flex: 1;
        }

        .copy-formula-btn {
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-secondary, #94a3b8);
          border-radius: 0.5rem;
          padding: 0.4rem 0.6rem;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          transition: all 180ms;
          flex-shrink: 0;
        }

        .copy-formula-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
        }

        .copy-formula-btn.copied {
          background: rgba(52, 211, 153, 0.2);
          border-color: #34d399;
          color: #34d399;
        }

        /* Variables */
        .fc-variables {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin-bottom: 1rem;
        }

        .fc-vars-title {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary, #64748b);
          margin-bottom: 0.1rem;
        }

        .fc-vars-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .var-pill {
          font-size: 0.78rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 0.25rem 0.6rem;
          border-radius: 0.45rem;
          color: var(--text-secondary, #cbd5e1);
          line-height: 1.35;
        }

        .var-key {
          font-weight: 700;
          color: #38bdf8;
          font-family: 'JetBrains Mono', monospace;
        }

        /* Pro Tip & Example section */
        .fc-extra-section {
          margin-top: auto;
          padding-top: 0.75rem;
          border-top: 1px dashed rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .tip-box {
          background: rgba(245, 158, 11, 0.08);
          border-left: 3px solid #f59e0b;
          padding: 0.6rem 0.85rem;
          border-radius: 0 0.5rem 0.5rem 0;
          font-size: 0.8rem;
          color: #fbbf24;
          line-height: 1.45;
        }

        .tip-header {
          font-weight: 700;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.2rem;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .example-box {
          background: rgba(56, 189, 248, 0.06);
          border-left: 3px solid #38bdf8;
          padding: 0.6rem 0.85rem;
          border-radius: 0 0.5rem 0.5rem 0;
          font-size: 0.8rem;
          color: #bae6fd;
          line-height: 1.45;
        }

        .example-header {
          font-weight: 700;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 0.2rem;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .expand-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary, #94a3b8);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0.3rem 0;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          transition: color 150ms;
        }

        .expand-btn:hover {
          color: #ffffff;
        }

        /* Empty State */
        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem 1.5rem;
          background: var(--bg-card, #0f172a);
          border: 1px dashed var(--border-subtle, rgba(255, 255, 255, 0.1));
          border-radius: 1.25rem;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .empty-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary, #ffffff);
          margin-bottom: 0.5rem;
        }

        .empty-desc {
          color: var(--text-secondary, #94a3b8);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .reset-filter-btn {
          background: #38bdf8;
          color: #0f172a;
          border: none;
          padding: 0.6rem 1.25rem;
          border-radius: 0.75rem;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 180ms;
        }

        .reset-filter-btn:hover {
          background: #7dd3fc;
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .vault-page {
            padding: 1.25rem 1rem;
          }
          .vault-title {
            font-size: 1.75rem;
          }
          .formula-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Header */}
      <div className="vault-header">
        <div className="header-left">
          <div className="vault-title-badge">
            <span>⚡ High-Yield Vault</span>
          </div>
          <h1 className="vault-title">Formula & Shortcuts Vault</h1>
          <p className="vault-subtitle">
            Master cheat sheet for Quantitative Aptitude, Boat & Stream problems, Speed Motion,
            Logical Reasoning, Clocks, Calendars, Syllogisms, and Vedic shortcuts.
          </p>
        </div>

        <div className="vault-stats">
          <div className="stat-badge">
            <span>📚</span>
            <span>
              Total: <strong>{FORMULA_DB.length}</strong>
            </span>
          </div>
          <div className="stat-badge">
            <span>⭐</span>
            <span>
              Starred: <strong>{favorites.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Controls & Filters */}
      <div className="vault-controls">
        {/* Search and Starred Toggle */}
        <div className="search-and-actions">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              className="vault-search"
              placeholder="Search formulas, concepts, or tricks (e.g. Boat, Stream, Syllogism, Clock, CI)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="clear-search-btn"
                onClick={() => setSearch('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <button
            className={`fav-filter-btn ${onlyFavorites ? 'active' : ''}`}
            onClick={() => setOnlyFavorites(!onlyFavorites)}
          >
            <span>{onlyFavorites ? '⭐ Starred Only' : '☆ Show Starred'}</span>
            <span className="cat-count">({favorites.length})</span>
          </button>
        </div>

        {/* Primary Category Tabs */}
        <div className="category-tabs">
          {categoryKeys.map((catKey) => {
            const config = CATEGORY_CONFIG[catKey] || {
              label: catKey,
              icon: '📌',
              color: '#ffffff',
              bg: 'rgba(255,255,255,0.1)',
              border: 'rgba(255,255,255,0.2)'
            };
            const count = categoryCounts[catKey] || 0;
            const isActive = categoryFilter === catKey;

            return (
              <button
                key={catKey}
                className={`cat-tab ${isActive ? 'active' : ''}`}
                style={
                  {
                    '--cat-color': config.color,
                    '--cat-bg': config.bg,
                    '--cat-border': config.border
                  } as React.CSSProperties
                }
                onClick={() => {
                  setCategoryFilter(catKey);
                  setSubcategoryFilter('All');
                }}
              >
                <span>{config.icon}</span>
                <span>{config.label}</span>
                <span className="cat-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Subcategory Topic Chips */}
        {availableSubcategories.length > 2 && (
          <div className="subcategory-bar">
            <span className="subcat-label">Topic:</span>
            {availableSubcategories.map((subcat) => (
              <button
                key={subcat}
                className={`subcat-chip ${subcategoryFilter === subcat ? 'active' : ''}`}
                onClick={() => setSubcategoryFilter(subcat)}
              >
                {subcat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Formula Cards Grid */}
      <div className="formula-grid">
        {sortedFormulas.map((f) => {
          const isFav = favorites.includes(f.id);
          const isCopied = copiedId === f.id;
          const isExpanded = !!expandedDetails[f.id];
          const catConfig = CATEGORY_CONFIG[f.category] || {
            color: '#38bdf8',
            bg: 'rgba(56, 189, 248, 0.12)',
            border: 'rgba(56, 189, 248, 0.3)'
          };

          return (
            <div
              key={f.id}
              className="formula-card"
              style={
                {
                  '--card-border-hover': catConfig.border
                } as React.CSSProperties
              }
            >
              {/* Header Badges & Favorite Button */}
              <div className="fc-top-bar">
                <div className="fc-badges">
                  <span
                    className="fc-category-badge"
                    style={{
                      backgroundColor: catConfig.bg,
                      color: catConfig.color,
                      border: `1px solid ${catConfig.border}`
                    }}
                  >
                    {f.category}
                  </span>
                  {f.subcategory && (
                    <span className="fc-subcat-badge">{f.subcategory}</span>
                  )}
                </div>

                <button
                  className={`fc-fav-btn ${isFav ? 'is-fav' : ''}`}
                  onClick={() => toggleFavorite(f.id)}
                  title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {isFav ? '⭐' : '☆'}
                </button>
              </div>

              {/* Formula Title */}
              <div className="fc-name">{f.name}</div>

              {/* Core Formula Box */}
              <div className="fc-formula-box">
                <div className="fc-content">{f.content}</div>
                <button
                  className={`copy-formula-btn ${isCopied ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(f)}
                  title="Copy formula expression"
                >
                  {isCopied ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>

              {/* Variable Notation Tags */}
              {f.variables && Object.keys(f.variables).length > 0 && (
                <div className="fc-variables">
                  <div className="fc-vars-title">Variables & Legend</div>
                  <div className="fc-vars-list">
                    {Object.entries(f.variables).map(([k, v]) => (
                      <span key={k} className="var-pill">
                        <span className="var-key">{k}</span> = {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pro Tip & Example */}
              {(f.tip || f.example) && (
                <div className="fc-extra-section">
                  {f.tip && (
                    <div className="tip-box">
                      <div className="tip-header">
                        <span>💡</span> Pro-Tip & Pitfall Alert
                      </div>
                      <div>{f.tip}</div>
                    </div>
                  )}

                  {f.example && (
                    <>
                      {isExpanded ? (
                        <div className="example-box">
                          <div className="example-header">
                            <span>📝</span> Practical Application
                          </div>
                          <div>{f.example}</div>
                        </div>
                      ) : (
                        <button
                          className="expand-btn"
                          onClick={() => toggleExpand(f.id)}
                        >
                          <span>▶</span> Show Example Solution
                        </button>
                      )}

                      {isExpanded && (
                        <button
                          className="expand-btn"
                          onClick={() => toggleExpand(f.id)}
                        >
                          <span>▼</span> Hide Example
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Empty Search Result State */}
        {sortedFormulas.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">No formulas or shortcuts found</div>
            <p className="empty-desc">
              We couldn&apos;t find any cards matching your current filter criteria.
            </p>
            <button
              className="reset-filter-btn"
              onClick={() => {
                setSearch('');
                setCategoryFilter('All');
                setSubcategoryFilter('All');
                setOnlyFavorites(false);
              }}
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
