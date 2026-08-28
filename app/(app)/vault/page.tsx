'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getFavoriteFormulas, updateFavoriteFormulas } from '@/lib/db';
import { useRouter } from 'next/navigation';
import { FORMULA_DB, Formula, FormulaCategory } from '@/lib/formulas';
import {
  Zap,
  Search,
  Star,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Compass,
  Calculator,
  Binary,
  Layers,
  Sparkles,
  HelpCircle,
  X,
  LayoutGrid,
  List,
  BookOpen,
  Filter,
  SlidersHorizontal
} from 'lucide-react';

interface CategoryStyle {
  label: string;
  shortLabel: string;
  icon: typeof Zap;
  badgeBg: string;
  accentBorder: string;
}

const CATEGORY_STYLES: Record<FormulaCategory | 'All', CategoryStyle> = {
  All: {
    label: 'All Formulas',
    shortLabel: 'All Formulas',
    icon: Sparkles,
    badgeBg: '#e2e8f0',
    accentBorder: '#172033'
  },
  'Speed, Time & Motion': {
    label: 'Speed, Time & Motion',
    shortLabel: 'Speed & Motion',
    icon: Compass,
    badgeBg: '#bae6fd',
    accentBorder: '#0284c7'
  },
  'Logical Reasoning': {
    label: 'Logical Reasoning',
    shortLabel: 'Reasoning',
    icon: Binary,
    badgeBg: '#e9d5ff',
    accentBorder: '#9333ea'
  },
  Arithmetic: {
    label: 'Arithmetic Aptitude',
    shortLabel: 'Arithmetic',
    icon: Calculator,
    badgeBg: '#bbf7d0',
    accentBorder: '#16a34a'
  },
  'Algebra & Numbers': {
    label: 'Algebra & Number Systems',
    shortLabel: 'Algebra & Numbers',
    icon: Layers,
    badgeBg: '#fef08a',
    accentBorder: '#ca8a04'
  },
  'Geometry & Mensuration': {
    label: 'Geometry & 3D Mensuration',
    shortLabel: 'Geometry & 3D',
    icon: Compass,
    badgeBg: '#fbcfe8',
    accentBorder: '#db2777'
  },
  'Modern Math & Stats': {
    label: 'Modern Math & Statistics',
    shortLabel: 'Modern Math',
    icon: BookOpen,
    badgeBg: '#c7d2fe',
    accentBorder: '#4f46e5'
  },
  'Tricks & Shortcuts': {
    label: 'Vedic Tricks & Mental Math',
    shortLabel: 'Vedic Tricks',
    icon: Zap,
    badgeBg: '#fed7aa',
    accentBorder: '#ea580c'
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
  const [expandedExamples, setExpandedExamples] = useState<Record<string, boolean>>({});
  const [allExpanded, setAllExpanded] = useState<boolean>(false);
  const [viewLayout, setViewLayout] = useState<'grid' | 'compact'>('grid');
  const [wrapTopics, setWrapTopics] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const subcatRowRef = useRef<HTMLDivElement>(null);
  const catRowRef = useRef<HTMLDivElement>(null);

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

  const toggleExample = (id: string) => {
    setExpandedExamples((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleAllExamples = () => {
    const nextState = !allExpanded;
    setAllExpanded(nextState);
    const updated: Record<string, boolean> = {};
    FORMULA_DB.forEach((f) => {
      if (f.example) updated[f.id] = nextState;
    });
    setExpandedExamples(updated);
  };

  const scrollSubcats = (amount: number) => {
    if (subcatRowRef.current) {
      subcatRowRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const scrollCategories = (amount: number) => {
    if (catRowRef.current) {
      catRowRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Subcategories available for active category
  const availableSubcategories = useMemo(() => {
    const formulas =
      categoryFilter === 'All'
        ? FORMULA_DB
        : FORMULA_DB.filter((f) => f.category === categoryFilter);
    const subcats = Array.from(new Set(formulas.map((f) => f.subcategory).filter(Boolean)));
    return ['All', ...subcats];
  }, [categoryFilter]);

  // Reset subcategory if category changes
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

  // Sort: favorites first, then preserve taxonomy
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
      <div className="vault-loading-container">
        <div className="vault-spinner">
          <Zap size={28} />
        </div>
        <p className="loading-text">Loading Formula & Shortcuts Vault...</p>
        <style jsx>{`
          .vault-loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 70vh;
            gap: 1rem;
          }
          .vault-spinner {
            width: 52px;
            height: 52px;
            border-radius: 50%;
            background: #fff0a7;
            border: 2px solid #172033;
            box-shadow: 3px 3px 0 #172033;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #d9534f;
            animation: pulse 1.4s infinite ease-in-out;
          }
          .loading-text {
            color: #172033;
            font-family: var(--font-kalam, 'Segoe UI');
            font-size: 1.2rem;
            font-weight: 700;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.12); }
          }
        `}</style>
      </div>
    );
  }

  const categoryKeys: (FormulaCategory | 'All')[] = [
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
    <div className="vault-container">
      <style jsx>{`
        .vault-container {
          padding: 1.5rem 1.5rem 4rem 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* --- Hero Header Banner --- */
        .vault-hero-card {
          background: #fffdf5;
          border: 3px solid #172033;
          border-radius: 8px 16px 10px 14px;
          box-shadow: 5px 5px 0 #172033;
          padding: 1.75rem 2rem;
          margin-bottom: 1.75rem;
        }

        .hero-top-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1.25rem;
        }

        .hero-title-area {
          max-width: 780px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-family: var(--font-kalam, 'Segoe UI');
          font-size: 0.85rem;
          font-weight: 700;
          background: #fff0a7;
          color: #172033;
          border: 2px solid #172033;
          box-shadow: 2px 2px 0 #172033;
          margin-bottom: 0.65rem;
        }

        .hero-main-title {
          font-family: var(--font-kalam, 'Segoe UI');
          font-size: 2.2rem;
          font-weight: 700;
          color: #172033;
          margin-bottom: 0.35rem;
          line-height: 1.2;
        }

        .hero-subtitle {
          color: #475569;
          font-size: 0.95rem;
          line-height: 1.55;
        }

        .hero-stat-badges {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .stat-sketch-box {
          background: #f8f2df;
          border: 2px solid #172033;
          border-radius: 8px;
          box-shadow: 3px 3px 0 #172033;
          padding: 0.6rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .stat-num {
          font-family: var(--font-mono, monospace);
          font-size: 1.3rem;
          font-weight: 800;
          color: #172033;
        }

        .stat-lbl {
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
        }

        /* --- Toolbar Controls --- */
        .vault-controls-area {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.75rem;
        }

        .search-actions-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;
        }

        .search-input-wrapper {
          flex: 1;
          min-width: 280px;
          position: relative;
        }

        .search-icon-box {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          pointer-events: none;
          display: flex;
        }

        .vault-search-box {
          width: 100%;
          background: #fffdf5;
          border: 2.5px solid #172033;
          border-radius: 8px;
          box-shadow: 3px 3px 0 #172033;
          padding: 0.75rem 2.75rem 0.75rem 2.75rem;
          color: #172033;
          font-size: 0.95rem;
          font-weight: 600;
          outline: none;
          transition: box-shadow 120ms ease;
        }

        .vault-search-box:focus {
          box-shadow: 4px 4px 0 #172033;
        }

        .vault-search-box::placeholder {
          color: #94a3b8;
          font-weight: 400;
        }

        .btn-clear-search {
          position: absolute;
          right: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 0.2rem;
          display: flex;
        }
        .btn-clear-search:hover {
          color: #172033;
        }

        .control-btns-group {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .sketch-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.65rem 1rem;
          background: #fffdf5;
          border: 2.5px solid #172033;
          border-radius: 8px;
          box-shadow: 3px 3px 0 #172033;
          color: #172033;
          font-family: var(--font-kalam, 'Segoe UI');
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 130ms ease, box-shadow 130ms ease, background 130ms ease;
          white-space: nowrap;
        }

        .sketch-btn:hover {
          transform: translateY(-1px);
          box-shadow: 2px 2px 0 #172033;
        }

        .sketch-btn.starred-btn.active {
          background: #fff0a7;
          border-color: #172033;
        }

        .view-layout-toggle {
          display: flex;
          background: #fffdf5;
          border: 2.5px solid #172033;
          border-radius: 8px;
          box-shadow: 3px 3px 0 #172033;
          padding: 0.2rem;
          gap: 0.2rem;
        }

        .layout-tab-btn {
          padding: 0.45rem 0.65rem;
          border: none;
          background: transparent;
          border-radius: 4px;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 120ms ease;
        }

        .layout-tab-btn.active {
          background: #172033;
          color: #ffffff;
        }

        /* --- Category Slider Controls --- */
        .category-slider-wrapper {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          position: relative;
        }

        .slider-arrow-btn {
          width: 34px;
          height: 34px;
          border: 2px solid #172033;
          border-radius: 50%;
          background: #fffdf5;
          box-shadow: 2px 2px 0 #172033;
          color: #172033;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 120ms ease;
        }

        .slider-arrow-btn:hover {
          background: #fff0a7;
          transform: scale(1.08);
        }

        .category-tab-scroll {
          flex: 1;
          display: flex;
          gap: 0.55rem;
          overflow-x: auto;
          padding: 0.2rem 0.2rem 0.4rem 0.2rem;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }

        .category-tab-scroll::-webkit-scrollbar {
          height: 5px;
        }
        .category-tab-scroll::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 4px;
        }

        .cat-sketch-tab {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.55rem 1rem;
          background: #fffdf5;
          border: 2px solid #172033;
          border-radius: 9999px;
          box-shadow: 2px 2px 0 #172033;
          color: #172033;
          font-family: var(--font-kalam, 'Segoe UI');
          font-size: 0.92rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: transform 120ms ease, background 120ms ease;
          flex-shrink: 0;
        }

        .cat-sketch-tab:hover {
          transform: translateY(-1px);
          background: #f1f5f9;
        }

        .cat-sketch-tab.active {
          background: #172033;
          color: #ffffff;
          box-shadow: 3px 3px 0 #d9534f;
        }

        .cat-num-pill {
          font-family: var(--font-mono, monospace);
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.1rem 0.45rem;
          border-radius: 9999px;
          background: #f1f5f9;
          color: #172033;
          border: 1px solid #172033;
        }

        .cat-sketch-tab.active .cat-num-pill {
          background: #fff0a7;
          color: #172033;
        }

        /* --- Subcategory Topics Section & Slider --- */
        .subcat-topics-section {
          background: #fffdf5;
          border: 2px solid #172033;
          border-radius: 8px;
          box-shadow: 3px 3px 0 #172033;
          padding: 0.75rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .subcat-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.6rem;
        }

        .subcat-lead-label {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #172033;
          font-family: var(--font-kalam, 'Segoe UI');
        }

        .subcat-tools-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .topic-dropdown-select {
          background: #f8f2df;
          border: 1.5px solid #172033;
          border-radius: 6px;
          padding: 0.25rem 0.6rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: #172033;
          cursor: pointer;
          outline: none;
        }

        .toggle-wrap-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: #f8f2df;
          border: 1.5px solid #172033;
          border-radius: 6px;
          padding: 0.25rem 0.65rem;
          font-size: 0.78rem;
          font-weight: 700;
          color: #172033;
          cursor: pointer;
          transition: all 120ms ease;
        }

        .toggle-wrap-btn:hover {
          background: #fff0a7;
        }

        .subcat-slider-container {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .subcat-chips-bar {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.45rem;
          overflow-x: auto;
          padding: 0.2rem 0.2rem 0.45rem 0.2rem;
          scrollbar-width: thin;
          scrollbar-color: #94a3b8 #f1f5f9;
        }

        .subcat-chips-bar.is-wrapped {
          flex-wrap: wrap;
          overflow-x: visible;
        }

        .subcat-chips-bar::-webkit-scrollbar {
          height: 6px;
        }
        .subcat-chips-bar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .subcat-chips-bar::-webkit-scrollbar-thumb {
          background: #64748b;
          border-radius: 4px;
        }

        .subcat-chip-btn {
          background: #f8f2df;
          border: 1.5px solid #172033;
          padding: 0.35rem 0.85rem;
          border-radius: 6px;
          font-size: 0.82rem;
          font-weight: 700;
          color: #172033;
          cursor: pointer;
          white-space: nowrap;
          transition: all 130ms ease;
          flex-shrink: 0;
        }

        .subcat-chip-btn:hover {
          background: #e2e8f0;
          transform: translateY(-1px);
        }

        .subcat-chip-btn.active {
          background: #2563eb;
          color: #ffffff;
          border-color: #172033;
          box-shadow: 2px 2px 0 #172033;
        }

        /* --- Formula Cards Grid --- */
        .formula-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(390px, 1fr));
          gap: 1.5rem;
        }

        .formula-cards-grid.compact-mode {
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        /* --- Ultra-Readable Formula Card --- */
        .formula-card-item {
          background: #fffdf5;
          border: 2.5px solid #172033;
          border-radius: 8px 12px 9px 11px;
          box-shadow: 4px 4px 0 #172033;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          transition: transform 140ms ease, box-shadow 140ms ease;
          position: relative;
        }

        .formula-card-item:hover {
          transform: translateY(-2px);
          box-shadow: 4px 6px 0 #172033;
        }

        .card-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 0.85rem;
        }

        .card-badge-cluster {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.4rem;
        }

        .category-tag-badge {
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          color: #172033;
          border: 1.5px solid #172033;
        }

        .subcat-tag-badge {
          font-size: 0.72rem;
          font-weight: 700;
          color: #475569;
          background: #f8f2df;
          padding: 0.2rem 0.55rem;
          border-radius: 4px;
          border: 1.5px solid #cbd5e1;
        }

        .star-fav-button {
          background: transparent;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          padding: 0.2rem;
          display: flex;
          transition: transform 140ms ease, color 140ms ease;
        }

        .star-fav-button:hover {
          color: #f59e0b;
          transform: scale(1.15);
        }

        .star-fav-button.is-active {
          color: #f59e0b;
        }

        .card-formula-title {
          font-family: var(--font-kalam, 'Segoe UI');
          font-size: 1.25rem;
          font-weight: 700;
          color: #172033;
          line-height: 1.35;
          margin-bottom: 1rem;
        }

        /* --- Deep Contrast Chalkboard Equation Box --- */
        .chalkboard-box {
          background: #0f172a;
          border: 2px solid #172033;
          border-radius: 6px;
          padding: 1rem 1.15rem;
          margin-bottom: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
        }

        .chalkboard-lines {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .math-line-row {
          font-family: var(--font-mono, monospace);
          font-size: 1.05rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.6;
          word-break: break-word;
          letter-spacing: 0.02em;
          display: flex;
          align-items: baseline;
          gap: 0.4rem;
        }

        .math-bullet {
          color: #38bdf8;
          font-size: 0.9rem;
          user-select: none;
          flex-shrink: 0;
        }

        .copy-chalkboard-btn {
          background: #1e293b;
          border: 1.5px solid #475569;
          color: #ffffff;
          border-radius: 5px;
          padding: 0.35rem 0.65rem;
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          transition: all 130ms ease;
          flex-shrink: 0;
        }

        .copy-chalkboard-btn:hover {
          background: #334155;
          border-color: #94a3b8;
        }

        .copy-chalkboard-btn.is-copied {
          background: #065f46;
          border-color: #10b981;
          color: #a7f3d0;
        }

        /* --- Variables Breakdown --- */
        .variables-container {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin-bottom: 1rem;
        }

        .vars-mini-title {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #64748b;
        }

        .vars-tags-flow {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .var-pill-badge {
          background: #f8f2df;
          border: 1.5px solid #cbd5e1;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          font-size: 0.82rem;
          color: #1e293b;
          line-height: 1.4;
        }

        .var-symbol {
          font-family: var(--font-mono, monospace);
          font-weight: 800;
          color: #1d4ed8;
          background: #e0f2fe;
          padding: 0.05rem 0.35rem;
          border-radius: 3px;
          border: 1px solid #bae6fd;
          margin-right: 0.25rem;
        }

        /* --- Pro-Tip and Worked Example (High Contrast) --- */
        .card-extra-blocks {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          padding-top: 0.75rem;
          border-top: 2px dashed #cbd5e1;
        }

        .tip-sketch-card {
          background: #fffbeb;
          border: 2px solid #b45309;
          border-radius: 6px;
          padding: 0.65rem 0.9rem;
        }

        .tip-card-header {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #92400e;
          margin-bottom: 0.25rem;
        }

        .tip-card-body {
          font-size: 0.85rem;
          line-height: 1.5;
          color: #1f2937;
          font-weight: 500;
        }

        .example-sketch-card {
          background: #f0f9ff;
          border: 2px solid #0284c7;
          border-radius: 6px;
          padding: 0.65rem 0.9rem;
        }

        .example-card-header {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #0369a1;
          margin-bottom: 0.25rem;
        }

        .example-card-body {
          font-size: 0.85rem;
          line-height: 1.55;
          color: #0f172a;
          font-weight: 500;
        }

        .example-toggle-action {
          background: transparent;
          border: none;
          color: #475569;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.2rem 0;
          transition: color 130ms ease;
        }

        .example-toggle-action:hover {
          color: #0284c7;
        }

        /* --- Empty Results --- */
        .empty-vault-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4.5rem 1.5rem;
          background: #fffdf5;
          border: 3px dashed #172033;
          border-radius: 12px;
          box-shadow: 4px 4px 0 #172033;
        }

        .empty-icon-circle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #fff0a7;
          border: 2px solid #172033;
          color: #172033;
          margin-bottom: 1rem;
        }

        .empty-main-text {
          font-family: var(--font-kalam, 'Segoe UI');
          font-size: 1.4rem;
          font-weight: 700;
          color: #172033;
          margin-bottom: 0.4rem;
        }

        .empty-desc-text {
          color: #64748b;
          font-size: 0.95rem;
          max-width: 460px;
          margin: 0 auto 1.5rem auto;
          line-height: 1.5;
        }

        @media (max-width: 860px) {
          .vault-container {
            padding: 1rem 0.75rem 3rem 0.75rem;
          }
          .hero-main-title {
            font-size: 1.8rem;
          }
          .formula-cards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Hero Header Banner */}
      <div className="vault-hero-card">
        <div className="hero-top-row">
          <div className="hero-title-area">
            <div className="hero-badge">
              <Zap size={14} />
              <span>High-Yield Revision Desk</span>
            </div>
            <h1 className="hero-main-title">Formula & Shortcuts Vault</h1>
            <p className="hero-subtitle">
              Master formulas for Boats & Streams, Speed Time Distance, Trains, Logical Reasoning,
              Clocks, Calendars, Syllogisms, Arithmetic, Algebra, Geometry, and Vedic math tricks.
            </p>
          </div>

          <div className="hero-stat-badges">
            <div className="stat-sketch-box">
              <BookOpen size={20} color="#1d4ed8" />
              <div>
                <div className="stat-num">{FORMULA_DB.length}</div>
                <div className="stat-lbl">Formulas</div>
              </div>
            </div>

            <div className="stat-sketch-box">
              <Star size={20} color="#b45309" />
              <div>
                <div className="stat-num">{favorites.length}</div>
                <div className="stat-lbl">Starred</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="vault-controls-area">
        <div className="search-actions-row">
          <div className="search-input-wrapper">
            <span className="search-icon-box">
              <Search size={18} />
            </span>
            <input
              type="text"
              className="vault-search-box"
              placeholder="Search formulas, concepts, or tricks (e.g. Boat, Stream, Syllogism, Clock, CI)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="btn-clear-search"
                onClick={() => setSearch('')}
                title="Clear search query"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="control-btns-group">
            <button
              className={`sketch-btn starred-btn ${onlyFavorites ? 'active' : ''}`}
              onClick={() => setOnlyFavorites(!onlyFavorites)}
            >
              <Star size={16} fill={onlyFavorites ? '#f59e0b' : 'none'} />
              <span>{onlyFavorites ? 'Starred Only' : 'Show Starred'}</span>
              <span className="cat-num-pill">({favorites.length})</span>
            </button>

            <button className="sketch-btn" onClick={toggleAllExamples}>
              <Lightbulb size={16} />
              <span>{allExpanded ? 'Collapse All Examples' : 'Expand All Examples'}</span>
            </button>

            <div className="view-layout-toggle">
              <button
                className={`layout-tab-btn ${viewLayout === 'grid' ? 'active' : ''}`}
                onClick={() => setViewLayout('grid')}
                title="Grid Cards"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                className={`layout-tab-btn ${viewLayout === 'compact' ? 'active' : ''}`}
                onClick={() => setViewLayout('compact')}
                title="Compact List"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs with Left & Right Slider Controls */}
        <div className="category-slider-wrapper">
          <button
            className="slider-arrow-btn"
            onClick={() => scrollCategories(-220)}
            title="Slide categories left"
            aria-label="Slide categories left"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="category-tab-scroll" ref={catRowRef}>
            {categoryKeys.map((catKey) => {
              const styleConfig = CATEGORY_STYLES[catKey];
              const Icon = styleConfig.icon;
              const count = categoryCounts[catKey] || 0;
              const isActive = categoryFilter === catKey;

              return (
                <button
                  key={catKey}
                  className={`cat-sketch-tab ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setCategoryFilter(catKey);
                    setSubcategoryFilter('All');
                  }}
                >
                  <Icon size={16} />
                  <span>{styleConfig.shortLabel}</span>
                  <span className="cat-num-pill">{count}</span>
                </button>
              );
            })}
          </div>

          <button
            className="slider-arrow-btn"
            onClick={() => scrollCategories(220)}
            title="Slide categories right"
            aria-label="Slide categories right"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Subcategory Topics Section with Interactive Slider, Dropdown & Expand All View */}
        {availableSubcategories.length > 2 && (
          <div className="subcat-topics-section">
            <div className="subcat-header-row">
              <div className="subcat-lead-label">
                <Filter size={15} />
                <span>Select Specific Topic ({availableSubcategories.length - 1} available):</span>
              </div>

              <div className="subcat-tools-group">
                {/* Quick Dropdown selector for direct access */}
                <select
                  className="topic-dropdown-select"
                  value={subcategoryFilter}
                  onChange={(e) => setSubcategoryFilter(e.target.value)}
                  title="Direct Topic Selector"
                >
                  {availableSubcategories.map((subcat) => (
                    <option key={subcat} value={subcat}>
                      {subcat === 'All' ? 'All Topics' : subcat}
                    </option>
                  ))}
                </select>

                {/* Toggle between 1-line Slider and Full Multi-line Grid Tray */}
                <button
                  className="toggle-wrap-btn"
                  onClick={() => setWrapTopics(!wrapTopics)}
                  title={wrapTopics ? 'Switch to slider view' : 'Expand full topic list'}
                >
                  <SlidersHorizontal size={13} />
                  <span>{wrapTopics ? 'Show as Slider' : 'View Full List'}</span>
                  {wrapTopics ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
            </div>

            {/* Slider or Multi-Line Tray */}
            <div className="subcat-slider-container">
              {!wrapTopics && (
                <button
                  className="slider-arrow-btn"
                  onClick={() => scrollSubcats(-220)}
                  title="Slide topics left"
                  aria-label="Slide topics left"
                >
                  <ChevronLeft size={18} />
                </button>
              )}

              <div
                className={`subcat-chips-bar ${wrapTopics ? 'is-wrapped' : ''}`}
                ref={subcatRowRef}
              >
                {availableSubcategories.map((subcat) => (
                  <button
                    key={subcat}
                    className={`subcat-chip-btn ${subcategoryFilter === subcat ? 'active' : ''}`}
                    onClick={() => setSubcategoryFilter(subcat)}
                  >
                    {subcat}
                  </button>
                ))}
              </div>

              {!wrapTopics && (
                <button
                  className="slider-arrow-btn"
                  onClick={() => scrollSubcats(220)}
                  title="Slide topics right"
                  aria-label="Slide topics right"
                >
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Formula Cards Grid */}
      <div className={`formula-cards-grid ${viewLayout === 'compact' ? 'compact-mode' : ''}`}>
        {sortedFormulas.map((f) => {
          const isFav = favorites.includes(f.id);
          const isCopied = copiedId === f.id;
          const isExpanded = !!expandedExamples[f.id];
          const styleConfig = CATEGORY_STYLES[f.category] || CATEGORY_STYLES.All;

          // Split multi-part formulas separated by "|" for crystal clear math line layout
          const equationLines = f.content.split(/\s*\|\s*/);

          return (
            <div key={f.id} className="formula-card-item">
              {/* Header Badges & Favorite Action */}
              <div className="card-header-bar">
                <div className="card-badge-cluster">
                  <span
                    className="category-tag-badge"
                    style={{
                      backgroundColor: styleConfig.badgeBg
                    }}
                  >
                    {f.category}
                  </span>
                  {f.subcategory && <span className="subcat-tag-badge">{f.subcategory}</span>}
                </div>

                <button
                  className={`star-fav-button ${isFav ? 'is-active' : ''}`}
                  onClick={() => toggleFavorite(f.id)}
                  title={isFav ? 'Remove from starred' : 'Add to starred'}
                >
                  <Star size={19} fill={isFav ? '#f59e0b' : 'none'} />
                </button>
              </div>

              {/* Title */}
              <h3 className="card-formula-title">{f.name}</h3>

              {/* Deep Chalkboard Equation Showcase */}
              <div className="chalkboard-box">
                <div className="chalkboard-lines">
                  {equationLines.map((line, idx) => (
                    <div key={idx} className="math-line-row">
                      <span className="math-bullet">▸</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`copy-chalkboard-btn ${isCopied ? 'is-copied' : ''}`}
                  onClick={() => copyToClipboard(f)}
                  title="Copy formula expression"
                >
                  {isCopied ? (
                    <>
                      <Check size={13} />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Variables Legend */}
              {f.variables && Object.keys(f.variables).length > 0 && (
                <div className="variables-container">
                  <div className="vars-mini-title">Variables & Definitions</div>
                  <div className="vars-tags-flow">
                    {Object.entries(f.variables).map(([key, desc]) => (
                      <span key={key} className="var-pill-badge">
                        <span className="var-symbol">{key}</span>: {desc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pro-Tip & Worked Solution (Maximum Contrast) */}
              {(f.tip || f.example) && (
                <div className="card-extra-blocks">
                  {/* Pro-Tip */}
                  {f.tip && (
                    <div className="tip-sketch-card">
                      <div className="tip-card-header">
                        <Lightbulb size={14} />
                        <span>Exam Pro-Tip & Trap Warning</span>
                      </div>
                      <div className="tip-card-body">{f.tip}</div>
                    </div>
                  )}

                  {/* Worked Example */}
                  {f.example && (
                    <>
                      {isExpanded ? (
                        <div className="example-sketch-card">
                          <div className="example-card-header">
                            <BookOpen size={14} />
                            <span>Step-by-Step Worked Solution</span>
                          </div>
                          <div className="example-card-body">{f.example}</div>
                        </div>
                      ) : null}

                      <button
                        className="example-toggle-action"
                        onClick={() => toggleExample(f.id)}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp size={15} />
                            <span>Hide Solution</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown size={15} />
                            <span>View Worked Solution Example</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Empty State */}
        {sortedFormulas.length === 0 && (
          <div className="empty-vault-state">
            <div className="empty-icon-circle">
              <HelpCircle size={28} />
            </div>
            <h3 className="empty-main-text">No matching formulas found</h3>
            <p className="empty-desc-text">
              We couldn&apos;t find any cards matching &ldquo;{search}&rdquo;. Try resetting the
              category filter or clearing your search keywords.
            </p>
            <button
              className="sketch-btn"
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
