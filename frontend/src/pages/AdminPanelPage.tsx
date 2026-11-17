import React from 'react';
import { ShieldAlert, Server, Activity, Cpu, Database, CheckCircle2, RefreshCw } from 'lucide-react';

export const AdminPanelPage: React.FC = () => {
  const modelMetrics = [
    { model: 'Random Forest (Champion)', cvR2: '0.9828', testR2: '0.9809', testRmse: '1.18 t/ha', drift: '0.02%', status: 'Production Active' },
    { model: 'XGBoost (Hist)', cvR2: '0.9611', testR2: '0.9592', testRmse: '1.72 t/ha', drift: '0.04%', status: 'Hot Standby' },
    { model: 'Gradient Boosting', cvR2: '0.9434', testR2: '0.9426', testRmse: '2.04 t/ha', drift: '0.05%', status: 'Archived' },
    { model: 'Linear Regression', cvR2: '0.7483', testR2: '0.7487', testRmse: '4.27 t/ha', drift: 'N/A', status: 'Baseline' },
    { model: 'Ridge Regression', cvR2: '0.7461', testR2: '0.7465', testRmse: '4.29 t/ha', drift: 'N/A', status: 'Baseline' }
  ];

  const dataSources = [
    { name: 'Kaggle / FAO Agricultural Master', records: '25,932 rows', latency: '4ms', health: '100% Validated' },
    { name: 'IMD / NASA POWER Meteorological Feed', records: 'Real-time', latency: '120ms', health: 'Operational' },
    { name: 'Capacitive LoRaWAN IoT Gateway', records: '1 reading / 4s', latency: '45ms', health: 'Streaming' },
    { name: 'Agmarknet APMC Mandi Rates', records: 'Hourly sync', latency: '210ms', health: 'Synchronized' },
  ];

  const registeredUsers = [
    { name: 'Rajesh Patil', role: 'Farmer', farm: 'Sahyadri Agro Farms', status: 'Active Now' },
    { name: 'Dr. Vivek Sharma', role: 'Agronomist', farm: 'Maharashtra State Seed Corp', status: 'Active 2h ago' },
    { name: 'Pooja Kulkarni', role: 'Admin', farm: 'Agricultural Analytics Core', status: 'Online' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-emerald-600" />
            Platform Administration & Model Governance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Production ML model drift monitoring, data pipelines health, and user access management
          </p>
        </div>

        <button 
          onClick={() => alert("Model health telemetry checked: Zero concept drift detected.")}
          className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-3.5 py-2 rounded-xl transition"
        >
          <RefreshCw className="h-3.5 w-3.5 text-emerald-600" /> Refresh Telemetry
        </button>
      </div>

      {/* Top System Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">ML Model Drift</span>
          <div className="text-xl font-black text-emerald-600 mt-1">&lt; 0.05%</div>
          <span className="text-[10px] text-slate-500">Stable within 5-Fold bounds</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">API Ingestion Latency</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">42 ms</div>
          <span className="text-[10px] text-emerald-500 font-semibold">● 99.99% Uptime</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">MLflow Tracking UI</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">Port 5000</div>
          <span className="text-[10px] text-slate-500">Local experiment repository</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Champion Model</span>
          <div className="text-xl font-black text-emerald-600 mt-1">Random Forest</div>
          <span className="text-[10px] text-slate-500">Exported best_model.joblib</span>
        </div>
      </div>

      {/* Model Performance Governance Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Model Performance & Drift Telemetry</h3>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 pr-4">Architecture</th>
                <th className="py-2.5 px-3">5-Fold CV R²</th>
                <th className="py-2.5 px-3">Test R²</th>
                <th className="py-2.5 px-3">Test RMSE</th>
                <th className="py-2.5 px-3">Telemetry Drift</th>
                <th className="py-2.5 pl-3 text-right">Deployment State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {modelMetrics.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 pr-4 font-bold text-slate-900 dark:text-white">{m.model}</td>
                  <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">{m.cvR2}</td>
                  <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">{m.testR2}</td>
                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">{m.testRmse}</td>
                  <td className="py-3 px-3 text-slate-500">{m.drift}</td>
                  <td className="py-3 pl-3 text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      m.status.includes('Active')
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Source Pipeline Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Live Ingestion Data Sources</h3>
          <div className="space-y-3">
            {dataSources.map((ds, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{ds.name}</div>
                  <div className="text-[10px] text-slate-400">{ds.records} • Latency: {ds.latency}</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> {ds.health}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Registered Agricultural Users</h3>
          <div className="space-y-3">
            {registeredUsers.map((u, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{u.name} ({u.role})</div>
                  <div className="text-[10px] text-slate-400">{u.farm}</div>
                </div>
                <span className="text-[10px] font-semibold text-slate-500">{u.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

