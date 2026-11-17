import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, LayoutDashboard, Sprout, Compass, Cpu, 
  Activity, Settings, Download, Sun, Moon, ArrowRight, X 
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { api } from '../services/api';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { toggleTheme, setLanguage } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { id: 'p1', label: 'Overview', category: 'Navigation', icon: LayoutDashboard, action: () => { navigate('/'); onClose(); } },
    { id: 'p2', label: 'Predict Yield (Calculator)', category: 'Navigation', icon: Sprout, action: () => { navigate('/predict'); onClose(); } },
    { id: 'p3', label: 'Explore Dataset', category: 'Navigation', icon: Compass, action: () => { navigate('/explore'); onClose(); } },
    { id: 'p4', label: 'Model Benchmarks', category: 'Navigation', icon: Cpu, action: () => { navigate('/model'); onClose(); } },
    { id: 'p5', label: 'Live Field Monitor', category: 'Navigation', icon: Activity, action: () => { navigate('/monitor'); onClose(); } },
    { id: 'p6', label: 'Settings & About', category: 'Navigation', icon: Settings, action: () => { navigate('/settings'); onClose(); } },
    { id: 'a1', label: 'Download 12-Page Analysis Report (PDF)', category: 'Actions', icon: Download, action: () => { window.open(api.getPdfUrl(), '_blank'); onClose(); } },
    { id: 'a2', label: 'Toggle Light / Dark Theme', category: 'Actions', icon: Moon, action: () => { toggleTheme(); onClose(); } },
    { id: 'a3', label: 'Set Language to English', category: 'Language', action: () => { setLanguage('en'); onClose(); } },
    { id: 'a4', label: 'Set Language to Hindi (हिंदी)', category: 'Language', action: () => { setLanguage('hi'); onClose(); } },
    { id: 'a5', label: 'Set Language to Marathi (मराठी)', category: 'Language', action: () => { setLanguage('mr'); onClose(); } },
  ];

  const filtered = query.trim() === ''
    ? commands
    : commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()) || c.category.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 border-b border-zinc-200 dark:border-zinc-800">
          <Search className="h-4 w-4 text-zinc-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or jump to page... (ESC to exit)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-3.5 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 rounded text-zinc-400 hover:text-zinc-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-zinc-100 dark:divide-zinc-800/40">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-zinc-400">
              No matching commands or pages found
            </div>
          ) : (
            filtered.map((cmd) => {
              const Icon = cmd.icon || ArrowRight;
              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-zinc-400 group-hover:text-primary transition-colors" />
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">{cmd.label}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider">{cmd.category}</span>
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Navigation</span>
          <div className="flex items-center gap-2">
            <span>Use</span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono">↑↓</kbd>
            <span>to select</span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono">↵</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

