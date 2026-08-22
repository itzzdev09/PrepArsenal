'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getFavoriteFormulas, updateFavoriteFormulas } from '@/lib/db';
import { useRouter } from 'next/navigation';
import { FORMULA_DB as EXPANDED_FORMULA_DB } from '@/lib/formulas';

interface LegacyFormula {
  id: string;
  name: string;
  category: 'Arithmetic' | 'Geometry' | 'Algebra' | 'Reasoning';
  content: string;
  variables: Record<string, string>;
}

const LEGACY_FORMULA_DB: LegacyFormula[] = [
  {
    id: 'f1',
    name: 'Compound Interest',
    category: 'Arithmetic',
    content: 'A = P(1 + r/n)^(nt)',
    variables: { A: 'Amount', P: 'Principal', r: 'Rate', n: 'Compounds/yr', t: 'Time' }
  },
  {
    id: 'f2',
    name: 'Speed, Time, Distance',
    category: 'Arithmetic',
    content: 'D = S × T',
    variables: { D: 'Distance', S: 'Speed', T: 'Time' }
  },
  {
    id: 'f3',
    name: 'Area of Circle',
    category: 'Geometry',
    content: 'A = πr²',
    variables: { A: 'Area', r: 'Radius' }
  },
  {
    id: 'f4',
    name: 'Pythagorean Theorem',
    category: 'Geometry',
    content: 'a² + b² = c²',
    variables: { a: 'Base', b: 'Height', c: 'Hypotenuse' }
  },
  {
    id: 'f5',
    name: 'Quadratic Formula',
    category: 'Algebra',
    content: 'x = (-b ± √(b² - 4ac)) / 2a',
    variables: { a: 'Coeff x²', b: 'Coeff x', c: 'Constant' }
  },
  {
    id: 'f6',
    name: 'Algebraic Identity (Square)',
    category: 'Algebra',
    content: '(a + b)² = a² + 2ab + b²',
    variables: {}
  },
  {
    id: 'f7',
    name: 'Algebraic Identity (Cube)',
    category: 'Algebra',
    content: 'a³ + b³ = (a + b)(a² - ab + b²)',
    variables: {}
  },
  {
    id: 'f8',
    name: 'Simple Interest',
    category: 'Arithmetic',
    content: 'SI = (P × R × T) / 100',
    variables: { P: 'Principal', R: 'Rate (%)', T: 'Time (yrs)' }
  },
  {
    id: 'f9',
    name: 'Probability of Event',
    category: 'Reasoning',
    content: 'P(E) = Fav Outcomes / Total Outcomes',
    variables: {}
  },
  {
    id: 'f10',
    name: 'Volume of Cylinder',
    category: 'Geometry',
    content: 'V = πr²h',
    variables: { V: 'Volume', r: 'Radius', h: 'Height' }
  }
];

export default function FormulaVaultPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadVault() {
      const { data: { user } } = await supabase.auth.getUser();
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
    
    let newFavs;
    if (favorites.includes(id)) {
      newFavs = favorites.filter(f => f !== id);
    } else {
      newFavs = [...favorites, id];
    }
    
    setFavorites(newFavs);
    await updateFavoriteFormulas(supabase, userId, newFavs);
  };

  const filteredFormulas = EXPANDED_FORMULA_DB.filter(f => {
    if (categoryFilter !== 'All' && f.category !== categoryFilter) return false;
    if (search) {
      const haystack = `${f.name} ${f.content} ${Object.values(f.variables).join(' ')}`.toLowerCase();
      if (!haystack.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  // Sort so favorites are always on top
  const sortedFormulas = [...filteredFormulas].sort((a, b) => {
    const aFav = favorites.includes(a.id);
    const bFav = favorites.includes(b.id);
    if (aFav && !bFav) return -1;
    if (!aFav && bFav) return 1;
    return 0;
  });

  const categories = ['All', 'Arithmetic', 'Geometry', 'Algebra', 'Reasoning', 'Shortcuts'];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div style={{ fontSize: '2rem' }}>⏳</div>
      </div>
    );
  }

  return (
    <div className="vault-page">
      <style jsx>{`
        .vault-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .vault-header {
          margin-bottom: 2rem;
        }
        .vault-title {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }
        .vault-subtitle {
          color: var(--text-secondary);
        }
        
        .vault-controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        
        .vault-search {
          flex: 1;
          min-width: 250px;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          color: var(--text-primary);
          outline: none;
          font-size: 1rem;
        }
        .vault-search:focus {
          border-color: var(--border-default);
        }
        
        .category-pills {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }
        .cat-pill {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          cursor: pointer;
          color: var(--text-secondary);
          white-space: nowrap;
          transition: all 200ms;
        }
        .cat-pill.active {
          background: var(--text-primary);
          color: var(--bg-primary);
          border-color: var(--text-primary);
          font-weight: 600;
        }
        
        .formula-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .formula-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 1rem;
          padding: 1.5rem;
          position: relative;
          transition: transform 200ms, border-color 200ms;
        }
        .formula-card:hover {
          transform: translateY(-2px);
          border-color: var(--border-default);
        }
        
        .fc-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        .fc-category {
          font-size: 0.75rem;
          color: var(--accent-blue);
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }
        .fc-name {
          font-weight: 600;
          font-size: 1.1rem;
          color: var(--text-primary);
        }
        
        .fav-btn {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          opacity: 0.5;
          transition: opacity 200ms, transform 200ms;
        }
        .fav-btn:hover {
          opacity: 0.8;
          transform: scale(1.1);
        }
        .fav-btn.is-fav {
          opacity: 1;
          color: #f59e0b; /* yellow */
        }
        
        .fc-body {
          background: var(--bg-input);
          padding: 1rem;
          border-radius: 0.75rem;
          margin-bottom: 1rem;
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.2rem;
          color: var(--text-primary);
          border: 1px solid var(--border-subtle);
        }
        
        .fc-variables {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .var-tag {
          font-size: 0.75rem;
          background: rgba(255,255,255,0.05);
          padding: 0.2rem 0.5rem;
          border-radius: 0.25rem;
          color: var(--text-secondary);
        }
      `}</style>

      <div className="vault-header">
        <h1 className="vault-title">⚡ Formula Vault</h1>
        <p className="vault-subtitle">High-yield quantitative and reasoning cheat sheets.</p>
      </div>

      <div className="vault-controls">
        <input 
          className="vault-search"
          placeholder="Search formulas (e.g. Compound Interest)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="category-pills">
          {categories.map(cat => (
            <button
              key={cat}
              className={`cat-pill ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="formula-grid">
        {sortedFormulas.map(f => {
          const isFav = favorites.includes(f.id);
          return (
            <div key={f.id} className="formula-card">
              <div className="fc-header">
                <div>
                  <div className="fc-category">{f.category}</div>
                  <div className="fc-name">{f.name}</div>
                </div>
                <button 
                  className={`fav-btn ${isFav ? 'is-fav' : ''}`}
                  onClick={() => toggleFavorite(f.id)}
                  title={isFav ? "Remove from favorites" : "Add to favorites"}
                >
                  {isFav ? '⭐' : '☆'}
                </button>
              </div>
              
              <div className="fc-body">
                {f.content}
              </div>
              
              <div className="fc-variables">
                {Object.entries(f.variables).map(([k, v]) => (
                  <span key={k} className="var-tag">
                    <strong>{k}</strong> = {v}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
        {sortedFormulas.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No formulas found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
