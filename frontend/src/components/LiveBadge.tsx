import React from 'react';
import { useAppStore } from '../store/useAppStore';

export const LiveBadge: React.FC = () => {
  const { isLive, connectionStatus, lastUpdated } = useAppStore();

  return (
    <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 rounded-full text-xs font-medium text-emerald-800 dark:text-emerald-300">
      <span className="relative flex h-2 w-2">
        {connectionStatus === 'online' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${
          connectionStatus === 'online' ? 'bg-emerald-500' : connectionStatus === 'reconnecting' ? 'bg-amber-500' : 'bg-red-500'
        }`}></span>
      </span>
      <span>{connectionStatus === 'online' ? 'Live Telemetry' : connectionStatus}</span>
      <span className="text-emerald-600 dark:text-emerald-400 text-[10px] hidden sm:inline">• {lastUpdated}</span>
    </div>
  );
};

