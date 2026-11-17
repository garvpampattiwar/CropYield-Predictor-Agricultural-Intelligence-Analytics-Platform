import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Sprout, Compass, Cpu, 
  Activity, Settings, ChevronLeft, ChevronRight, Leaf
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { language } = useAppStore();

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/predict', label: 'Predict Yield', icon: Sprout, highlight: true },
    { to: '/explore', label: 'Explore Data', icon: Compass },
    { to: '/model', label: 'Model Benchmarks', icon: Cpu },
    { to: '/monitor', label: 'Live Field Monitor', icon: Activity },
    { to: '/settings', label: 'Settings & About', icon: Settings },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 transition-all duration-200 z-30 select-none ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <NavLink to="/" className="flex items-center gap-2.5 overflow-hidden group">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 dark:bg-emerald-600 flex items-center justify-center text-white shrink-0 transition-transform group-hover:scale-105">
            <Leaf className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="font-semibold text-xs tracking-tight text-zinc-900 dark:text-zinc-100">
                CropYield
              </span>
              <span className="text-[10px] text-zinc-400 font-normal mt-0.5">
                Predictor AI
              </span>
            </div>
          )}
        </NavLink>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-2 rounded-control text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-zinc-100 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-50 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`
              }
            >
              <Icon 
                className={`h-4 w-4 shrink-0 transition-colors`}
                strokeWidth={1.8}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.highlight && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Metadata */}
      {!collapsed ? (
        <div className="p-3 m-2 rounded-control bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 text-[11px] text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center justify-between font-medium text-zinc-700 dark:text-zinc-300">
            <span>Model v1.0</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">R² 0.9809</span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
            Random Forest Ensemble
          </div>
        </div>
      ) : (
        <div className="py-3 flex justify-center text-zinc-400">
          <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
        </div>
      )}
    </aside>
  );
};
