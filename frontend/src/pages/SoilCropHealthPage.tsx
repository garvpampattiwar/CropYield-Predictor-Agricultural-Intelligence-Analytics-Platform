import React, { useState } from 'react';
import { MOCK_DISEASE_CATALOG } from '../services/mockAgriData';
import { 
  Activity, UploadCloud, ShieldAlert, CheckCircle2, 
  Sparkles, Leaf, AlertCircle, FileText
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

export const SoilCropHealthPage: React.FC = () => {
  const [selectedDisease, setSelectedDisease] = useState(MOCK_DISEASE_CATALOG[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Soil Nutrient Balance Radar Data
  const soilRadarData = [
    { subject: 'Nitrogen (N)', current: 85, optimal: 100 },
    { subject: 'Phosphorus (P)', current: 70, optimal: 80 },
    { subject: 'Potassium (K)', current: 95, optimal: 90 },
    { subject: 'Organic Carbon', current: 65, optimal: 80 },
    { subject: 'pH Balance', current: 90, optimal: 90 },
    { subject: 'Moisture Capacity', current: 75, optimal: 85 },
  ];

  // Sentinel-2 NDVI Time Series
  const ndviTrend = [
    { date: 'Oct 01', ndvi: 0.32 },
    { date: 'Oct 15', ndvi: 0.48 },
    { date: 'Nov 01', ndvi: 0.64 },
    { date: 'Nov 15', ndvi: 0.74 },
    { date: 'Dec 01 (Est)', ndvi: 0.82 },
    { date: 'Dec 15 (Peak)', ndvi: 0.85 },
  ];

  const handleSimulateUpload = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      // Switch randomly
      const next = MOCK_DISEASE_CATALOG[(MOCK_DISEASE_CATALOG.indexOf(selectedDisease) + 1) % MOCK_DISEASE_CATALOG.length];
      setSelectedDisease(next);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="h-6 w-6 text-emerald-600" />
          Soil Diagnostics & Crop Pathology AI
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Sentinel-2 NDVI canopy time-series, soil chemical radar profiles, and computer vision disease detection
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Soil Radar & NDVI Trend */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Soil Chemical Equilibrium Radar</h3>
            <p className="text-xs text-slate-500 mb-2">Current field nutrient status compared to crop-specific agronomic benchmark</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={soilRadarData}>
                  <PolarGrid stroke="#e2e8f0" strokeOpacity={0.4} />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Current Field" dataKey="current" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                  <Radar name="Optimal Target" dataKey="optimal" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.15} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Vegetation Canopy Vigour (NDVI Progression)</h3>
            <p className="text-xs text-slate-500 mb-4">Historical 10m Sentinel-2 multispectral vegetation index</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ndviTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0.2, 1.0]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="ndvi" stroke="#059669" strokeWidth={3} dot={{ r: 4, fill: '#059669' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Disease Image Detection */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-500" />
                AI Crop Disease & Pest Diagnostics
              </h3>
              <span className="text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 px-2 py-0.5 rounded-full">
                CV Model v2.4
              </span>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div 
              onClick={handleSimulateUpload}
              className="mt-4 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/30"
            >
              <UploadCloud className="h-8 w-8 mx-auto text-emerald-600 mb-2 animate-bounce" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isAnalyzing ? 'Analyzing leaf histology...' : 'Click to Upload Leaf Photo for Instant Diagnosis'}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Supports JPG, PNG up to 15MB • Sample demo images auto-loaded</p>
            </div>

            {/* AI Result Card */}
            <div className="mt-5 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Identified Pathogen</span>
                  <div className="text-sm font-black text-rose-600 dark:text-rose-400">{selectedDisease.name}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Confidence</span>
                  <div className="text-sm font-bold text-emerald-600">{selectedDisease.confidence}%</div>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Observed Symptoms</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{selectedDisease.symptoms}</p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block mb-1">🌿 Organic Advisory</span>
                  <p className="text-[11px] text-emerald-900/80 dark:text-emerald-300/80 leading-normal">{selectedDisease.organicTreatment}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-800/60">
                  <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 block mb-1">🧪 Targeted Chemical IPM</span>
                  <p className="text-[11px] text-blue-900/80 dark:text-blue-300/80 leading-normal">{selectedDisease.chemicalTreatment}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

