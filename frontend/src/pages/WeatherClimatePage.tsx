import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { 
  CloudSun, Droplets, Wind, CloudRain, Sun, AlertTriangle, 
  Flame, Waves, ShieldAlert, BarChart2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

export const WeatherClimatePage: React.FC = () => {
  const { weather } = useAppStore();

  const historicalRainfallData = [
    { month: 'Jun', historical: 110, current: 125 },
    { month: 'Jul', historical: 240, current: 220 },
    { month: 'Aug', historical: 210, current: 235 },
    { month: 'Sep', historical: 160, current: 145 },
    { month: 'Oct', historical: 65, current: 80 },
    { month: 'Nov', historical: 25, current: 18 },
  ];

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <CloudSun className="h-6 w-6 text-emerald-600" />
          Agro-Meteorology & Climate Risk Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          High-resolution 14-day weather forecasts, rainfall radar anomalies, and extreme climate risk indices
        </p>
      </div>

      {/* 3 Climate Risk Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Drought Deficit Index</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-500"><Flame className="h-4 w-4" /></div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">Low (18%)</div>
          <p className="text-[11px] text-slate-500 mt-1">Cumulative soil reservoir levels remain adequate for vegetative growth.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Flood / Waterlogging Risk</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-500"><Waves className="h-4 w-4" /></div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">Minimal (8%)</div>
          <p className="text-[11px] text-slate-500 mt-1">Free soil drainage capacity across black cotton parcels is normal.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Heatwave Stress Probability</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-500"><Sun className="h-4 w-4" /></div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">12%</div>
          <p className="text-[11px] text-slate-500 mt-1">Temperatures projected to stay below wheat critical threshold (32°C).</p>
        </div>
      </div>

      {/* Historical Precipitation Comparison Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
          Historical vs Current Season Precipitation (mm)
        </h3>
        <p className="text-xs text-slate-500 mb-4">Comparison with 30-year regional climatological baseline (IMD / NASA POWER)</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={historicalRainfallData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  fontSize: '11px', 
                  backgroundColor: '#0f172a', 
                  color: '#ffffff',
                  border: 'none'
                }} 
              />
              <Bar dataKey="historical" name="30-Yr Normal" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="current" name="2026 Observed" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

