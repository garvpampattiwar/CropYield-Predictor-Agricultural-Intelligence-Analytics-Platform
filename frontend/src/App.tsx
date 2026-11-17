import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { CommandPalette } from './components/CommandPalette';
import { useAppStore } from './store/useAppStore';

// Redesigned Modern Calm Pages
import { OverviewPage } from './pages/OverviewPage';
import { PredictPage } from './pages/PredictPage';
import { ExplorePage } from './pages/ExplorePage';
import { ModelPage } from './pages/ModelPage';
import { LiveMonitorPage } from './pages/LiveMonitorPage';
import { SettingsAboutPage } from './pages/SettingsAboutPage';

export const App: React.FC = () => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { theme } = useAppStore();

  useEffect(() => {
    // Synchronize HTML dark mode class
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Global Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 antialiased selection:bg-emerald-500/20 selection:text-emerald-700 dark:selection:text-emerald-300">
        {/* Slim Collapsible Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Bar with Command Palette trigger & controls */}
          <Navbar onOpenCommandPalette={() => setCommandPaletteOpen(true)} />

          {/* Scrollable Page Viewport */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/predict" element={<PredictPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/model" element={<ModelPage />} />
              <Route path="/monitor" element={<LiveMonitorPage />} />
              <Route path="/settings" element={<SettingsAboutPage />} />
              {/* Fallback redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Global Command Palette Modal (Cmd+K) */}
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />
      </div>
    </BrowserRouter>
  );
};

export default App;
