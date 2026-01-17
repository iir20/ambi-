
import React from 'react';
import { getGlowIntensity, getPulseRate } from '../services/attention';

interface AttentionGlowProps {
  score: number;
  color?: string;
}

const AttentionGlow: React.FC<AttentionGlowProps> = ({ score, color = '#FFFFFF' }) => {
  const intensity = getGlowIntensity(score);
  const pulseRate = getPulseRate(score);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-[inherit]">
      {/* Background Glow */}
      <div 
        className="absolute inset-0 blur-[100px] transition-all duration-[3000ms]"
        style={{ 
          backgroundColor: color, 
          opacity: intensity 
        }} 
      />
      
      {/* Pulsing Rings */}
      <div className="absolute inset-0 flex items-center justify-center">
         {[1, 2].map((i) => (
           <div 
             key={i}
             className="absolute border border-white/5 rounded-full"
             style={{ 
               width: `${100 + i * 40}%`,
               height: `${100 + i * 40}%`,
               animation: `breathe ${pulseRate} ease-in-out infinite`,
               animationDelay: `${i * 2}s`
             }}
           />
         ))}
      </div>
    </div>
  );
};

export default AttentionGlow;
