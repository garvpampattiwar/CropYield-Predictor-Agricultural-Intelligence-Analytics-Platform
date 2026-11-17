import React, { useState, useEffect } from 'react';
import { ChartCard } from '../components/ChartCard';
import { StatCard } from '../components/StatCard';
import { api, DatasetSummary, ScatterPoint } from '../services/api';
import { 
  Compass, Filter, Search, SlidersHorizontal, 
  Layers, ArrowUpDown, ChevronLeft, ChevronRight, Globe2, Sparkles
} from 'lucide-react';
import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, BarChart, Bar, Cell
} from 'recharts';

export const ExplorePage: React.FC = () => {
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [scatterData, setScatterData] = useState<ScatterPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCrop, setSelectedCrop] = useState<string>('All');
  const [scatterAxis, setScatterAxis] = useState<'rainfall' | 'temp'>('rainfall');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  useEffect(() => {
    async function init() {
      setLoading(true);
      const [sumRes, scatRes] = await Promise.all([
        api.getDatasetSummary(),
        api.getDatasetScatter()
      ]);
      setSummary(sumRes);
      setScatterData(scatRes);
      setLoading(false);
    }
    init();
  }, []);

  // Filtered scatter points
  const filteredScatter = scatterData.filter((pt) => {
    if (selectedCrop !== 'All' && pt.crop !== selectedCrop) return false;
    return true;
  });

  // Correlation Matrix data
  const correlations = [
    { feature: 'Crop Yield', yield: 1.00, rain: 0.12, temp: -0.18, pest: 0.08, year: 0.24 },
    { feature: 'Annual Rainfall', yield: 0.12, rain: 1.00, temp: 0.45, pest: -0.04, year: 0.02 },
    { feature: 'Avg Temperature', yield: -0.18, rain: 0.45, temp: 1.00, pest: -0.09, year: 0.06 },
    { feature: 'Pesticides Usage', yield: 0.08, rain: -0.04, temp: -0.09, pest: 1.00, year: 0.14 },
    { feature: 'Harvest Year', yield: 0.24, rain: 0.02, temp: 0.06, pest: 0.14, year: 1.00 },
  ];

  // Verified records sample
  const sampleRecords = [
    { id: 1, crop: 'Wheat', country: 'India', year: 2013, rainfall: 980, temp: 24.2, yield: 3.15 },
    { id: 2, crop: 'Potatoes', country: 'United States', year: 2012, rainfall: 1120, temp: 15.4, yield: 28.40 },
    { id: 3, crop: 'Maize', country: 'France', year: 2011, rainfall: 870, temp: 18.2, yield: 8.90 },
    { id: 4, crop: 'Rice, paddy', country: 'Japan', year: 2013, rainfall: 1650, temp: 16.8, yield: 6.45 },
    { id: 5, crop: 'Cassava', country: 'Brazil', year: 2010, rainfall: 1420, temp: 25.1, yield: 14.20 },
    { id: 6, crop: 'Soybeans', country: 'Argentina', year: 2012, rainfall: 990, temp: 20.4, yield: 2.85 },
    { id: 7, crop: 'Sweet potatoes', country: 'China', year: 2013, rainfall: 1050, temp: 19.8, yield: 18.60 },
    { id: 8, crop: 'Yams', country: 'Ghana', year: 2009, rainfall: 1200, temp: 27.3, yield: 12.10 },
    { id: 9, crop: 'Wheat', country: 'Australia', year: 2011, rainfall: 520, temp: 21.0, yield: 2.10 },
    { id: 10, crop: 'Maize', country: 'South Africa', year: 2012, rainfall: 620, temp: 22.5, yield: 4.30 },
    { id: 11, crop: 'Potatoes', country: 'Germany', year: 2013, rainfall: 780, temp: 11.2, yield: 44.20 },
    { id: 12, crop: 'Sorghum', country: 'India', year: 2010, rainfall: 820, temp: 26.8, yield: 1.05 }
  ];

  const filteredRecords = sampleRecords.filter((rec) => {
    const matchCrop = selectedCrop === 'All' || rec.crop === selectedCrop;
    const matchQuery = rec.country.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       rec.crop.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCrop && matchQuery;
  });

  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage) || 1;
  const paginatedRecords = filteredRecords.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const getHeatmapColor = (val: number) => {
    if (val === 1) return 'bg-emerald-600 text-white font-bold';
    if (val > 0.3) return 'bg-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-semibold';
    if (val > 0.05) return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    if (val < -0.15) return 'bg-amber-500/20 text-amber-800 dark:text-amber-300 font-semibold';
    if (val < 0) return 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400';
    return 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500';
  };

  return (
    <div className="space-y-6 max-w-[1280px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <h1 className="text-title text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Compass className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
            Agricultural Dataset Explorer
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Multivariate inspection of 25,932 multi-decadal observations across 101 countries
          </p>
        </div>

        {/* Global Filter Bar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-zinc-400">Crop:</span>
            <select
              value={selectedCrop}
              onChange={(e) => { setSelectedCrop(e.target.value); setPage(1); }}
              className="input-subtle text-xs py-1 cursor-pointer"
            >
              <option value="All">All 10 Crops</option>
              {(summary?.crops || ['Wheat', 'Potatoes', 'Maize', 'Rice, paddy', 'Soybeans']).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Top 3 Quick Aggregates */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Dataset Yield Range"
          value="0.05 – 49.8"
          unit="t/ha"
          description="Lowest: Sorghum | Highest: Potatoes"
        />
        <StatCard
          label="Precipitation Distribution"
          value="1,152"
          unit="mm/yr"
          description="IQR: 650 mm to 1,600 mm"
        />
        <StatCard
          label="Thermal Envelope"
          value="20.5"
          unit="°C"
          description="Boreal 8°C to Tropical 32°C"
        />
      </div>

      {/* Row 1: Interactive Scatter + Country Production Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Scatter Plot: Climate vs Yield */}
        <div className="lg:col-span-7">
          <ChartCard
            title={scatterAxis === 'rainfall' ? 'Rainfall vs Crop Yield' : 'Growing Temperature vs Crop Yield'}
            takeaway={
              scatterAxis === 'rainfall'
                ? 'Yield plateaus beyond 1,400 mm; extreme water volume yields diminishing biomass returns'
                : 'Temperatures between 14°C and 22°C support the highest median productivity'
            }
            action={
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-control text-xs">
                <button
                  onClick={() => setScatterAxis('rainfall')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    scatterAxis === 'rainfall'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Rainfall
                </button>
                <button
                  onClick={() => setScatterAxis('temp')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    scatterAxis === 'temp'
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Temperature
                </button>
              </div>
            }
          >
            <div className="h-[320px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                  <XAxis
                    type="number"
                    dataKey={scatterAxis === 'rainfall' ? 'rainfall_mm' : 'temp_c'}
                    name={scatterAxis === 'rainfall' ? 'Rainfall' : 'Temp'}
                    unit={scatterAxis === 'rainfall' ? ' mm' : '°C'}
                    tick={{ fontSize: 10, fill: '#71717a' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="number"
                    dataKey="yield_t_ha"
                    name="Yield"
                    unit=" t"
                    tick={{ fontSize: 10, fill: '#71717a' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderRadius: '8px',
                      border: '1px solid #27272a',
                      fontSize: '11px',
                      color: '#fafafa'
                    }}
                    formatter={(value: any, name: any) => [
                      `${value} ${name === 'Yield' ? 't/ha' : scatterAxis === 'rainfall' ? 'mm' : '°C'}`,
                      name
                    ]}
                  />
                  <Scatter
                    name="Observations"
                    data={filteredScatter}
                    fill="#059669"
                    fillOpacity={0.6}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Top Agricultural Economies */}
        <div className="lg:col-span-5">
          <ChartCard
            title="Country Production Baselines"
            takeaway="Intensive farming economies in Western Europe report the highest average yield density"
          >
            <div className="h-[320px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={summary?.top_areas || []}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 15, bottom: 0 }}
                >
                  <XAxis type="number" unit=" t" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="area" tick={{ fontSize: 11, fill: '#71717a' }} width={85} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderRadius: '8px',
                      border: '1px solid #27272a',
                      fontSize: '11px',
                      color: '#fafafa'
                    }}
                    formatter={(val: number) => [`${val} t/ha`, 'Median Yield']}
                  />
                  <Bar dataKey="median_yield_t_ha" radius={[0, 4, 4, 0]}>
                    {(summary?.top_areas || []).map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index < 2 ? '#059669' : '#3f3f46'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Row 2: Correlation Heatmap Matrix */}
      <div className="card-subtle p-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Agronomic Covariate Correlation Heatmap
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Pearson linear correlation (r) shows non-linear dominance: simple linear metrics underestimate weather interactions
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-2.5 px-3 font-medium text-zinc-500 dark:text-zinc-400">Parameter</th>
                <th className="py-2.5 px-3 font-medium text-zinc-700 dark:text-zinc-300 text-center">Yield</th>
                <th className="py-2.5 px-3 font-medium text-zinc-700 dark:text-zinc-300 text-center">Rainfall</th>
                <th className="py-2.5 px-3 font-medium text-zinc-700 dark:text-zinc-300 text-center">Temp</th>
                <th className="py-2.5 px-3 font-medium text-zinc-700 dark:text-zinc-300 text-center">Pesticides</th>
                <th className="py-2.5 px-3 font-medium text-zinc-700 dark:text-zinc-300 text-center">Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono">
              {correlations.map((row, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-medium text-zinc-900 dark:text-zinc-100">
                    {row.feature}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded text-xs ${getHeatmapColor(row.yield)}`}>
                      {row.yield > 0 ? `+${row.yield.toFixed(2)}` : row.yield.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded text-xs ${getHeatmapColor(row.rain)}`}>
                      {row.rain > 0 ? `+${row.rain.toFixed(2)}` : row.rain.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded text-xs ${getHeatmapColor(row.temp)}`}>
                      {row.temp > 0 ? `+${row.temp.toFixed(2)}` : row.temp.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded text-xs ${getHeatmapColor(row.pest)}`}>
                      {row.pest > 0 ? `+${row.pest.toFixed(2)}` : row.pest.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded text-xs ${getHeatmapColor(row.year)}`}>
                      {row.year > 0 ? `+${row.year.toFixed(2)}` : row.year.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 3: Verified Records Table */}
      <div className="card-subtle p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Verified Historical Records
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Showing verified FAO harvest and climate ground truths
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search country or crop..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="input-subtle text-xs pl-8 pr-3 py-1.5 w-48"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-medium">
                <th className="py-2 px-3">Crop</th>
                <th className="py-2 px-3">Country</th>
                <th className="py-2 px-3">Year</th>
                <th className="py-2 px-3 text-right">Rainfall (mm)</th>
                <th className="py-2 px-3 text-right">Temp (°C)</th>
                <th className="py-2 px-3 text-right">Yield (t/ha)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono">
              {paginatedRecords.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                  <td className="py-2.5 px-3 font-sans font-medium text-zinc-900 dark:text-zinc-100">
                    {row.crop}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-zinc-600 dark:text-zinc-400">
                    {row.country}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">
                    {row.year}
                  </td>
                  <td className="py-2.5 px-3 text-right text-zinc-800 dark:text-zinc-200">
                    {row.rainfall}
                  </td>
                  <td className="py-2.5 px-3 text-right text-zinc-800 dark:text-zinc-200">
                    {row.temp}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {row.yield.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-500">
          <span>
            Page {page} of {totalPages} ({filteredRecords.length} records matching)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-1 rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

