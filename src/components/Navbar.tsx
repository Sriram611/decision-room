import React from 'react';
import { AuthUserProfile } from '../types';
import { ShieldCheck, LogOut, Sparkles, Scale, History, LineChart, KeyRound, User } from 'lucide-react';

interface NavbarProps {
  user: AuthUserProfile | null;
  currentView: 'arena' | 'history' | 'insights' | 'new';
  onNavigate: (view: 'arena' | 'history' | 'insights' | 'new') => void;
  onSignOut: () => void;
  onOpenVault: () => void;
  hasActiveDecision: boolean;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentView,
  onNavigate,
  onSignOut,
  onOpenVault,
  hasActiveDecision,
  historyCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-white/5 bg-[#0A0A0B]/95 backdrop-blur-md shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div 
          id="nav-brand-logo"
          onClick={() => onNavigate(hasActiveDecision ? 'arena' : 'new')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            D
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-serif tracking-tight text-white uppercase">
                DECISION ROOM
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-white/5 text-slate-400 border border-white/10">
                Gemini 3.6 Flash
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Authenticated) */}
        {user && (
          <nav className="flex items-center gap-4 sm:gap-6 text-sm font-medium text-slate-400">
            <button
              id="nav-btn-arena"
              onClick={() => onNavigate(hasActiveDecision ? 'arena' : 'new')}
              className={`flex items-center gap-1.5 transition-colors py-1 ${
                currentView === 'arena' || currentView === 'new'
                  ? 'text-white font-semibold border-b-2 border-indigo-500'
                  : 'hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{hasActiveDecision ? 'Sessions' : 'New Session'}</span>
            </button>

            <button
              id="nav-btn-history"
              onClick={() => onNavigate('history')}
              className={`flex items-center gap-1.5 transition-colors py-1 relative ${
                currentView === 'history'
                  ? 'text-white font-semibold border-b-2 border-indigo-500'
                  : 'hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Library</span>
              {historyCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-semibold rounded-full bg-white/10 text-slate-300">
                  {historyCount}
                </span>
              )}
            </button>

            <button
              id="nav-btn-insights"
              onClick={() => onNavigate('insights')}
              className={`flex items-center gap-1.5 transition-colors py-1 ${
                currentView === 'insights'
                  ? 'text-white font-semibold border-b-2 border-indigo-500'
                  : 'hover:text-white'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Patterns</span>
            </button>
          </nav>
        )}

        {/* Vault & User Profile Actions */}
        <div className="flex items-center gap-3">
          {user && (
            <>
              {/* Vault Security Indicator Button */}
              <button
                id="btn-open-vault-indicator"
                onClick={onOpenVault}
                title="Client-Side AES-256 GCM Privacy Vault Active"
                className="hidden md:flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-full hover:bg-emerald-900/40 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>End-to-End Encrypted</span>
              </button>

              {/* User Avatar / Profile */}
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-white/10 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-semibold text-slate-200">
                    {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'US'}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-white max-w-[120px] truncate">
                    {user.displayName || 'Strategist'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {user.isAnonymous ? 'Guest Vault' : 'Verified ID'}
                  </div>
                </div>

                <button
                  id="btn-sign-out"
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
};
