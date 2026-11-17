import React, { useState, useEffect } from 'react';
import { DemoBadge } from '../components/DemoBadge';
import { api, TelemetryReading } from '../services/api';
import { 
  Activity, Droplets, Thermometer, FlaskConical, 
  Wifi, AlertCircle, CheckCircle2, Shield, Radio, RefreshCw, Play, Pause
} from 'lucide-react';
import {
  LineChart, Line, ResponsiveContainer, YAxis
} from 'recharts';

export const LiveMonitorPage: React.FC = () => {
  const [reading, setReading] = useState<TelemetryReading>({
    timestamp: new Date().toLocaleTimeString(),
    field_name: 'Gangetic Valley Sector 4B',
    soil_moisture_pct: 34.2,
    soil_ph: 6.45,
    soil_temp_c: 22.1,
    nitrogen_kg_ha: 135,
    phosphorus_kg_ha: 48,
    potassium_kg_ha: 160,
    status: 'Optimal',
    is_demo_data: true
  });

  const [history, setHistory] = useState<{ time: string; moisture: number; temp: number; ph: number }[]>([
    { time: '18:10', moisture: 33.8, temp: 21.8, ph: 6.40 },
    { time: '18:14', moisture: 34.0, temp: 21.9, ph: 6.42 },
    { time: '18:18', moisture: 34.1, temp: 22.0, ph: 6.44 },
    { time: '18:22', moisture: 34.2, temp: 22.1, ph: 6.45 },
  ]);

  const [flashing, setFlashing] = useState(false);
  const [connected, setConnected] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Alerts feed
  const [alerts, setAlerts] = useState<{ id: string; time: string; type: 'info' | 'warning' | 'success'; message: string }[]>([
    { id: '1', time: '18:20:15', type: 'success', message: 'Soil moisture steady at 34.2% within target saturation range (30–45%)' },
    { id: '2', time: '18:16:40', type: 'info', message: 'Soil temperature optimal at 22.1°C; microbial nitrogen mineralization active' },
    { id: '3', time: '18:12:00', type: 'info', message: 'Sensor node telemetry heartbeat verified on LoRaWAN frequency 868 MHz' },
  ]);

  const triggerManualProbe = async () => {
    try {
      const data = await api.getTelemetry();
      handleNewReading(data);
    } catch {
      const now = new Date().toLocaleTimeString();
      const newMoist = Number((33 + Math.random() * 4).toFixed(1));
      const newTemp = Number((21.8 + Math.random() * 1.2).toFixed(1));
      const newPh = Number((6.40 + Math.random() * 0.20).toFixed(2));

      const newReading: TelemetryReading = {
        timestamp: now,
        field_name: 'Gangetic Valley Sector 4B',
        soil_moisture_pct: newMoist,
        soil_ph: newPh,
        soil_temp_c: newTemp,
        nitrogen_kg_ha: Math.round(132 + Math.random() * 10),
        phosphorus_kg_ha: Math.round(48 + Math.random() * 5),
        potassium_kg_ha: Math.round(158 + Math.random() * 8),
        status: 'Optimal',
        is_demo_data: true
      };
      handleNewReading(newReading);
    }
  };

  // Connect to telemetry stream (WS or fallback simulation)
  useEffect(() => {
    let ws: WebSocket | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;
    let wsActive = false;

    if (!isPaused) {
      try {
        ws = new WebSocket(api.getWebSocketUrl());
        ws.onopen = () => {
          setConnected(true);
          wsActive = true;
          if (fallbackInterval) clearInterval(fallbackInterval);
        };
        ws.onmessage = (event) => {
          try {
            const data: TelemetryReading = JSON.parse(event.data);
            handleNewReading(data);
          } catch (e) {}
        };
        ws.onerror = () => {
          wsActive = false;
        };
      } catch (e) {
        wsActive = false;
      }

      // 4-second simulated ticker as reliable fallback/driver
      fallbackInterval = setInterval(() => {
        if (!wsActive && !isPaused) {
          triggerManualProbe();
        }
      }, 4000);
    }

    return () => {
      if (ws) ws.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [isPaused]);

  const handleNewReading = (data: TelemetryReading) => {
    setReading(data);
    setFlashing(true);
    setTimeout(() => setFlashing(false), 800);

    setHistory((prev) => {
      const updated = [
        ...prev.slice(-15),
        { time: data.timestamp.slice(-5), moisture: data.soil_moisture_pct, temp: data.soil_temp_c, ph: data.soil_ph }
      ];
      return updated;
    });

    if (data.status === 'Attention Required') {
      setAlerts((prev) => [
        {
          id: Math.random().toString(),
          time: data.timestamp,
          type: 'warning',
          message: `Soil moisture dropped to ${data.soil_moisture_pct}%: drip pulse recommended.`
        },
        ...prev.slice(0, 7)
      ]);
    }
  };

  return (
    <div className="space-y-6 max-w-[1280px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-title text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
              Live Field Sensor Monitor
            </h1>
            <DemoBadge />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Realtime IoT telemetry stream broadcasting agroclimatic rhizosphere readings every 4 seconds
          </p>
        </div>

        {/* Interactive Controls & Status */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors"
          >
            {isPaused ? <Play className="h-3.5 w-3.5 text-emerald-600" /> : <Pause className="h-3.5 w-3.5 text-amber-500" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            onClick={triggerManualProbe}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-primary hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Poll Node Now</span>
          </button>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <span className={`h-2 w-2 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></span>
            <span>{isPaused ? 'Paused' : 'Live (4s)'}</span>
          </div>
        </div>
      </div>

      {/* Field Connection Status Banner */}
      <div className="card-subtle p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/80 dark:bg-zinc-900/40">
        <div className="flex items-center gap-3 text-xs">
          <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
            <Radio className="h-4 w-4" />
          </div>
          <div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
              Field Station: {reading.field_name}
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              Last packet: {reading.timestamp} · Signal: -78 dBm (LoRaWAN)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-zinc-500">Rhizosphere Condition:</span>
          <span className="px-2 py-0.5 rounded font-mono font-medium text-[11px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            {reading.status}
          </span>
        </div>
      </div>

      {/* 3 Realtime Sensor Cards with Sparklines & Highlight on Update */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Soil Moisture */}
        <div className={`card-subtle p-5 transition-all duration-300 ${
          flashing ? 'border-emerald-500 ring-1 ring-emerald-500/30' : ''
        }`}>
          <div className="flex items-center justify-between text-xs mb-1">
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-medium">
              <Droplets className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Volumetric Soil Moisture</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Target: 30–45%</span>
          </div>

          <div className="flex items-baseline gap-2 my-2">
            <span className="num-tabular text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              {reading.soil_moisture_pct.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-zinc-500">% VWC</span>
          </div>

          {/* Sparkline */}
          <div className="h-12 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
                <Line
                  type="monotone"
                  dataKey="moisture"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[10px] text-zinc-400 font-mono mt-1 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
            <span>Historical sparkline</span>
            <span>Realtime updates</span>
          </div>
        </div>

        {/* Soil pH */}
        <div className={`card-subtle p-5 transition-all duration-300 ${
          flashing ? 'border-emerald-500 ring-1 ring-emerald-500/30' : ''
        }`}>
          <div className="flex items-center justify-between text-xs mb-1">
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-medium">
              <FlaskConical className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Soil Acidity / pH Level</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Neutral: 6.2–6.8</span>
          </div>

          <div className="flex items-baseline gap-2 my-2">
            <span className="num-tabular text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              {reading.soil_ph.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-zinc-500">pH Index</span>
          </div>

          {/* Sparkline */}
          <div className="h-12 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <YAxis domain={['dataMin - 0.2', 'dataMax + 0.2']} hide />
                <Line
                  type="monotone"
                  dataKey="ph"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[10px] text-zinc-400 font-mono mt-1 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
            <span>Historical sparkline</span>
            <span>Optimal nutrient solubility</span>
          </div>
        </div>

        {/* Soil Temperature */}
        <div className={`card-subtle p-5 transition-all duration-300 ${
          flashing ? 'border-emerald-500 ring-1 ring-emerald-500/30' : ''
        }`}>
          <div className="flex items-center justify-between text-xs mb-1">
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-medium">
              <Thermometer className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Rhizosphere Temperature</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Optimal: 18–24°C</span>
          </div>

          <div className="flex items-baseline gap-2 my-2">
            <span className="num-tabular text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              {reading.soil_temp_c.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-zinc-500">°C</span>
          </div>

          {/* Sparkline */}
          <div className="h-12 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                <Line
                  type="monotone"
                  dataKey="temp"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[10px] text-zinc-400 font-mono mt-1 pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
            <span>Historical sparkline</span>
            <span>Root zone thermal probe</span>
          </div>
        </div>
      </div>

      {/* Row: Macro Nutrient Levels + Alert Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* N-P-K Macro Nutrients */}
        <div className="lg:col-span-5 card-subtle p-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Soil N-P-K Mineral Density
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Spectroscopic soil nutrient estimate (kg/ha)
              </p>
            </div>
            <DemoBadge />
          </div>

          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-600 dark:text-zinc-400 font-medium">Nitrogen (N)</span>
                <span className="num-tabular font-mono text-zinc-900 dark:text-zinc-100 font-semibold">
                  {reading.nitrogen_kg_ha} kg/ha (Optimal)
                </span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (reading.nitrogen_kg_ha / 200) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-600 dark:text-zinc-400 font-medium">Phosphorus (P)</span>
                <span className="num-tabular font-mono text-zinc-900 dark:text-zinc-100 font-semibold">
                  {reading.phosphorus_kg_ha} kg/ha (Adequate)
                </span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (reading.phosphorus_kg_ha / 80) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-zinc-600 dark:text-zinc-400 font-medium">Potassium (K)</span>
                <span className="num-tabular font-mono text-zinc-900 dark:text-zinc-100 font-semibold">
                  {reading.potassium_kg_ha} kg/ha (Abundant)
                </span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (reading.potassium_kg_ha / 220) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Realtime Alert Feed */}
        <div className="lg:col-span-7 card-subtle p-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Agronomic Event & Threshold Log
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Live stream of automated telemetry alerts and agronomic decisions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAlerts([])}
                className="text-[11px] text-zinc-400 hover:text-red-500 font-medium transition-colors"
                title="Clear current log"
              >
                Clear Log
              </button>
              <span className="text-[10px] font-mono text-zinc-400">
                • Auto-updating
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {alerts.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2.5 p-2.5 rounded-control bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/60 text-xs"
              >
                {item.type === 'warning' ? (
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                ) : item.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Activity className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-zinc-800 dark:text-zinc-200 font-medium">
                    {item.message}
                  </p>
                  <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">
                    {item.time} · Telemetry Engine v1.0
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

