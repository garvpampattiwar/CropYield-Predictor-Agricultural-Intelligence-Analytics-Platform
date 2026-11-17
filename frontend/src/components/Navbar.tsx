import React, { useState } from 'react';
import { Search, Sun, Moon, Globe, ChevronDown, Check, Command } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { CommandPalette } from './CommandPalette';

interface NavbarProps {
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCommandPalette }) => {
  const { 
    theme, toggleTheme, language, setLanguage, 
    selectedCrop, setSelectedCrop, selectedCountry, setSelectedCountry 
  } = useAppStore();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [internalCommandOpen, setInternalCommandOpen] = useState(false);

  const handleOpenSearch = () => {
    if (onOpenCommandPalette) {
      onOpenCommandPalette();
    } else {
      setInternalCommandOpen(true);
    }
  };

  return (
    <>
      <header className="h-14 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur sticky top-0 z-20 px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Left: Command Search Button */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            onClick={handleOpenSearch}
            className="w-full max-w-xs flex items-center justify-between px-3 py-1.5 rounded-control bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 text-xs text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-zinc-400" />
              <span>Search commands, crops, data...</span>
            </div>
            <div className="flex items-center gap-0.5 text-[10px] text-zinc-400 bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200/60 dark:border-zinc-700/60">
              <Command className="h-2.5 w-2.5" />
              <span>K</span>
            </div>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Filter: Country & Crop */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-100/60 dark:bg-zinc-900/60 px-2.5 py-1 rounded-control border border-zinc-200/60 dark:border-zinc-800/60">
            <span className="text-zinc-400">Context:</span>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-transparent font-medium focus:outline-none cursor-pointer"
            >
              <option value="India" className="dark:bg-zinc-900">India</option>
              <option value="United States" className="dark:bg-zinc-900">United States</option>
              <option value="Brazil" className="dark:bg-zinc-900">Brazil</option>
              <option value="France" className="dark:bg-zinc-900">France</option>
            </select>
            <span className="text-zinc-400">•</span>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="bg-transparent font-medium focus:outline-none cursor-pointer"
            >
              <option value="Wheat" className="dark:bg-zinc-900">Wheat</option>
              <option value="Potatoes" className="dark:bg-zinc-900">Potatoes</option>
              <option value="Maize" className="dark:bg-zinc-900">Maize</option>
              <option value="Rice, paddy" className="dark:bg-zinc-900">Rice</option>
            </select>
          </div>

          {/* Live Status Dot */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-control text-xs text-zinc-600 dark:text-zinc-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-live-dot absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="text-[11px] font-medium hidden sm:inline">Telemetry Live</span>
          </div>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-control text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <Globe className="h-3.5 w-3.5 text-zinc-500" />
              <span className="uppercase text-[11px]">{language}</span>
              <ChevronDown className="h-3 w-3 text-zinc-400" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-control shadow-md py-1 z-50 text-xs">
                {(['en', 'hi', 'mr'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { setLanguage(lang); setShowLangMenu(false); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between"
                  >
                    <span>{lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी (Hindi)' : 'मराठी (Marathi)'}</span>
                    {language === lang && <Check className="h-3 w-3 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-control text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-zinc-300" />}
          </button>
        </div>
      </header>

      {/* Command Palette Modal (fallback if not controlled by parent) */}
      {!onOpenCommandPalette && (
        <CommandPalette isOpen={internalCommandOpen} onClose={() => setInternalCommandOpen(false)} />
      )}
    </>
  );
};
