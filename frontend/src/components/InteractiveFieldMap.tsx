import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Layers, MapPin, Eye, Maximize2, Sparkles, Sprout } from 'lucide-react';

export const InteractiveFieldMap: React.FC = () => {
  const { fields, activeFieldId, setActiveFieldId } = useAppStore();
  const [mapLayer, setMapLayer] = useState<'satellite' | 'ndvi' | 'yield'>('ndvi');

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-600" />
            Cadastral Field Map & Satellite Heatmap
          </h3>
          <p className="text-xs text-slate-500">Sentinel-2 Sentinel Hub 10m NDVI & Yield Heatmap</p>
        </div>

        {/* Layer Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setMapLayer('ndvi')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              mapLayer === 'ndvi' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            NDVI Canopy
          </button>
          <button
            onClick={() => setMapLayer('yield')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              mapLayer === 'yield' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            Yield Density
          </button>
          <button
            onClick={() => setMapLayer('satellite')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              mapLayer === 'satellite' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            True Color
          </button>
        </div>
      </div>

      {/* Styled Interactive Canvas Preview */}
      <div className="relative mt-4 h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950">
        {/* Background Satellite Grid Art */}
        <div 
          className="absolute inset-0 opacity-40 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80')`,
            filter: mapLayer === 'ndvi' ? 'hue-rotate(90deg) contrast(140%)' : mapLayer === 'yield' ? 'contrast(120%)' : 'none'
          }}
        />

        {/* Overlay Grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-25"></div>

        {/* Field Boundary Cards Placed across Canvas */}
        <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
          <div className="flex justify-between items-start">
            <span className="pointer-events-auto bg-slate-900/80 backdrop-blur text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-lg">
              Lat: 19.9975° N | Lon: 73.7898° E (Nashik Cluster)
            </span>
            <div className="pointer-events-auto bg-slate-900/80 backdrop-blur text-white text-[10px] px-2 py-1 rounded-lg flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              Sentinel-2 Refresh: 4h ago
            </div>
          </div>

          {/* Interactive Parcels Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pointer-events-auto">
            {fields.map(f => {
              const isSelected = f.id === activeFieldId;
              return (
                <div
                  key={f.id}
                  onClick={() => setActiveFieldId(f.id)}
                  className={`p-3 rounded-xl border backdrop-blur cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-950/90 border-emerald-400 text-white shadow-lg ring-1 ring-emerald-400'
                      : 'bg-slate-900/80 border-slate-700/80 text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs truncate">{f.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      {f.crop}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{f.areaHa} Ha</span>
                    <span className="text-emerald-400 font-bold">NDVI: {f.ndvi}</span>
                    <span className="text-amber-400 font-bold">{f.predictedYield} t/ha</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

