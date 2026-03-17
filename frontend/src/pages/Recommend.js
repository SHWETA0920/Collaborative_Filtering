import React, { useState, useEffect, useRef } from 'react';
import RecommendCard from '../components/RecommendCard';
import './Recommend.css';

const TAGS = ["Fiction","Mystery","Sci-Fi","Fantasy","Romance","Classic","Thriller"];

export default function Recommend() {
  const [query,     setQuery]    = useState('');
  const [titles,    setTitles]   = useState([]);
  const [filtered,  setFiltered] = useState([]);
  const [showDrop,  setShowDrop] = useState(false);
  const [results,   setResults]  = useState(null);
  const [loading,   setLoading]  = useState(false);
  const [error,     setError]    = useState('');
  const [searched,  setSearched] = useState('');
  const [tagHint,   setTagHint]  = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/titles')
      .then(r => r.json()).then(setTitles).catch(()=>{});
  }, []);

  useEffect(() => {
    if (query.length < 2) { setFiltered([]); return; }
    const q = query.toLowerCase();
    setFiltered(titles.filter(t => t.toLowerCase().includes(q)).slice(0,8));
  }, [query, titles]);

  const selectTitle = t => { setQuery(t); setFiltered([]); setShowDrop(false); };

  const handleSubmit = async e => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setError(''); setResults(null); setSearched(query);
    try {
      const res  = await fetch('http://127.0.0.1:5000/api/recommend', {
        method:'POST', credentials:'include',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ book: query }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Something went wrong.');
      else         setResults(data);
    } catch {
      setError('Could not connect to Flask. Is it running on port 5000?');
    } finally { setLoading(false); }
  };

  const handleTagClick = tag => { setTagHint(tag); };

  return (
    <div className="disc-page">

      {/* ═══════════════════════════════════════
          SPLIT HERO
      ═══════════════════════════════════════ */}
      <section className="disc-hero">

        {/* Left — dark panel with form */}
        <div className="disc-hero__left">
          <div className="disc-hero__left-inner">

            <div className="disc-label">
              <span className="disc-label__dot"/>
              AI-Powered Engine
            </div>

            <h1 className="disc-hero__title">
              Discover<br/>
              <em className="disc-hero__em">Your Next<br/>Great Read</em>
            </h1>

            <p className="disc-hero__sub">
              Type any book title. Our collaborative filtering model surfaces
              four reader-matched recommendations from 270K+ ratings.
            </p>

            {/* Genre hint tags */}
            <div className="disc-tags">
              {TAGS.map(t => (
                <button key={t}
                  className={`disc-tag ${tagHint===t?"disc-tag--on":""}`}
                  onClick={()=>handleTagClick(t)}>{t}</button>
              ))}
            </div>

            {/* Search form */}
            <div className="disc-search-wrap" ref={inputRef}>
              <form className="disc-search" onSubmit={handleSubmit}>
                <div className="disc-search__field">
                  <span className="disc-search__icon">🔍</span>
                  <input
                    type="text"
                    className="disc-search__input"
                    placeholder={tagHint ? `Search ${tagHint} books…` : "e.g. Harry Potter, The Great Gatsby…"}
                    value={query}
                    onChange={e=>{setQuery(e.target.value);setShowDrop(true);}}
                    onFocus={()=>setShowDrop(true)}
                    onBlur={()=>setTimeout(()=>setShowDrop(false),180)}
                    autoComplete="off"
                  />
                  {query && (
                    <button type="button" className="disc-search__clear"
                      onClick={()=>{setQuery('');setResults(null);setError('');}}>✕</button>
                  )}
                  {showDrop && filtered.length > 0 && (
                    <ul className="disc-dropdown">
                      {filtered.map(t=>(
                        <li key={t} onMouseDown={()=>selectTitle(t)}>
                          <span className="disc-dropdown__icon">📖</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button type="submit" className="disc-search__btn" disabled={loading||!query.trim()}>
                  {loading ? <span className="disc-spinner"/> : "Find Books ▶"}
                </button>
              </form>
            </div>

            {/* Stats strip */}
            <div className="disc-stats">
              {[["270K+","Ratings Analysed"],["50+","Curated Titles"],["4","Matches Per Search"]].map(([n,l])=>(
                <div key={l} className="disc-stat">
                  <strong>{n}</strong><span>{l}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Right — decorative stacked covers */}
        <div className="disc-hero__right">
          <div className="disc-hero__glow"/>
          <div className="disc-hero__grid-bg"/>
          <div className="disc-covers">
            {/* Placeholder book stack — will fill once titles load */}
            <div className="disc-cover disc-cover--back">
              <div className="disc-cover__inner" style={{background:"linear-gradient(135deg,#1a2e3f,#0b1a24)"}}/>
            </div>
            <div className="disc-cover disc-cover--mid">
              <div className="disc-cover__inner" style={{background:"linear-gradient(135deg,#122233,#1a2e3f)"}}/>
            </div>
            <div className="disc-cover disc-cover--front">
              <div className="disc-cover__inner disc-cover__inner--live" style={{background:"linear-gradient(135deg,#1e3a50,#122233)"}}>
                <div className="disc-cover__label">
                  <span>🤖</span>
                  <p>AI finds books<br/>based on your taste</p>
                </div>
              </div>
            </div>
            {/* Floating accent pills */}
            <div className="disc-float disc-float--1">Match Score 94%</div>
            <div className="disc-float disc-float--2">★ 4.8</div>
            <div className="disc-float disc-float--3">270K+ Ratings</div>
          </div>
        </div>

      </section>

      {/* ═══════════════════════════════════════
          RESULTS SECTION
      ═══════════════════════════════════════ */}
      <section className="disc-results">
        <div className="container">

          {error && (
            <div className="disc-error fade-up">
              <span>⚠️</span>
              <div><strong>Something went wrong</strong><p>{error}</p></div>
            </div>
          )}

          {loading && (
            <div className="disc-loading">
              <div className="disc-loading__inner">
                <div className="disc-loading__ring"/>
                <p>Analysing reading patterns…</p>
              </div>
              <div className="rec-grid">
                {Array(4).fill(0).map((_,i)=>(
                  <div key={i} className="rec-skel">
                    <div className="skeleton" style={{aspectRatio:"3/2",borderRadius:12,marginBottom:16}}/>
                    <div className="skeleton" style={{height:12,width:"40%",borderRadius:6,marginBottom:10}}/>
                    <div className="skeleton" style={{height:18,borderRadius:6,marginBottom:8}}/>
                    <div className="skeleton" style={{height:14,width:"80%",borderRadius:6}}/>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results && !loading && (
            <div className="disc-results-inner fade-up">
              <div className="disc-results-hdr">
                <div className="disc-results-hdr__left">
                  <span className="disc-results-eyebrow">Recommendations</span>
                  <h2 className="disc-results-title">Because you liked</h2>
                  <p className="disc-results-book">"{searched}"</p>
                </div>
                <div className="disc-results-hdr__right">
                  <div className="disc-results-badge">
                    <span>{results.length}</span> books found
                  </div>
                </div>
              </div>

              {/* Highlight first result */}
              {results.length > 0 && (
                <div className="disc-spotlight">
                  <div className="disc-spotlight__badge">Best Match</div>
                  <div className="disc-spotlight__inner">
                    <div className="disc-spotlight__img">
                      <img src={results[0].image} alt={results[0].title}/>
                    </div>
                    <div className="disc-spotlight__info">
                      <p className="disc-spotlight__author">{results[0].author}</p>
                      <h3 className="disc-spotlight__title">{results[0].title}</h3>
                      {results[0].why && <p className="disc-spotlight__why">💡 {results[0].why}</p>}
                      <div className="disc-spotlight__score">
                        <span className="disc-spotlight__score-num">{results[0].final}%</span>
                        <span className="disc-spotlight__score-lbl">Match Score</span>
                        <div className="disc-spotlight__bar">
                          <div className="disc-spotlight__bar-fill" style={{width:`${results[0].final}%`}}/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Remaining 3 in grid */}
              {results.length > 1 && (
                <>
                  <p className="disc-more-label">More Recommendations</p>
                  <div className="rec-grid">
                    {results.slice(1).map((book,i)=>(
                      <RecommendCard key={i} book={book} delay={i*120}/>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {!results && !loading && !error && (
            <div className="disc-empty fade-up">
              <div className="disc-empty__visual">
                <div className="disc-empty__orbit">
                  <div className="disc-empty__planet"/>
                  <div className="disc-empty__moon"/>
                </div>
                <span className="disc-empty__icon">📚</span>
              </div>
              <h3>Search any book to begin</h3>
              <p>Our AI analyses reading patterns across 270,000+ ratings to find books readers like you genuinely loved.</p>
            </div>
          )}

        </div>
      </section>

    </div>
  );
}