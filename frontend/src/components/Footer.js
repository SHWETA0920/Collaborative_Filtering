import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer__top">
        <div className="container footer__top-inner">

          {/* Brand col */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">🎬 Bibliophile</Link>
            <p className="footer__tagline">
              Discover your next great read through intelligent recommendations
              powered by collaborative filtering.
            </p>
            <div className="footer__built">
              <span className="footer__built-tag">Flask</span>
              <span className="footer__built-tag">React</span>
              <span className="footer__built-tag">ML</span>
            </div>
          </div>

          {/* Navigate */}
          <div className="footer__col">
            <h4>Navigate</h4>
            <Link to="/">Home</Link>
            <Link to="/recommend">Discover</Link>
            <a href="#top50">Popular Books</a>
            <a href="#how-it-works">How It Works</a>
          </div>

          {/* Features */}
          <div className="footer__col">
            <h4>Features</h4>
            <span>Top 50 Books</span>
            <span>AI Recommendations</span>
            <span>Match Score</span>
            <span>Reader Feedback</span>
          </div>

          {/* Contact */}
          <div className="footer__col">
            <h4>Contact</h4>
            <a href="mailto:hello@bibliophile.app">hello@bibliophile.app</a>
            <span>Built for book lovers</span>
          </div>

        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {new Date().getFullYear()} Bibliophile · All rights reserved</p>
          <div className="footer__bottom-links">
            <a href="#top50">Privacy</a>
            <a href="#top50">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}