import React, { useState } from 'react';
import { BarChart3, Download, DollarSign, TrendingUp, Calendar, FileSpreadsheet } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

export const AnalyticsReportsPage: React.FC = () => {
  const [marketPrice, setMarketPrice] = useState(2740); // Rs / quintal
  const [costPerHa, setCostPerHa] = useState(38000); // Rs / ha
  const [expectedYieldTha, setExpectedYieldTha] = useState(3.45); // t/ha = 34.5 quintals/ha

  // Multi-season harvest comparison data
  const multiSeasonData = [
    { crop: 'Wheat', s2023: 3.1, s2024: 3.45, s2025_target: 3.65 },
    { crop: 'Potatoes', s2023: 22.4, s2024: 24.8, s2025_target: 26.5 },
    { crop: 'Maize', s2023: 5.4, s2024: 6.1, s2025_target: 6.4 },
    { crop: 'Soybeans', s2023: 2.1, s2024: 2.35, s2025_target: 2.6 },
  ];

  // Financial Estimates
  const totalQuintalsPerHa = expectedYieldTha * 10;
  const grossRevenuePerHa = totalQuintalsPerHa * marketPrice;
  const netProfitPerHa = grossRevenuePerHa - costPerHa;
  const roiPercentage = ((netProfitPerHa / costPerHa) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-emerald-600" />
            Agricultural Analytics & Enterprise Reporting
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Multi-season harvest comparisons, farm profit estimators, and audit-grade data exports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert("CSV Export downloaded: cropyield_analytics_2026.csv")}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3.5 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Export CSV
          </button>
          <a
            href="http://localhost:8501"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-600 text-white px-3.5 py-2 rounded-xl shadow-md hover:bg-emerald-700 transition"
          >
            <Download className="h-4 w-4" /> Download PDF Report
          </a>
        </div>
      </div>

      {/* Multi-Season Yield Progression */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
          Multi-Season Crop Yield Progression (t/ha)
        </h3>
        <p className="text-xs text-slate-500 mb-4">Historical comparison vs ML projected yield optimization goals</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={multiSeasonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="crop" tick={{ fontSize: 11 }} />
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
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="s2023" name="2023 Harvest" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="s2024" name="2024 Harvest" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="s2025_target" name="2025 ML Target" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Farm Financial & Profit Estimator */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <DollarSign className="h-5 w-5 text-emerald-600" />
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Farm Profit & Revenue Estimator</h3>
            <p className="text-xs text-slate-500">Calculate net margin based on predicted yield, mandi prices, and input costs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Mandi Market Price (₹ / Quintal)
              </label>
              <input
                type="number"
                value={marketPrice}
                onChange={(e) => setMarketPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Cultivation Cost (₹ / Hectare)
              </label>
              <input
                type="number"
                value={costPerHa}
                onChange={(e) => setCostPerHa(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Harvest Yield (t/ha)
              </label>
              <input
                type="number"
                step="0.1"
                value={expectedYieldTha}
                onChange={(e) => setExpectedYieldTha(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
              />
            </div>
          </div>

          {/* Result Cards */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Gross Revenue</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white my-2">
                ₹{grossRevenuePerHa.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">{totalQuintalsPerHa} quintals / ha</span>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-col justify-between">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase">Estimated Net Profit</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 my-2">
                ₹{netProfitPerHa.toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">₹{(netProfitPerHa / 18.5).toFixed(0)} / acre</span>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex flex-col justify-between">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase">Return On Investment</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 my-2">
                {roiPercentage}%
              </div>
              <span className="text-[10px] text-amber-600 font-bold">Excellent Margin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

