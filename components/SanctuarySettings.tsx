
import React from 'react';
import { UserProfileData, AppState } from '../types';

interface SanctuarySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Record<string, UserProfileData>;
  activeId: string;
  appState: AppState;
  onSwitchAccount: (id: string) => void;
  onAddAccount: () => void;
  onLogout: (id: string) => void;
  updateAppState: (updates: Partial<AppState>) => void;
}

const SanctuarySettings: React.FC<SanctuarySettingsProps> = ({ 
  isOpen, onClose, accounts, activeId, appState, 
  onSwitchAccount, onAddAccount, onLogout, updateAppState 
}) => {
  if (!isOpen) return null;

  // STRICT FILTER: Only show accounts that are part of the local registry, not the global OTHER_USERS constants.
  const ownedAccountIds = Object.keys(accounts);
  // Fix: Explicitly cast Object.values to UserProfileData[] to ensure correct inference of properties like id and identity
  const ownedAccounts = (Object.values(accounts) as UserProfileData[]).filter(acc => ownedAccountIds.includes(acc.id));

  const toggleAI = () => {
    updateAppState({ 
      aiSettings: { ...appState.aiSettings, enabled: !appState.aiSettings.enabled }
    });
  };

  const setPrivacyMode = (mode: 'redacted' | 'full') => {
    updateAppState({ 
      aiSettings: { ...appState.aiSettings, insightPrivacy: mode }
    });
  };

  return (
    <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-3xl flex flex-col p-8 overflow-y-auto no-scrollbar animate-in fade-in duration-700">
      <header className="flex justify-between items-center mb-16 shrink-0">
        <button onClick={onClose} className="p-4 bg-white/[0.03] rounded-full text-white/30 hover:text-white transition-all active:scale-90">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
        <div className="text-center">
          <h2 className="text-sm font-black uppercase tracking-[0.5em] text-white/80 italic">Sanctuary Control</h2>
          <p className="text-[8px] uppercase tracking-[0.4em] text-white/20 mt-1">Configuring Your Presence</p>
        </div>
        <div className="w-12" />
      </header>

      <div className="max-w-xl mx-auto w-full space-y-20 pb-32">
        {/* Account Switcher */}
        <section className="space-y-8">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-[10px] uppercase tracking-[0.6em] text-white/40 font-black">Active Anchors</h3>
            <button onClick={onAddAccount} className="text-[9px] uppercase tracking-widest text-white/60 hover:text-white transition-colors">+ Add Account</button>
          </div>
          <div className="space-y-4">
            {ownedAccounts.map((acc) => (
              <div 
                key={acc.id} 
                className={`p-6 rounded-[32px] border transition-all flex items-center justify-between ${acc.id === activeId ? 'bg-white/[0.03] border-white/20' : 'bg-transparent border-white/5 opacity-40 hover:opacity-100 hover:bg-white/[0.01]'}`}
              >
                <button 
                  onClick={() => onSwitchAccount(acc.id)}
                  className="flex items-center space-x-6 flex-1 text-left"
                >
                  <img src={acc.identity.avatar} className="w-12 h-12 rounded-full grayscale" alt="" />
                  <div>
                    <h4 className="text-sm font-bold text-white/90">{acc.identity.name}</h4>
                    <p className="text-[9px] uppercase tracking-widest text-white/20">{acc.identity.handle}</p>
                  </div>
                </button>
                <div className="flex items-center space-x-4">
                   {acc.id === activeId && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse mr-2" />}
                   <button 
                    onClick={() => onLogout(acc.id)}
                    className="p-3 text-white/10 hover:text-red-500/60 transition-colors"
                    title="Dissolve Link"
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                   </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Control Layer */}
        <section className="space-y-12 bg-white/[0.01] border border-white/[0.03] p-10 rounded-[56px]">
          <div className="text-center space-y-2">
            <h3 className="text-[10px] uppercase tracking-[0.6em] text-white/40 font-black">AI Resonance Core</h3>
            <p className="text-[8px] text-white/20 uppercase tracking-widest italic">Privacy & Governance</p>
          </div>
          
          <div className="space-y-8">
            <div className="flex items-center justify-between p-6 bg-white/[0.02] rounded-3xl border border-white/[0.05]">
              <div className="space-y-1 text-left">
                <h4 className="text-xs font-semibold text-white/80">AI Synthesis</h4>
                <p className="text-[8px] text-white/20 uppercase tracking-widest italic">Toggle all automated insights</p>
              </div>
              <button 
                onClick={toggleAI}
                className={`w-10 h-5 rounded-full relative transition-colors ${appState.aiSettings.enabled ? 'bg-white' : 'bg-white/5'}`}
              >
                <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${appState.aiSettings.enabled ? 'right-1 bg-black' : 'left-1 bg-white/20'}`} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="text-[8px] uppercase tracking-[0.4em] text-white/20 font-black px-4">Dataset Privacy</label>
              <div className="grid grid-cols-2 gap-4">
                 <button 
                   onClick={() => setPrivacyMode('redacted')}
                   className={`p-4 rounded-3xl border transition-all text-[9px] uppercase tracking-widest ${appState.aiSettings.insightPrivacy === 'redacted' ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/20'}`}
                 >
                   Metadata Only
                 </button>
                 <button 
                   onClick={() => setPrivacyMode('full')}
                   className={`p-4 rounded-3xl border transition-all text-[9px] uppercase tracking-widest ${appState.aiSettings.insightPrivacy === 'full' ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/20'}`}
                 >
                   Deep Context
                 </button>
              </div>
              <p className="text-[7px] text-white/10 italic text-center px-4 uppercase tracking-widest">'Metadata Only' redacts all personal text before processing.</p>
            </div>
          </div>
        </section>

        {/* Presence Settings */}
        <section className="space-y-12 bg-white/[0.01] border border-white/[0.03] p-10 rounded-[56px]">
          <h3 className="text-[10px] uppercase tracking-[0.6em] text-white/40 font-black text-center mb-4">Aperture Calibration</h3>
          
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex justify-between text-[9px] uppercase tracking-[0.3em] font-bold text-white/20">
                <span>Signal Intensity</span>
                <span>{appState.intensity}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={appState.intensity}
                onChange={(e) => updateAppState({ intensity: parseInt(e.target.value) })}
                className="w-full h-[1px] bg-white/10 appearance-none cursor-pointer accent-white"
              />
            </div>

            <div className="flex items-center justify-between p-6 bg-white/[0.02] rounded-3xl border border-white/[0.05]">
              <div className="space-y-1 text-left">
                <h4 className="text-xs font-semibold text-white/80">Transparency Hints</h4>
                <p className="text-[8px] text-white/20 uppercase tracking-widest italic">Show why signals are rising</p>
              </div>
              <button 
                onClick={() => updateAppState({ showTransparencyHints: !appState.showTransparencyHints })}
                className={`w-10 h-5 rounded-full relative transition-colors ${appState.showTransparencyHints ? 'bg-white' : 'bg-white/5'}`}
              >
                <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${appState.showTransparencyHints ? 'right-1 bg-black' : 'left-1 bg-white/20'}`} />
              </button>
            </div>
          </div>
        </section>

        <div className="pt-20 text-center space-y-4">
           <button 
             onClick={onClose}
             className="w-full py-6 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-[0.5em] text-white font-black hover:bg-white/10 transition-all active:scale-95"
           >
             Seal Sanctuary
           </button>
           <p className="text-[7px] uppercase tracking-[0.8em] text-white/10">Version 2.5.2 • Hardened AI Core</p>
        </div>
      </div>
    </div>
  );
};

export default SanctuarySettings;
