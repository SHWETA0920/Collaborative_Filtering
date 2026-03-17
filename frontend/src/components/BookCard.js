import React, { useState } from 'react';
import './BookCard.css';

function Stars({ rating }) {
  const full = Math.floor(rating ?? 0);
  return (
    <div className="bc-stars">
      {[1,2,3,4,5].map(s => (
        <span key={s} className={`bc-star ${s <= full ? 'bc-star--on' : ''}`}>★</span>
      ))}
    </div>
  );
}

export default function BookCard({ title, author, image, rating, votes, rank, delay = 0 }) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="bc"
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover */}
      <div className="bc__cover">
        {!loaded && <div className="skeleton bc__cover-skel" />}
        <img
          src={image}
          alt={title}
          onLoad={() => setLoaded(true)}
          style={{ opacity: loaded ? 1 : 0 }}
        />

        {/* Rank badge */}
        {rank && <span className="bc__rank">#{rank}</span>}

        {/* Hover overlay */}
        <div className={`bc__hover-overlay ${hovered ? 'bc__hover-overlay--show' : ''}`}>
          <div className="bc__hover-content">
            <div className="bc__hover-rating">
              <span className="bc__hover-star">★</span>
              <span>{rating?.toFixed(1)}</span>
            </div>
            <p className="bc__hover-votes">{votes?.toLocaleString()} ratings</p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bc__info">
        <p className="bc__author">{author}</p>
        <h3 className="bc__title">{title}</h3>
        <div className="bc__footer">
          <Stars rating={rating ?? 0} />
        </div>
      </div>
    </div>
  );
}