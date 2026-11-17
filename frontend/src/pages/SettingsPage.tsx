import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Settings, User, Building, Sliders, Key, Users, Check, Moon, Sun } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, setUser, theme, toggleTheme } = useAppStore();

  const [farmName, setFarmName] = useState(user.farmName);
  const [location, setLocation] = useState(user.location);
  const [hectares, setHectares] = useState(user.hectares);
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [apiKey, setApiKey] = useState('cyp_live_8f3a9e2c1409b821a');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      ...user,
      farmName,
      location,
      hectares: Number(hectares)
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-emerald-600" />
          Farm Account & Telemetry Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure farm parameters, IoT API keys, measurement systems, and team access
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Farm Profile Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Building className="h-4 w-4 text-emerald-600" />
            Farm & Enterprise Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Farm / Cooperative Name</label>
              <input
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Primary District & State</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Cultivated Land Area (Hectares)</label>
              <input
                type="number"
                step="0.5"
                value={hectares}
                onChange={(e) => setHectares(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Owner Email</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Measurement & Theme Units */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-600" />
            Units of Measurement & Theme
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">Measurement System</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUnits('metric')}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold border transition ${
                    units === 'metric'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Metric (t/ha, mm, °C)
                </button>
                <button
                  type="button"
                  onClick={() => setUnits('imperial')}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold border transition ${
                    units === 'imperial'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Imperial (bu/ac, in, °F)
                </button>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">Display Appearance</label>
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full py-2 px-3 rounded-xl font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-between"
              >
                <span>Current: {theme === 'light' ? 'Light Theme' : 'Dark Theme'}</span>
                {theme === 'light' ? <Moon className="h-4 w-4 text-slate-500" /> : <Sun className="h-4 w-4 text-amber-400" />}
              </button>
            </div>
          </div>
        </div>

        {/* API Integration Key */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Key className="h-4 w-4 text-emerald-600" />
            IoT Telemetry & MLflow API Key
          </h3>
          <p className="text-xs text-slate-500">
            Use this key to authorize remote LoRaWAN gateways, drone sensors, or weather stations to ingest data.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={apiKey}
              className="flex-1 px-3 py-2 rounded-xl text-xs font-mono bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            />
            <button
              type="button"
              onClick={() => alert("Copied API key to clipboard!")}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded-xl text-xs font-bold"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
          >
            {saved ? <Check className="h-4 w-4" /> : null}
            <span>{saved ? 'Settings Saved!' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

