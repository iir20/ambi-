
import React, { useMemo, useEffect, useState, useRef } from 'react';
// Fixed: Added SignalType to imports for proper typing of MapNode
import { UserProfileData, UserIdentity, UserSignal, SignalType } from '../types';
import { OTHER_USERS } from '../constants';
import { getDistance } from '../services/signals';

// Added missing ConnectionMapProps interface
interface ConnectionMapProps {
  currentUser: UserProfileData;
  onVisitUser: (id: string) => void;
}

interface MapNode {
  id: string;
  identity: UserIdentity;
  strength: number;
  lastActive: number;
  // Fixed: Changed type from string to SignalType for strict compatibility with UserSignal
  type: SignalType;
  isGhost: boolean;
  color: string;
  baseAngle: number;
  orbitSpeed: number;
  orbitRadius: number;
}

const ConnectionMap: React.FC<ConnectionMapProps> = ({ currentUser, onVisitUser }) => {
  const [time, setTime] = useState(0);
  const [showGhosts, setShowGhosts] = useState(true);
  const [focusMode, setFocusMode] = useState<'resonance' | 'recency' | 'resonance'>('resonance');
  const requestRef = useRef<number>(null);

  // Animation Loop
  const animate = (t: number) => {
    setTime(t / 1000);
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Spatial Layout Engine
  const nodes = useMemo(() => {
    const signals = currentUser.signals;
    if (!signals.length) return [];

    // Group signals into bands to prevent overcrowding
    const inner: UserSignal[] = [];
    const mutual: UserSignal[] = [];
    const drift: UserSignal[] = [];
    const ghosts: UserSignal[] = [];

    signals.forEach(s => {
      if (s.strength > 75) inner.push(s);
      else if (s.strength > 40) mutual.push(s);
      else if (s.strength > 10) drift.push(s);
      else ghosts.push(s);
    });

    const processBand = (band: UserSignal[], bandSpeed: number): MapNode[] => {
      return band.map((s, idx) => {
        const user = OTHER_USERS[s.userId] || Object.values(OTHER_USERS).find(u => u.id === s.userId);
        if (!user || user.mapVisibility === 'hidden') return null;

        // Base spatial metrics
        const strengthWeight = focusMode === 'resonance' ? s.strength : (1 - (Date.now() - s.lastActive) / (1000 * 60 * 60 * 24 * 7)) * 100;
        const orbitRadius = getDistance(strengthWeight);
        
        // Distribution angle + jitter to prevent perfect lines
        const angleStep = (Math.PI * 2) / band.length;
        const baseAngle = idx * angleStep + (Math.random() * 0.2);

        return {
          id: s.userId,
          identity: user.identity,
          strength: s.strength,
          lastActive: s.lastActive,
          type: s.type,
          isGhost: s.strength <= 10,
          color: user.identity.mood?.color || '#FFFFFF',
          baseAngle,
          orbitSpeed: bandSpeed * (0.8 + Math.random() * 0.4), // Slight speed variance
          orbitRadius
        };
      }).filter((n): n is MapNode => n !== null);
    };

    return [
      ...processBand(inner, 0.05),
      ...processBand(mutual, -0.08), // Reverse rotation for visual contrast
      ...processBand(drift, 0.12),
      ...processBand(ghosts, 0.2)
    ];
  }, [currentUser.signals, focusMode]);

  const filteredNodes = useMemo(() => {
    return showGhosts ? nodes : nodes.filter(n => !n.isGhost);
  }, [nodes, showGhosts]);

  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-[#0A0A0A] cursor-default select-none">
      {/* Dynamic Background Noise */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/20 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/10" />
      </div>

      {/* Connection SVG Layer (The Web) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-20">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g transform="translate(50% 50%)">
          {filteredNodes.map(node => {
            if (node.isGhost) return null;
            const currentAngle = node.baseAngle + (time * node.orbitSpeed);
            const x = Math.cos(currentAngle) * node.orbitRadius;
            const y = Math.sin(currentAngle) * node.orbitRadius;
            
            // Pulse opacity based on signal strength
            const opacity = (node.strength / 100) * 0.5;
            
            return (
              <line 
                key={`line-${node.id}`} 
                x1="0" y1="0" x2={x} y2={y} 
                stroke={node.color} 
                strokeWidth={node.strength > 75 ? "1" : "0.5"} 
                strokeOpacity={opacity}
                strokeDasharray={node.strength < 40 ? "5 5" : "none"}
              />
            );
          })}
        </g>
      </svg>

      {/* Interactive Controls Overlay */}
      <div className="absolute top-12 left-8 z-[100] space-y-4 animate-in fade-in slide-in-from-left-4 duration-1000">
         <div className="space-y-1">
            <h2 className="text-xl font-serif italic text-white/90">The Nexus</h2>
            <p className="text-[8px] uppercase tracking-[0.6em] text-white/20 font-black">Spatial Resonance Mapping</p>
         </div>
         
         <div className="flex flex-col space-y-2 pt-4">
            <button 
              onClick={() => setFocusMode(focusMode === 'resonance' ? 'recency' : 'resonance')}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[8px] uppercase tracking-widest text-white/40 hover:text-white transition-all flex items-center space-x-2"
            >
              <div className={`w-1 h-1 rounded-full ${focusMode === 'resonance' ? 'bg-white' : 'bg-transparent border border-white/40'}`} />
              <span>Mode: {focusMode}</span>
            </button>
            <button 
              onClick={() => setShowGhosts(!showGhosts)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[8px] uppercase tracking-widest text-white/40 hover:text-white transition-all flex items-center space-x-2"
            >
              <div className={`w-1 h-1 rounded-full ${showGhosts ? 'bg-white' : 'bg-transparent border border-white/40'}`} />
              <span>Shrouded Ghosts: {showGhosts ? 'On' : 'Off'}</span>
            </button>
         </div>
      </div>

      {/* The Central Anchor */}
      <div className="relative z-20 w-20 h-20 rounded-full border border-white/20 p-1.5 flex items-center justify-center bg-black/40 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 rounded-full bg-white/5 animate-ping opacity-20" />
        <img 
          src={currentUser.identity.avatar} 
          className="w-full h-full rounded-full grayscale object-cover" 
          alt="Self" 
        />
      </div>

      {/* Nodes Container */}
      <div className="absolute inset-0 pointer-events-none">
        {filteredNodes.map(node => {
          const currentAngle = node.baseAngle + (time * node.orbitSpeed);
          const x = Math.cos(currentAngle) * node.orbitRadius;
          const y = Math.sin(currentAngle) * node.orbitRadius;
          
          // Visual decay calculation
          const daysSince = (Date.now() - node.lastActive) / (1000 * 60 * 60 * 24);
          const decayBlur = Math.min(4, daysSince / 2);
          const decayOpacity = Math.max(0.1, node.strength / 100);

          return (
            <div 
              key={node.id}
              className="absolute top-1/2 left-1/2 pointer-events-auto"
              style={{ 
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                willChange: 'transform'
              }}
            >
              <button
                onClick={() => onVisitUser(node.id)}
                className="relative group focus:outline-none"
              >
                {/* Orbital Path (Visual Guide) */}
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.02] pointer-events-none"
                  style={{ width: node.orbitRadius * 2, height: node.orbitRadius * 2, transform: `translate(${-x}px, ${-y}px)` }}
                />

                {/* Glow Aura */}
                <div 
                  className="absolute -inset-6 rounded-full blur-xl transition-all duration-1000 opacity-20 group-hover:opacity-80"
                  style={{ backgroundColor: node.color, filter: `blur(${10 + decayBlur * 4}px)` }}
                />
                
                {/* Node Body */}
                <div 
                  className={`relative rounded-full border transition-all duration-700 overflow-hidden bg-black flex items-center justify-center ${
                    node.isGhost 
                      ? 'w-6 h-6 border-white/5 opacity-30 grayscale' 
                      : node.strength > 75 
                        ? 'w-12 h-12 border-white/40 group-hover:scale-125' 
                        : 'w-10 h-10 border-white/10 group-hover:scale-125'
                  }`}
                  style={{ 
                    filter: `blur(${decayBlur}px)`,
                    opacity: decayOpacity
                  }}
                >
                  {(!node.isGhost || node.strength > 5) ? (
                    <img 
                      src={node.identity.avatar} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                      alt="" 
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center text-[5px] text-white/20 font-black">GHOST</div>
                  )}
                </div>

                {/* Tooltip Info */}
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 scale-90 group-hover:scale-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white">{node.isGhost ? 'Ephemeral Echo' : node.identity.name}</p>
                  <p className="text-[7px] uppercase tracking-widest text-white/40 text-center">{Math.round(node.strength)}% Resonance</p>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Legend & Stats Overlay */}
      <div className="absolute bottom-12 right-12 z-[100] text-right space-y-1 opacity-20">
         <p className="text-[7px] uppercase tracking-[0.4em] font-black">Signals Detected: {nodes.length}</p>
         <p className="text-[7px] uppercase tracking-[0.4em] font-black">Nexus Density: {nodes.length > 50 ? 'High' : 'Stable'}</p>
      </div>
    </div>
  );
};

export default ConnectionMap;
