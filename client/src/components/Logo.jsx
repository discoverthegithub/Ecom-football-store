import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ 
  className = "h-11 sm:h-12", 
  showText = true, 
  textClassName = "text-xl sm:text-2xl font-bold uppercase tracking-wider text-slate-900" 
}) => {
  return (
    <Link to="/" className="flex items-center gap-3 group">
      {/* Modern Blue Monogram Icon */}
      <div className="relative flex items-center justify-center transition-all duration-300 group-hover:scale-105">
        <img 
          src="/logo.png" 
          alt="False Nine Logo" 
          className={`${className} w-auto object-contain rounded-xl transition-all duration-300`}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.nextSibling) {
              e.currentTarget.nextSibling.style.display = 'block';
            }
          }}
        />
        
        {/* Modern Vector Shield Monogram Fallback */}
        <svg 
          className={`hidden ${className} w-auto aspect-square`}
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="5" y="5" width="90" height="90" rx="20" fill="#2563EB" />
          <path 
            d="M30 28 H70 C75 28 78 32 78 37 V48 C78 53 75 57 70 57 H44 V72 C44 75 41 78 38 78 H30 V28 Z" 
            fill="#FFFFFF" 
          />
          <circle cx="56" cy="42.5" r="8" fill="#2563EB" />
        </svg>
      </div>

      {showText && (
        <span className={textClassName}>
          FALSE <span className="text-blue-600">NINE</span>
        </span>
      )}
    </Link>
  );
};

export default Logo;
