import React, { useState } from 'react';
import './RecommendCard.css';

export default function RecommendCard({ book, delay = 0 }) {
  const [feedback, setFeedback] = useState(null);
  const [sending,  setSending]  = useState(false);
  const [loaded,   setLoaded]   = useState(false);

  const sendFeedback = async (action) => {
    if (sending || feedback) return;
    setSending(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book: book.title, action }),
      });
      setFeedback(action);
    } finally {
      setSending(false);
    }
  };

  const fill = Math.min(book.final ?? 0, 100);

  return (
    <div className="rcard fade-up" style={{ animationDelay: `${delay}ms` }}>

      {/* Poster */}
      <div className="rcard__poster">
        {!loaded && <div className="skeleton rcard__poster-skel" />}
        <img
          src={book.image}
          alt={book.title}
          onLoad={() => setLoaded(true)}
          style={{ opacity: loaded ? 1 : 0 }}
        />

        {/* Score badge on image */}
        <div className="rcard__score-badge">
          <span className="rcard__score-num">{book.final}%</span>
          <span className="rcard__score-lbl">Match</span>
        </div>

        {/* Bottom gradient */}
        <div className="rcard__poster-grad" />
      </div>

      {/* Body */}
      <div className="rcard__body">

        <p className="rcard__author">{book.author}</p>
        <h3 className="rcard__title">{book.title}</h3>

        {book.why && (
          <p className="rcard__why">
            <span className="rcard__why-icon">💡</span> {book.why}
          </p>
        )}

        {/* Match bar */}
        <div className="rcard__bar-wrap">
          <div className="rcard__bar-labels">
            <span>Match Score</span>
            <strong>{book.final}%</strong>
          </div>
          <div className="rcard__bar">
            <div
              className="rcard__bar-fill"
              style={{ width: `${fill}%` }}
            />
          </div>
          <div className="rcard__bar-breakdown">
            <span>Base: {book.base}%</span>
            <span>·</span>
            <span>Feedback: {book.feedback > 0 ? '+' : ''}{book.feedback}</span>
            <span>·</span>
            <span>Popularity: +{book.popularity}</span>
          </div>
        </div>

        {/* Feedback actions */}
        <div className="rcard__actions">
          {!feedback ? (
            <>
              <button
                className={`rcard__btn rcard__btn--like ${feedback === 'like' ? 'rcard__btn--active' : ''}`}
                onClick={() => sendFeedback('like')}
                disabled={sending}
              >
                👍 Like
              </button>
              <button
                className={`rcard__btn rcard__btn--dislike ${feedback === 'dislike' ? 'rcard__btn--active' : ''}`}
                onClick={() => sendFeedback('dislike')}
                disabled={sending}
              >
                👎 Pass
              </button>
            </>
          ) : (
            <p className="rcard__feedback-msg">
              {feedback === 'like'
                ? "✓ Great! We'll show more like this."
                : "✓ Got it — we'll adjust your results."}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}