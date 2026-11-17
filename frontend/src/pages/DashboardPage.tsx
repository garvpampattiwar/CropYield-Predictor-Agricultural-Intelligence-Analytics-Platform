import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { StatCard } from '../components/StatCard';
import { WeatherWidget } from '../components/WeatherWidget';
import { SensorTable } from '../components/SensorTable';
import { InteractiveFieldMap } from '../components/InteractiveFieldMap';
import { 
  Sprout, ShieldCheck, MapPin, AlertTriangle, Sparkles, 
  TrendingUp, Activity, Droplets, ArrowRight, Zap, Info
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { fields, activeFieldId, weather, alerts } = useAppStore();
  const activeField = fields.find(f => f.id === activeFieldId) || fields[0];

  // Yield forecast multi-season projection data with 95% confidence band
  const forecastChartData = [
    { season: '2020', actual: 3.10, predicted: 3.12, lowerCI: 2.85, upperCI: 3.39 },
    { season: '2021', actual: 3.25, predicted: 3.22, lowerCI: 2.95, upperCI: 3.49 },
    { season: '2022', actual: 2.95, predicted: 3.01, lowerCI: 2.74, upperCI: 3.28 },
    { season: '2023', actual: 3.38, predicted: 3.35, lowerCI: 3.08, upperCI: 3.62 },
    { season: '2024 (Harvest)', actual: 3.45, predicted: 3.42, lowerCI: 3.15, upperCI: 3.69 },
    { season: '2025 (Forecast)', actual: null, predicted: 3.58, lowerCI: 3.28, upperCI: 3.88 },
    { season: '2026 (Optimal)', actual: null, predicted: 3.72, lowerCI: 3.38, upperCI: 4.06 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:16px_16px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="h-4 w-4" /> Realtime Agricultural Intelligence
            </div>
            <h1 className="text-2xl font-black mt-1">Farm Overview: {activeField.name}</h1>
            <p className="text-xs text-emerald-100 mt-1">
              Cultivating <b>{activeField.crop}</b> ({activeField.variety}) • {activeField.areaHa} Hectares • Sown on {activeField.sowingDate}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur border border-white/20 px-3 py-2 rounded-xl text-xs">
              <span className="text-emerald-200 block text-[10px] uppercase font-bold">Health Status</span>
              <span className="font-extrabold text-white flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {activeField.status} (NDVI {activeField.ndvi})
              </span>
            </div>
            <a
              href="/predict"
              className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              Run Scenario <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Predicted Yield"
          value={activeField.predictedYield}
          unit="t/ha"
          change={6.4}
          icon={Sprout}
          color="emerald"
          sparklineData={[2.8, 3.1, 3.0, 3.2, 3.4, 3.45]}
        />
        <StatCard
          title="Model Confidence"
          value="98.1"
          unit="%"
          change={0.4}
          icon={ShieldCheck}
          color="emerald"
          sparklineData={[96.5, 97.2, 97.8, 98.0, 98.1]}
        />
        <StatCard
          title="Active Fields"
          value={fields.length}
          unit="parcels"
          change={12.5}
          icon={MapPin}
          color="blue"
          sparklineData={[1, 2, 2, 3, 3]}
        />
        <StatCard
          title="Weather Risk"
          value={weather.riskScore}
          unit="/100"
          change={-8.2}
          icon={AlertTriangle}
          color="amber"
          sparklineData={[42, 38, 35, 30, 28]}
        />
        <StatCard
          title="Soil Health Index"
          value="84"
          unit="/100"
          change={3.2}
          icon={Activity}
          color="purple"
          sparklineData={[78, 80, 81, 83, 84]}
        />
      </div>

      {/* Main Grid: Weather Widget & Field Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-6">
          <WeatherWidget />

          {/* AI Insights Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">AI Agronomic Actionable Insights</h3>
              </div>
              <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 px-2 py-0.5 rounded-full">
                Updated Realtime
              </span>
            </div>

            <div className="mt-3 space-y-3">
              <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs">
                <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center justify-between">
                  <span>Irrigate South Block (B2) in 36 Hours</span>
                  <span className="text-[10px] bg-amber-200 dark:bg-amber-800 px-1.5 py-0.5 rounded font-black">HIGH</span>
                </div>
                <p className="text-amber-800/80 dark:text-amber-300/80 mt-1 text-[11px]">
                  Soil capacitive moisture dropped to 24.2%. Applying 22mm sprinkler cycle will safeguard tuber bulking stage.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs">
                <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
                  <span>Optimal Top-Dressing Window</span>
                  <span className="text-[10px] bg-emerald-200 dark:bg-emerald-800 px-1.5 py-0.5 rounded font-black">ACTION</span>
                </div>
                <p className="text-emerald-800/80 dark:text-emerald-300/80 mt-1 text-[11px]">
                  North Block (Wheat A1) nitrogen ratio is 120 kg/ha. Scheduled vegetative urea dose (40 kg/ha) recommended tomorrow before rain.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-xs">
                <div className="font-bold text-sky-900 dark:text-sky-200 flex items-center justify-between">
                  <span>Pest & Blight Alert: Low Fungal Risk</span>
                  <span className="text-[10px] bg-sky-200 dark:bg-sky-800 px-1.5 py-0.5 rounded font-black">SAFE</span>
                </div>
                <p className="text-sky-800/80 dark:text-sky-300/80 mt-1 text-[11px]">
                  Microclimate humidity at 62% remains below the spore germination trigger (78%). No fungicide required.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <InteractiveFieldMap />

          {/* Yield Forecast Line Chart with Confidence Band */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Yield Trajectory & 95% Confidence Band</h3>
                <p className="text-xs text-slate-500">Actual harvest records vs ML forecasted projection (t/ha)</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-600"></span> Actual / Predicted
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-300"></span> 95% Confidence Interval
                </span>
              </div>
            </div>

            <div className="h-64 mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="season" tick={{ fontSize: 11 }} />
                  <YAxis domain={[2.0, 4.5]} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      backgroundColor: '#0f172a', 
                      color: '#ffffff',
                      border: 'none'
                    }} 
                  />
                  {/* Confidence Band */}
                  <Area
                    type="monotone"
                    dataKey="upperCI"
                    stroke="none"
                    fill="#10b981"
                    fillOpacity={0.15}
                  />
                  <Area
                    type="monotone"
                    dataKey="lowerCI"
                    stroke="none"
                    fill="#10b981"
                    fillOpacity={0.0}
                  />
                  {/* Predicted Line */}
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fill="url(#colorYield)"
                    fillOpacity={0.25}
                  />
                  <defs>
                    <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sensor Telemetry Table */}
      <SensorTable />
    </div>
  );
};

