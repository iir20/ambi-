
import React from 'react';
import { SocialMode } from '../types';
import { MODE_CONFIGS } from '../constants';

interface NavigationProps {
  currentMode: SocialMode;
  setMode: (mode: SocialMode) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentMode, setMode }) => {
  const modes = [SocialMode.CONNECT, SocialMode.CREATE, SocialMode.THINK];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-28 bg-[#0A0A0A]/80 backdrop-blur-[40px] border-t border-white/[0.03] flex items-center justify-around px-8 z-[120]">
      {modes.map((mode) => {
        const isActive = currentMode === mode;
        const config = MODE_CONFIGS[mode];
        return (
          <button
            key={mode}
            onClick={() => setMode(mode)}
            className={`flex flex-col items-center justify-center transition-all duration-[1200ms] relative w-full group ${
              isActive ? 'scale-110' : 'opacity-20 hover:opacity-50'
            }`}
          >
            {isActive && (
              <div className="absolute -top-16 w-16 h-16 rounded-full blur-[30px] bg-white opacity-5 animate-pulse" />
            )}
            <span className={`text-[9px] font-black tracking-[0.6em] uppercase mb-3 transition-colors duration-1000 ${isActive ? config.textColor : 'text-white'}`}>
              {mode}
            </span>
            <div className={`w-[2px] h-[2px] rounded-full transition-all duration-[1500ms] ${isActive ? 'bg-white scale-[2] shadow-[0_0_10px_white]' : 'bg-transparent'}`} />
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;
