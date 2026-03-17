import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">

        {/* Brand */}
        <Link to="/" className="navbar__brand">
          <span className="navbar__brand-icon">🎬</span>
          <span className="navbar__brand-text">Bibliophile</span>
        </Link>

        {/* Centre nav links */}
        <nav className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          <Link
            to="/"
            className={`navbar__link ${location.pathname === '/' ? 'navbar__link--active' : ''}`}
          >
            Series
          </Link>
          <Link
            to="/recommend"
            className={`navbar__link ${location.pathname === '/recommend' ? 'navbar__link--active' : ''}`}
          >
            Discover
          </Link>
          <a href="#top50"       className="navbar__link">Popular</a>
          <a href="#how-it-works" className="navbar__link">How It Works</a>
        </nav>

        {/* Right side */}
        <div className="navbar__right">
          <Link to="/recommend" className="navbar__cta">
            Find Books
          </Link>
          <button
            className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>

      </div>
    </header>
  );
}