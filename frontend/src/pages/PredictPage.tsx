import React, { useState, useEffect, useRef } from 'react';
import { api, PredictRequest, PredictResponse } from '../services/api';
import { 
  Sprout, Download, Plus, Trash2, ArrowUpRight, ArrowDownRight, 
  HelpCircle, RefreshCw, SlidersHorizontal, Sparkles, CheckCircle2
} from 'lucide-react';

interface Scenario {
  id: string;
  name: string;
  crop: string;
  area: string;
  year: number;
  rainfall_mm: number;
  temp_c: number;
  pesticides_t: number;
  yield_t_ha: number;
  variance_pct: number;
}

export const PredictPage: React.FC = () => {
  // Primary Form State with sensible default agronomic values
  const [crop, setCrop] = useState('Wheat');
  const [area, setArea] = useState('India');
  const [year, setYear] = useState(2024);
  const [rainfall, setRainfall] = useState(1150);
  const [temperature, setTemperature] = useState(21.5);
  const [pesticides, setPesticides] = useState(12500);

  // What-if live overrides (debounced)
  const [whatIfRainDelta, setWhatIfRainDelta] = useState(0);
  const [whatIfTempDelta, setWhatIfTempDelta] = useState(0);
  const [whatIfFertPct, setWhatIfFertPct] = useState(0);

  // Result & loading states
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Debounced live prediction computation
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPrediction = async (
    targetCrop = crop,
    targetArea = area,
    targetYear = year,
    targetRain = rainfall + whatIfRainDelta,
    targetTemp = temperature + whatIfTempDelta,
    targetPest = pesticides * (1 + whatIfFertPct / 100)
  ) => {
    setLoading(true);
    try {
      const req: PredictRequest = {
        crop: targetCrop,
        area: targetArea,
        year: targetYear,
        rainfall_mm: Math.max(50, Math.round(targetRain)),
        temp_c: Number(targetTemp.toFixed(1)),
        pesticides_t: Math.max(0, Math.round(targetPest))
      };
      const res = await api.predict(req);
      setResult(res);
    } catch (err) {
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPrediction();
  }, [crop, area, year]);

  // Debounce what-if sliders
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPrediction(crop, area, year, rainfall + whatIfRainDelta, temperature + whatIfTempDelta, pesticides * (1 + whatIfFertPct / 100));
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [rainfall, temperature, pesticides, whatIfRainDelta, whatIfTempDelta, whatIfFertPct]);

  // Handle Save Scenario
  const handleSaveScenario = () => {
    if (!result || scenarios.length >= 3) return;
    const newScenario: Scenario = {
      id: Math.random().toString(36).substring(2, 9),
      name: `Scenario ${scenarios.length + 1} (${crop} - ${area})`,
      crop,
      area,
      year,
      rainfall_mm: rainfall + whatIfRainDelta,
      temp_c: Number((temperature + whatIfTempDelta).toFixed(1)),
      pesticides_t: pesticides * (1 + whatIfFertPct / 100),
      yield_t_ha: result.yield_t_ha,
      variance_pct: result.variance_vs_country_avg_pct
    };
    setScenarios([...scenarios, newScenario]);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const removeScenario = (id: string) => {
    setScenarios(scenarios.filter((s) => s.id !== id));
  };

  // Preset quick templates
  const applyPreset = (presetCrop: string, presetArea: string, rain: number, temp: number) => {
    setCrop(presetCrop);
    setArea(presetArea);
    setRainfall(rain);
    setTemperature(temp);
    setWhatIfRainDelta(0);
    setWhatIfTempDelta(0);
    setWhatIfFertPct(0);
    fetchPrediction(presetCrop, presetArea, year, rain, temp, pesticides);
  };

  const [downloading, setDownloading] = useState(false);
  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const res = await fetch(api.getPdfUrl());
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'CropYield_Analysis_Report.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        window.open(api.getPdfUrl(), '_blank');
      }
    } catch {
      window.open(api.getPdfUrl(), '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const cropsList = [
    'Wheat', 'Potatoes', 'Maize', 'Rice, paddy', 'Soybeans', 
    'Cassava', 'Sweet potatoes', 'Sorghum', 'Yams', 'Plantains and others'
  ];

  const countriesList = [
    'India', 'United States', 'France', 'Brazil', 'Australia', 
    'Canada', 'Germany', 'Japan', 'Spain', 'South Africa', 
    'Egypt', 'United Kingdom', 'Mexico', 'Indonesia', 'Argentina'
  ];

  return (
    <div className="space-y-6 max-w-[1280px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <h1 className="text-title text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Sprout className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
            Harvest Yield Predictor
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Deterministic Random Forest inference with confidence bounds and real-time what-if simulations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium border border-zinc-200 dark:border-zinc-700 transition-colors disabled:opacity-60"
          >
            <Download className={`h-3.5 w-3.5 ${downloading ? 'animate-bounce' : ''}`} />
            <span>{downloading ? 'Downloading...' : 'Download Report (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* Quick Presets Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-zinc-400 text-[11px] uppercase tracking-wider font-mono shrink-0">
          Benchmarks:
        </span>
        <button
          onClick={() => applyPreset('Wheat', 'India', 950, 24.5)}
          className={`px-2.5 py-1 rounded-control border text-xs whitespace-nowrap transition-colors ${
            crop === 'Wheat' && area === 'India'
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent font-medium'
              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
          }`}
        >
          Indian Gangetic Wheat
        </button>
        <button
          onClick={() => applyPreset('Potatoes', 'United States', 1150, 15.2)}
          className={`px-2.5 py-1 rounded-control border text-xs whitespace-nowrap transition-colors ${
            crop === 'Potatoes' && area === 'United States'
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent font-medium'
              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
          }`}
        >
          US Pacific Tuber Yield
        </button>
        <button
          onClick={() => applyPreset('Maize', 'France', 860, 18.0)}
          className={`px-2.5 py-1 rounded-control border text-xs whitespace-nowrap transition-colors ${
            crop === 'Maize' && area === 'France'
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-transparent font-medium'
              : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
          }`}
        >
          French Corn Belt
        </button>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Clean Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card-subtle p-5">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              Field & Climate Parameters
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Enter target agroecological conditions for harvest inference
            </p>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); fetchPrediction(); }}>
              {/* Crop & Country Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Crop Species
                  </label>
                  <select
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="input-subtle w-full text-xs font-medium cursor-pointer"
                  >
                    {cropsList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                    Country / Territory
                  </label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="input-subtle w-full text-xs font-medium cursor-pointer"
                  >
                    {countriesList.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Harvest Year */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                    Harvest Calendar Year
                  </label>
                  <span className="num-tabular text-xs font-medium text-zinc-900 dark:text-zinc-100">
                    {year}
                  </span>
                </div>
                <input
                  type="range"
                  min="1990"
                  max="2030"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono mt-0.5">
                  <span>1990</span>
                  <span>2013 (FAO End)</span>
                  <span>2030</span>
                </div>
              </div>

              {/* Annual Rainfall Slider + Number Input */}
              <div className="p-3 rounded-control bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Annual Rainfall (mm)
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="100"
                      max="3500"
                      value={rainfall}
                      onChange={(e) => setRainfall(Number(e.target.value))}
                      className="input-subtle w-20 text-xs py-1 text-right num-tabular"
                    />
                    <span className="text-[11px] text-zinc-400 font-mono">mm</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="100"
                  max="3500"
                  step="25"
                  value={rainfall}
                  onChange={(e) => setRainfall(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>Dry (300mm)</span>
                  <span>Optimal (1,150mm)</span>
                  <span>Wet (3,000mm)</span>
                </div>
              </div>

              {/* Average Temperature Slider + Number Input */}
              <div className="p-3 rounded-control bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Growing Season Temp (°C)
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="-5"
                      max="45"
                      step="0.5"
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="input-subtle w-20 text-xs py-1 text-right num-tabular"
                    />
                    <span className="text-[11px] text-zinc-400 font-mono">°C</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="5"
                  max="42"
                  step="0.5"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>Cool (10°C)</span>
                  <span>Temperate (21°C)</span>
                  <span>Hot (38°C)</span>
                </div>
              </div>

              {/* Pesticides / Input Tonnes */}
              <div className="p-3 rounded-control bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Pesticide & Agrochemical Usage
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="75000"
                      step="500"
                      value={pesticides}
                      onChange={(e) => setPesticides(Number(e.target.value))}
                      className="input-subtle w-24 text-xs py-1 text-right num-tabular"
                    />
                    <span className="text-[11px] text-zinc-400 font-mono">t</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60000"
                  step="500"
                  value={pesticides}
                  onChange={(e) => setPesticides(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Submit & Reset Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-3 rounded-control bg-primary hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sprout className="h-3.5 w-3.5" />
                  )}
                  <span>Recalculate Yield</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setWhatIfRainDelta(0);
                    setWhatIfTempDelta(0);
                    setWhatIfFertPct(0);
                    setRainfall(1150);
                    setTemperature(21.5);
                    setPesticides(12500);
                    fetchPrediction(crop, area, year, 1150, 21.5, 12500);
                  }}
                  className="p-2 rounded-control border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
                  title="Reset to default baseline"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Result Card & What-if Live Simulator (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Star Result Card */}
          <div className="card-subtle p-6 relative overflow-hidden">
            {/* Subtle Hero Gradient Tint */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 font-mono">
                  Harvest Prediction Outcome
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-kpi font-semibold text-zinc-900 dark:text-zinc-50 num-tabular tracking-tight">
                    {result ? result.yield_t_ha.toFixed(2) : '3.45'}
                  </span>
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    tonnes / hectare
                  </span>
                  <span className="text-xs font-mono text-zinc-400 ml-1">
                    ({result ? result.yield_hg_ha.toLocaleString() : '34,500'} hg/ha)
                  </span>
                </div>
              </div>

              {/* Country Comparison Badge */}
              {result && (
                <div className="flex flex-col sm:items-end">
                  <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    result.variance_vs_country_avg_pct >= 0
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                  }`}>
                    {result.variance_vs_country_avg_pct >= 0 ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {result.variance_vs_country_avg_pct >= 0 ? '+' : ''}
                      {result.variance_vs_country_avg_pct}% vs {area} avg ({result.country_avg_t_ha} t/ha)
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 font-mono">
                    Model: {result.model_name}
                  </span>
                </div>
              )}
            </div>

            {/* Confidence Interval Visual Range Bar */}
            <div className="py-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-600 dark:text-zinc-400 font-medium flex items-center gap-1">
                  95% Prediction Confidence Interval
                  <HelpCircle className="h-3 w-3 text-zinc-400" />
                </span>
                <span className="font-mono text-zinc-900 dark:text-zinc-100 font-medium">
                  {result ? result.ci_low : '2.27'} – {result ? result.ci_high : '4.63'} t/ha (±1.18 RMSE)
                </span>
              </div>

              {/* Progress Range Bar */}
              <div className="relative w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 bottom-0 bg-primary/20 rounded-full"
                  style={{
                    left: `${Math.max(5, Math.min(80, ((result ? result.ci_low : 2.27) / 35) * 100))}%`,
                    right: `${Math.max(5, 100 - (((result ? result.ci_high : 4.63) / 35) * 100))}%`
                  }}
                ></div>
                <div 
                  className="absolute top-0 bottom-0 w-1.5 bg-primary rounded-full shadow-sm"
                  style={{
                    left: `${Math.max(5, Math.min(95, ((result ? result.yield_t_ha : 3.45) / 35) * 100))}%`
                  }}
                ></div>
              </div>

              <div className="flex justify-between text-[10px] text-zinc-400 font-mono mt-1">
                <span>0 t/ha</span>
                <span>Lower CI</span>
                <span>Inference Mean</span>
                <span>Upper CI</span>
                <span>35 t/ha</span>
              </div>
            </div>

            {/* Feature Contributions Breakdown */}
            <div className="pt-4">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-mono block mb-2.5">
                Key Yield Drivers For This Query
              </span>
              <div className="space-y-2">
                {(result?.feature_contributions || []).map((fc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-control bg-zinc-50 dark:bg-zinc-900/60 text-xs border border-zinc-100 dark:border-zinc-800/60"
                  >
                    <div>
                      <span className="font-medium text-zinc-800 dark:text-zinc-200 block">
                        {fc.feature}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {fc.description}
                      </span>
                    </div>
                    <span className={`num-tabular font-semibold font-mono ${
                      fc.impact >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'
                    }`}>
                      {fc.impact >= 0 ? '+' : ''}{fc.impact} t/ha
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Scenario Button */}
            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={handleSaveScenario}
                disabled={scenarios.length >= 3}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Save Scenario for Comparison ({scenarios.length}/3)</span>
              </button>

              {savedSuccess && (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Saved to comparison board
                </span>
              )}
            </div>
          </div>

          {/* Live What-If Sensitivity Panel */}
          <div className="card-subtle p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  Live "What-If" Sensitivity Simulator
                </h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                Instant debounced evaluation
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Drag delta sliders to evaluate harvest sensitivity to climate shifts or management interventions
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Rainfall Delta */}
              <div className="p-3 rounded-control bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">Rainfall Shift</span>
                  <span className="num-tabular font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                    {whatIfRainDelta > 0 ? `+${whatIfRainDelta}` : whatIfRainDelta} mm
                  </span>
                </div>
                <input
                  type="range"
                  min="-400"
                  max="400"
                  step="20"
                  value={whatIfRainDelta}
                  onChange={(e) => setWhatIfRainDelta(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-zinc-400 block text-right mt-1 font-mono">
                  Net: {rainfall + whatIfRainDelta} mm
                </span>
              </div>

              {/* Temp Delta */}
              <div className="p-3 rounded-control bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">Temp Anomaly</span>
                  <span className="num-tabular font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                    {whatIfTempDelta > 0 ? `+${whatIfTempDelta}` : whatIfTempDelta}°C
                  </span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.5"
                  value={whatIfTempDelta}
                  onChange={(e) => setWhatIfTempDelta(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-zinc-400 block text-right mt-1 font-mono">
                  Net: {(temperature + whatIfTempDelta).toFixed(1)}°C
                </span>
              </div>

              {/* Fertilizer Boost Delta */}
              <div className="p-3 rounded-control bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">Input Boost</span>
                  <span className="num-tabular font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                    {whatIfFertPct > 0 ? `+${whatIfFertPct}` : whatIfFertPct}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  step="5"
                  value={whatIfFertPct}
                  onChange={(e) => setWhatIfFertPct(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-zinc-400 block text-right mt-1 font-mono">
                  Efficiency factor
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Comparison Section (up to 3 scenarios) */}
      {scenarios.length > 0 && (
        <div className="card-subtle p-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Scenario Comparison ({scenarios.length}/3)
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Side-by-side evaluation of alternative management and climatic profiles
              </p>
            </div>
            <button
              onClick={() => setScenarios([])}
              className="text-xs text-zinc-400 hover:text-red-500 font-medium transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenarios.map((sc, index) => (
              <div
                key={sc.id}
                className="p-4 rounded-control bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 relative"
              >
                <button
                  onClick={() => removeScenario(sc.id)}
                  className="absolute top-3 right-3 text-zinc-400 hover:text-red-500 transition-colors p-1"
                  title="Remove scenario"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                <div className="flex items-center gap-2 mb-2">
                  <span className="h-5 w-5 rounded-full bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                    {sc.name}
                  </span>
                </div>

                <div className="my-3">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block">
                    Predicted Yield
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="num-tabular text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {sc.yield_t_ha.toFixed(2)}
                    </span>
                    <span className="text-xs text-zinc-500">t/ha</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 text-zinc-600 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span>Rainfall:</span>
                    <span className="font-mono text-zinc-800 dark:text-zinc-200">{sc.rainfall_mm} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Temperature:</span>
                    <span className="font-mono text-zinc-800 dark:text-zinc-200">{sc.temp_c}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pesticides:</span>
                    <span className="font-mono text-zinc-800 dark:text-zinc-200">{Math.round(sc.pesticides_t)} t</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Baseline Variance:</span>
                    <span className={`font-mono font-semibold ${sc.variance_pct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>
                      {sc.variance_pct >= 0 ? '+' : ''}{sc.variance_pct}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

