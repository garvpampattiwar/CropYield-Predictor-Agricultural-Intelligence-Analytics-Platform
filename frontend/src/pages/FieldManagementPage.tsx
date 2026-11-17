import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Field } from '../types';
import { Map, Plus, Sprout, Calendar, Layers, Activity, ChevronRight, X, Check } from 'lucide-react';

export const FieldManagementPage: React.FC = () => {
  const { fields, addField, activeFieldId, setActiveFieldId } = useAppStore();
  const [selectedField, setSelectedField] = useState<Field>(fields[0]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New field form state
  const [name, setName] = useState('');
  const [crop, setCrop] = useState('Wheat');
  const [areaHa, setAreaHa] = useState(5.0);
  const [soilType, setSoilType] = useState('Clay Loam');

  const handleCreateField = (e: React.FormEvent) => {
    e.preventDefault();
    const newField: Field = {
      id: `f_${Date.now()}`,
      name: name || 'New Field Parcel',
      crop,
      variety: 'Commercial Hybrid',
      areaHa: Number(areaHa),
      sowingDate: '2026-10-20',
      soilType,
      irrigationType: 'Drip Irrigation',
      predictedYield: crop === 'Potatoes' ? 24.5 : crop === 'Maize' ? 5.8 : 3.2,
      ndvi: 0.72,
      status: 'Healthy',
      coordinates: [[19.998, 73.79], [19.999, 73.792], [19.997, 73.793]],
    };
    addField(newField);
    setShowAddModal(false);
    setName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Map className="h-6 w-6 text-emerald-600" />
            Field & Parcel Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Spatial cadastral boundaries, satellite NDVI indices, and crop history
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-md hover:bg-emerald-700 transition"
        >
          <Plus className="h-4 w-4" /> Add Field Parcel
        </button>
      </div>

      {/* Field Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {fields.map((f) => {
          const isSelected = f.id === selectedField.id;
          return (
            <div
              key={f.id}
              onClick={() => { setSelectedField(f); setShowDrawer(true); }}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                isSelected
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{f.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  f.status === 'Healthy'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {f.status}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <Sprout className="h-4 w-4 text-emerald-600" />
                <span>{f.crop} ({f.variety})</span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Area</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{f.areaHa} Ha</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">NDVI</span>
                  <span className="font-bold text-emerald-600">{f.ndvi}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Forecast</span>
                  <span className="font-bold text-amber-600">{f.predictedYield} t/ha</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Field Detail Drawer */}
      {showDrawer && selectedField && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedField.name} Detailed Report</h2>
              <p className="text-xs text-slate-500">Cadastral ID: {selectedField.id} • {selectedField.soilType}</p>
            </div>
            <button
              onClick={() => setShowDrawer(false)}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase">Crop History</span>
              <ul className="mt-2 space-y-2 text-xs">
                <li className="flex justify-between">
                  <span>2024 Rabi</span> <b className="text-slate-800 dark:text-slate-200">{selectedField.crop} ({selectedField.predictedYield} t/ha)</b>
                </li>
                <li className="flex justify-between">
                  <span>2023 Kharif</span> <b className="text-slate-800 dark:text-slate-200">Soybean (2.4 t/ha)</b>
                </li>
                <li className="flex justify-between">
                  <span>2022 Rabi</span> <b className="text-slate-800 dark:text-slate-200">Wheat (3.1 t/ha)</b>
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase">Soil & Irrigation</span>
              <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div>Soil Classification: <b>{selectedField.soilType}</b></div>
                <div>Method: <b>{selectedField.irrigationType}</b></div>
                <div>Drainage: <b>Well-Drained</b></div>
                <div>Organic Carbon: <b>0.82% (Moderate)</b></div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase">Satellite Telemetry</span>
              <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div>Sentinel-2 NDVI: <b className="text-emerald-600">{selectedField.ndvi} (High Biomass)</b></div>
                <div>Canopy Temperature: <b>23.2°C</b></div>
                <div>Chlorophyll Index: <b>4.8 (Healthy)</b></div>
                <div>Vegetation Water Index: <b>+0.32</b></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Field Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Register New Field Parcel</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateField} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Field Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. West Canal Plot"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Crop</label>
                  <select
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                  >
                    <option value="Wheat">Wheat</option>
                    <option value="Potatoes">Potatoes</option>
                    <option value="Maize">Maize</option>
                    <option value="Rice">Rice</option>
                    <option value="Soybean">Soybean</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Area (Hectares)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={areaHa}
                    onChange={(e) => setAreaHa(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Soil Type</label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  <option value="Clay Loam">Clay Loam (Black Cotton)</option>
                  <option value="Sandy Loam">Sandy Loam</option>
                  <option value="Alluvial">Alluvial Loam</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Save & Initialize Telemetry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

