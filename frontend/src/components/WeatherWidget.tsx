import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { CloudRain, Wind, Droplets, Gauge, SunMedium, CloudLightning } from 'lucide-react';

export const WeatherWidget: React.FC = () => {
  const { weather } = useAppStore();

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200';
    if (score < 60) return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200';
    return 'text-red-600 bg-red-50 dark:bg-red-950/40 border-red-200';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Field Agro-Meteorology</h3>
          <p className="text-xs text-slate-500">Real-time localized microclimate feed</p>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getRiskColor(weather.riskScore)}`}>
          Risk Score: {weather.riskScore}/100 (Low)
        </div>
      </div>

      {/* Main Temp & Atmospheric Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500">
            <SunMedium className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{weather.temp}°C</div>
            <div className="text-xs text-slate-500">{weather.condition}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-500">
            <Droplets className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{weather.humidity}%</div>
            <div className="text-xs text-slate-500">Relative Humidity</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-500">
            <CloudRain className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{weather.rainfall} mm</div>
            <div className="text-xs text-slate-500">Precipitation</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500">
            <Wind className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{weather.windSpeed} km/h</div>
            <div className="text-xs text-slate-500">Wind Velocity</div>
          </div>
        </div>
      </div>

      {/* 7-Day Mini Forecast Strip */}
      <div className="grid grid-cols-7 gap-1 pt-3 border-t border-slate-100 dark:border-slate-800">
        {weather.forecast.map((day, idx) => (
          <div key={idx} className="flex flex-col items-center py-1.5 px-1 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-center">
            <span className="text-[11px] font-semibold text-slate-500">{day.day}</span>
            <span className="my-1">
              {day.condition === 'Rain' ? (
                <CloudRain className="h-4 w-4 text-blue-500" />
              ) : day.condition === 'Sunny' ? (
                <SunMedium className="h-4 w-4 text-amber-500" />
              ) : (
                <SunMedium className="h-4 w-4 text-slate-400" />
              )}
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{day.tempMax}°</span>
            <span className="text-[10px] text-slate-400">{day.tempMin}°</span>
          </div>
        ))}
      </div>
    </div>
  );
};

