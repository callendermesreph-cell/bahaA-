import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

interface HeaderProps {
  currentDate: string;
}

export const Header: React.FC<HeaderProps> = ({ currentDate }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Logo Area - Fixed to 12x12 (3rem / 48px) square as requested */}
          <div className="h-12 w-12 relative flex items-center justify-center shrink-0">
            {!imgError ? (
              <img 
                src="logo.png" 
                alt="bahaAİ Logo" 
                className="h-full w-full object-contain drop-shadow-md"
                onError={() => setImgError(true)}
              />
            ) : (
              /* Fallback Logo */
              <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-blue-900 rounded-xl flex items-center justify-center shadow-lg border border-primary-400/30">
                <span className="text-white font-bold text-lg">B</span>
              </div>
            )}
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
              baha<span className="text-primary-400">Aİ</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide uppercase hidden sm:block">
              The Intelligence Briefing
            </p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-2 bg-slate-900 py-1.5 px-3 rounded-full border border-slate-800">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-300 font-medium">{currentDate}</span>
        </div>
      </div>
    </header>
  );
};