import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import BookCard from "../components/BookCard";
import "./Home.css";

export default function Home() {
  const [books, setBooks]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [featured, setFeatured]       = useState(0);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [activeStep, setActiveStep]   = useState(0);
  const [filter, setFilter]           = useState("all");

  const VISIBLE = 3;

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/popular")
      .then(r => r.json())
      .then(data => { setBooks(data); setLoading(false); })
      .catch(() => { setError("Could not load books. Is Flask running?"); setLoading(false); });
  }, []);

  useEffect(() => {
    if (books.length === 0) return;
    const t = setInterval(() => {
      setFeatured(f => {
        const next = (f + 1) % Math.min(books.length, 10);
        setCarouselIdx(ci => {
          if (next < ci) return next;
          if (next >= ci + VISIBLE) return next - VISIBLE + 1;
          return ci;
        });
        return next;
      });
    }, 5000);
    return () => clearInterval(t);
  }, [books]);

  // Auto-cycle how-it-works steps
  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => (s + 1) % 3), 3000);
    return () => clearInterval(t);
  }, []);

  const prevCarousel = useCallback(() => setCarouselIdx(i => Math.max(0, i - 1)), []);
  const nextCarousel = useCallback(() => setCarouselIdx(i => Math.min(books.length - VISIBLE, i + 1)), [books.length]);

  const feat = books[featured] || null;

  // Rating buckets for filter tabs
  const filteredBooks = books.filter(b => {
    if (filter === "top-rated") return (b.rating ?? 0) >= 4;
    if (filter === "popular")   return (b.votes ?? 0) >= 1000;
    return true;
  });

  const steps = [
    { num: "01", icon: "🔍", title: "Search a Book",  desc: "Type any title you love. Our autocomplete shows matches instantly.", color: "#f5c518" },
    { num: "02", icon: "🤖", title: "AI Analyses",    desc: "Collaborative filtering scans 270K+ reader ratings to find your tribe.", color: "#2dd4bf" },
    { num: "03", icon: "🎯", title: "Get Matches",    desc: "Receive 4 hand-picked books with match scores, ranked just for you.", color: "#a78bfa" },
  ];

  return (
    <div className="home">

      {/* ═══ HERO ═══ */}
      <section className="hero-cinema">
        <div className="hero-cinema__bg">
          {feat
            ? <img key={feat.image} src={feat.image} alt="" className="hero-cinema__bg-img" />
            : <div className="hero-cinema__bg-placeholder" />}
          <div className="hero-cinema__overlay" />
        </div>

        <div className="hero-cinema__inner">
          <div className="hero-cinema__left">
            <div className="hero-cinema__progress">
              {(books.length > 0 ? books.slice(0,10) : Array(5).fill(null)).map((_,i) => (
                <button key={i}
                  className={`hero-cinema__progress-dot ${i===featured?"hero-cinema__progress-dot--active":""}`}
                  onClick={() => setFeatured(i)} />
              ))}
            </div>

            <div className="hero-cinema__info">
              {feat ? (<>
                <div className="hero-cinema__stars">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={`hero-cinema__star ${s<=Math.round(feat.rating??0)?"hero-cinema__star--on":""}`}>★</span>
                  ))}
                  <span className="hero-cinema__rating-num">{feat.rating?.toFixed(1)} / 5</span>
                </div>
                <h1 className="hero-cinema__title">{feat.title}</h1>
                <p className="hero-cinema__desc">by <em>{feat.author}</em> &nbsp;·&nbsp; {feat.votes?.toLocaleString()} readers</p>
                <div className="hero-cinema__btns">
                  <Link to="/recommend" className="hero-cinema__btn-watch">
                    <span className="hero-cinema__play-icon">▶</span>Get Recommendations
                  </Link>
                  <a href="#top50" className="hero-cinema__btn-info">Browse All Books</a>
                </div>
                <div className="hero-cinema__badge">Rank #{featured + 1}</div>
              </>) : (
                <div className="hero-cinema__info-skeleton">
                  <div className="skeleton" style={{width:130,height:18,borderRadius:6,marginBottom:20}}/>
                  <div className="skeleton" style={{width:"70%",height:52,borderRadius:8,marginBottom:14}}/>
                  <div className="skeleton" style={{width:"50%",height:16,borderRadius:6,marginBottom:32}}/>
                  <div style={{display:"flex",gap:12}}>
                    <div className="skeleton" style={{width:170,height:44,borderRadius:8}}/>
                    <div className="skeleton" style={{width:140,height:44,borderRadius:8}}/>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="hero-cinema__right">
            <div className="hero-cinema__carousel-head">
              <div className="hero-cinema__carousel-nav">
                <button className="hero-cinema__nav-btn" onClick={prevCarousel} disabled={carouselIdx===0}>‹</button>
                <span className="hero-cinema__nav-count">
                  {String(carouselIdx+1).padStart(2,"0")}
                  <span className="hero-cinema__nav-line"/>
                  {String(Math.min(books.length,50)).padStart(2,"0")}
                </span>
                <button className="hero-cinema__nav-btn" onClick={nextCarousel} disabled={carouselIdx>=books.length-VISIBLE}>›</button>
              </div>
            </div>
            <div className="hero-cinema__cards">
              {loading ? Array(VISIBLE).fill(0).map((_,i)=>(
                <div key={i} className="hero-cinema__card hero-cinema__card--skel">
                  <div className="skeleton" style={{width:"100%",height:"100%",borderRadius:12}}/>
                </div>
              )) : books.slice(carouselIdx,carouselIdx+VISIBLE).map((b,i)=>{
                const gIdx=carouselIdx+i;
                return (
                  <div key={b.title} className={`hero-cinema__card ${gIdx===featured?"hero-cinema__card--active":""}`} onClick={()=>setFeatured(gIdx)}>
                    <span className="hero-cinema__bookmark">🔖</span>
                    <img src={b.image} alt={b.title}/>
                    <div className="hero-cinema__card-info">
                      <span className="hero-cinema__card-ep">#{gIdx+1}</span>
                      <p className="hero-cinema__card-title">{b.title}</p>
                      <span className="hero-cinema__card-rating">★ {b.rating?.toFixed(1)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS — TIMELINE ═══ */}
      <section className="how-section" id="how-it-works">
        <div className="container">
          <div className="how-header">
            <div className="how-header__left">
              <span className="how-eyebrow">The Process</span>
              <h2 className="how-title">How It Works</h2>
            </div>
            <p className="how-header__right">
              Three elegant steps from a title you know<br/>to four you'll love.
            </p>
          </div>

          <div className="how-timeline">
            {/* Animated progress track */}
            <div className="how-track">
              <div className="how-track__line" />
              {steps.map((s,i) => (
                <div key={i} className={`how-track__node ${i===activeStep?"how-track__node--active":""} ${i<activeStep?"how-track__node--done":""}`}
                  style={{"--nc": s.color}}
                  onClick={() => setActiveStep(i)}>
                  <span className="how-track__num">{s.num}</span>
                </div>
              ))}
            </div>

            {/* Step cards — staggered layout */}
            <div className="how-cards">
              {steps.map((s,i) => (
                <div key={i}
                  className={`how-card ${i===activeStep?"how-card--active":""}`}
                  style={{"--hc": s.color, "--delay": `${i*120}ms`}}
                  onClick={() => setActiveStep(i)}>
                  <div className="how-card__top">
                    <span className="how-card__icon">{s.icon}</span>
                    <span className="how-card__badge" style={{background:`${s.color}18`,color:s.color,border:`1px solid ${s.color}40`}}>{s.num}</span>
                  </div>
                  <div className="how-card__accent" style={{background:s.color}}/>
                  <h3 className="how-card__title">{s.title}</h3>
                  <p className="how-card__desc">{s.desc}</p>
                  <div className={`how-card__progress ${i===activeStep?"how-card__progress--run":""}`} style={{"--pc":s.color}}/>
                </div>
              ))}
            </div>

            {/* Big feature panel for active step */}
            <div className="how-panel">
              <div className="how-panel__num" style={{color: steps[activeStep].color}}>
                {steps[activeStep].num}
              </div>
              <div className="how-panel__icon">{steps[activeStep].icon}</div>
              <h3 className="how-panel__title">{steps[activeStep].title}</h3>
              <p className="how-panel__desc">{steps[activeStep].desc}</p>
              <div className="how-panel__dots">
                {steps.map((_,i)=>(
                  <button key={i} className={`how-panel__dot ${i===activeStep?"how-panel__dot--on":""}`}
                    style={i===activeStep?{background:steps[activeStep].color}:{}}
                    onClick={()=>setActiveStep(i)}/>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TOP 50 — MAGAZINE LAYOUT ═══ */}
      <section className="top50-section" id="top50">
        <div className="container">

          <div className="top50-header">
            <div className="top50-header__left">
              <span className="top50-eyebrow">Community Picks</span>
              <h2 className="top50-title">Top 50 Books</h2>
              <p className="top50-sub">Ranked by ratings &amp; reader popularity</p>
            </div>
            <div className="top50-header__right">
              <div className="top50-filters">
                {[["all","All Books"],["top-rated","4★ & Above"],["popular","Most Voted"]].map(([v,l])=>(
                  <button key={v}
                    className={`top50-filter ${filter===v?"top50-filter--active":""}`}
                    onClick={()=>setFilter(v)}>{l}</button>
                ))}
              </div>
              <Link to="/recommend" className="top50-cta">Find Similar →</Link>
            </div>
          </div>

          {error && <div className="top50-error">⚠️ {error}</div>}

          {loading ? (
            <div className="magazine-grid">
              {/* Hero skeleton */}
              <div className="mag-hero-skel skeleton"/>
              {Array(7).fill(0).map((_,i)=>(
                <div key={i} className="mag-skel skeleton"/>
              ))}
            </div>
          ) : (
            <div className="magazine-grid">
              {/* Slot 0: Big hero card */}
              {filteredBooks[0] && (
                <div className="mag-hero">
                  <div className="mag-hero__img">
                    <img src={filteredBooks[0].image} alt={filteredBooks[0].title}/>
                    <div className="mag-hero__overlay"/>
                    <span className="mag-rank">#1</span>
                  </div>
                  <div className="mag-hero__body">
                    <p className="mag-author">{filteredBooks[0].author}</p>
                    <h3 className="mag-hero__title">{filteredBooks[0].title}</h3>
                    <div className="mag-hero__meta">
                      <span className="mag-stars">{"★".repeat(Math.round(filteredBooks[0].rating??0))}</span>
                      <span className="mag-rating">{filteredBooks[0].rating?.toFixed(1)}</span>
                      <span className="mag-votes">{filteredBooks[0].votes?.toLocaleString()} votes</span>
                    </div>
                    <Link to="/recommend" className="mag-hero__btn">Find Similar →</Link>
                  </div>
                </div>
              )}

              {/* Slots 1-4: medium cards in 2-col cluster */}
              <div className="mag-cluster">
                {filteredBooks.slice(1,5).map((b,i)=>(
                  <div key={i} className="mag-medium">
                    <div className="mag-medium__img">
                      <img src={b.image} alt={b.title}/>
                      <span className="mag-rank">#{i+2}</span>
                    </div>
                    <p className="mag-author">{b.author}</p>
                    <h4 className="mag-medium__title">{b.title}</h4>
                    <div className="mag-mini-meta">
                      <span className="mag-stars-sm">{"★".repeat(Math.round(b.rating??0))}</span>
                      <span>{b.rating?.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Slots 5-7: tall side column */}
              <div className="mag-side">
                {filteredBooks.slice(5,8).map((b,i)=>(
                  <div key={i} className="mag-side-card">
                    <div className="mag-side-card__img">
                      <img src={b.image} alt={b.title}/>
                      <span className="mag-rank">#{i+6}</span>
                    </div>
                    <div className="mag-side-card__info">
                      <p className="mag-author">{b.author}</p>
                      <h4>{b.title}</h4>
                      <span className="mag-stars-sm">{"★".repeat(Math.round(b.rating??0))}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rest: standard 6-col grid */}
              <div className="mag-rest">
                {filteredBooks.slice(8).map((b,i)=>(
                  <BookCard key={i} title={b.title} author={b.author} image={b.image}
                    rating={b.rating} votes={b.votes} rank={i+9} delay={Math.min(i*30,600)}/>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}