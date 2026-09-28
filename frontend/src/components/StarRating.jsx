import React, { useState } from 'react';

export default function StarRating({ value = 5, onChange, readOnly = false, size = '1.4rem' }) {
  const [hovered, setHovered] = useState(null);

  const displayVal = hovered !== null ? hovered : value;

  return (
    <div
      className="star-rating"
      style={{ fontSize: size }}
      onMouseLeave={() => !readOnly && setHovered(null)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={`fa-solid fa-star ${star <= displayVal ? 'active' : ''}`}
          style={{
            cursor: readOnly ? 'default' : 'pointer',
            color: star <= displayVal ? 'var(--accent)' : '#cbd5e1',
            transition: 'color 0.15s ease, transform 0.15s ease'
          }}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onClick={() => !readOnly && onChange && onChange(star)}
        />
      ))}
    </div>
  );
}
