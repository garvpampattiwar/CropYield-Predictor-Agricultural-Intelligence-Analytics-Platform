import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StatCard } from '../components/StatCard';
import { ChartCard } from '../components/ChartCard';
import { api, DatasetSummary, TrendsResponse } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { 
  Database, Globe2, Sprout, ShieldCheck, 
  TrendingUp, ArrowUpRight, BarChart2, Filter
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';

export const OverviewPage: React.FC = () => {
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [trends, setTrends] = useState<TrendsResponse | null>(null);
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [sumRes, trendRes] = await Promise.all([
        api.getDatasetSummary(),
        api.getDatasetTrends(selectedCrop, 'All')
      ]);
      setSummary(sumRes);
      setTrends(trendRes);
      setLoading(false);
    }
    loadData();
  }, [selectedCrop]);

  // Feature importance data
  const featureImportances = [
    { feature: 'Crop Species Identity', weight: 68.2 },
    { feature: 'Hydrothermal Water Ratio', weight: 14.5 },
    { feature: 'Country Agroecology', weight: 9.8 },
    { feature: 'Year (Genetic & Tech Trend)', weight: 4.6 },
    { feature: 'Pesticide Application Density', weight: 2.9 },
  ];

  return (
    <div className="space-y-6 max-w-[1280px] mx-auto animate-in fade-in duration-200">
      {/* Page Title & Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <h1 className="text-title text-zinc-900 dark:text-zinc-50">
            Agricultural Intelligence Overview
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Global yield benchmark from 25,932 multi-decadal FAO & climate records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/predict"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-control bg-primary hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Sprout className="h-3.5 w-3.5" />
            <span>Open Predictor</span>
          </Link>
        </div>
      </div>

      {/* Hero KPI Row (5 metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatCard
          label="Total Verified Records"
          value={summary ? summary.total_records.toLocaleString() : '25,932'}
          description="0 missing cells"
          icon={Database}
        />
        <StatCard
          label="Agricultural Countries"
          value={summary ? summary.total_countries : 101}
          description="Global biomes"
          icon={Globe2}
        />
        <StatCard
          label="Staple Crops"
          value={summary ? summary.total_crops : 10}
          description="Cereals & tubers"
          icon={Sprout}
        />
        <StatCard
          label="Model Accuracy (R²)"
          value="0.9809"
          change="+18.1% vs linear"
          trend="up"
          description="5-Fold verified"
          icon={ShieldCheck}
        />
        <StatCard
          label="Mean Absolute Error"
          value="0.48"
          unit="t/ha"
          description="RMSE: 1.18 t/ha"
          icon={TrendingUp}
        />
      </div>

      {/* Grid: 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Top Crops by Median Yield */}
        <div className="lg:col-span-5">
          <ChartCard
            title="Top Crops by Median Yield"
            takeaway="Tuber crops like potatoes yield 4x to 6x higher biomass than cereal grains"
          >
            <div className="h-[280px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={summary?.top_crops || []}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
                >
                  <XAxis type="number" unit=" t" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="crop" tick={{ fontSize: 11, fill: '#71717a' }} width={80} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderRadius: '8px',
                      border: '1px solid #27272a',
                      fontSize: '12px',
                      color: '#fafafa'
                    }}
                    formatter={(val: number) => [`${val} t/ha`, 'Median Yield']}
                  />
                  <Bar dataKey="median_yield_t_ha" radius={[0, 4, 4, 0]}>
                    {(summary?.top_crops || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.crop === 'Potatoes' ? '#059669' : '#3f3f46'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Yield Trend Over Time */}
        <div className="lg:col-span-7">
          <ChartCard
            title="Global Harvest Yield Trajectory (1990–2013)"
            takeaway="Yield expanded +23.5% over 24 years, driven by hybrid seed genetics and mechanization"
            action={
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-zinc-400">Crop:</span>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="input-subtle text-xs py-1 cursor-pointer"
                >
                  <option value="Wheat">Wheat</option>
                  <option value="Potatoes">Potatoes</option>
                  <option value="Maize">Maize</option>
                  <option value="Rice, paddy">Rice</option>
                  <option value="Soybeans">Soybeans</option>
                </select>
              </div>
            }
          >
            <div className="h-[280px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trends?.datapoints || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                  <XAxis dataKey="Year" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderRadius: '8px',
                      border: '1px solid #27272a',
                      fontSize: '12px',
                      color: '#fafafa'
                    }}
                    formatter={(val: number) => [`${val} t/ha`, 'Mean Yield']}
                  />
                  <Line
                    type="monotone"
                    dataKey="yield_t_ha"
                    stroke="#059669"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#059669' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Feature Importance (What drives yield) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-12">
          <ChartCard
            title="What Drives Crop Yield? (Feature Importance)"
            takeaway="Crop species identity sets the baseline biomass ceiling; hydrothermal weather ratios govern actual harvest"
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
              {featureImportances.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-control bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                      {item.feature}
                    </span>
                    <span className="num-tabular text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.weight}%
                    </span>
                  </div>
                  {/* Subtle bar indicator */}
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${item.weight}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

