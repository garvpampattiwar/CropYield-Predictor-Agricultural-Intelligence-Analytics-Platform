import React, { useState } from 'react';
import { MOCK_MANDI_PRICES } from '../services/mockAgriData';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Sparkles, Filter, MapPin } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

export const MarketPricesPage: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [prices] = useState(MOCK_MANDI_PRICES);

  // 30-Day Mandi Historical Price Trend (Wheat)
  const mandiTrend = [
    { day: 'Day 1', price: 2540 },
    { day: 'Day 5', price: 2580 },
    { day: 'Day 10', price: 2620 },
    { day: 'Day 15', price: 2610 },
    { day: 'Day 20', price: 2690 },
    { day: 'Day 25', price: 2720 },
    { day: 'Today', price: 2740 },
  ];

  const filteredPrices = selectedCrop === 'All' 
    ? prices 
    : prices.filter(p => p.commodity.toLowerCase().includes(selectedCrop.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
            Live Agricultural Mandi Market Rates
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time APMC mandi trade ticker, pricing volatility, and optimal sell-window algorithms
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl text-xs font-semibold">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <button 
            onClick={() => setSelectedCrop('All')} 
            className={`px-2.5 py-1 rounded-lg ${selectedCrop === 'All' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
          >
            All
          </button>
          <button 
            onClick={() => setSelectedCrop('Wheat')} 
            className={`px-2.5 py-1 rounded-lg ${selectedCrop === 'Wheat' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
          >
            Wheat
          </button>
          <button 
            onClick={() => setSelectedCrop('Potatoes')} 
            className={`px-2.5 py-1 rounded-lg ${selectedCrop === 'Potatoes' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
          >
            Potatoes
          </button>
          <button 
            onClick={() => setSelectedCrop('Soybean')} 
            className={`px-2.5 py-1 rounded-lg ${selectedCrop === 'Soybean' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
          >
            Soybean
          </button>
        </div>
      </div>

      {/* Best-Time-To-Sell Hero Advisory */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-6 text-slate-950 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-black/15 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
            <Sparkles className="h-3 w-3" /> Predictive Trading Advisory
          </div>
          <h2 className="text-xl font-black text-white">Strong Sell Window Open for Wheat</h2>
          <p className="text-xs text-amber-50 mt-1 max-w-xl">
            Nashik and Lasalgaon mandis show a 14-day high of ₹2,740/qtl due to low arrival volumes. 
            Prices are forecasted to normalize by next week as Northern arrivals pick up.
          </p>
        </div>
        <div className="bg-white/90 backdrop-blur px-5 py-3 rounded-2xl text-center self-stretch md:self-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Recommended Window</span>
          <span className="text-sm font-black text-slate-900 block mt-0.5">Next 48–72 Hours</span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Capture +4.2% Premium</span>
        </div>
      </div>

      {/* Mandi Price Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">Live APMC Mandi Rates Ticker</h3>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 pr-4">Commodity</th>
                <th className="py-2.5 px-3">Mandi Market</th>
                <th className="py-2.5 px-3">State</th>
                <th className="py-2.5 px-3">Modal Rate</th>
                <th className="py-2.5 px-3">Min / Max Span</th>
                <th className="py-2.5 px-3">24h Change</th>
                <th className="py-2.5 pl-3 text-right">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredPrices.map((p) => {
                const isPositive = p.change24h >= 0;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 pr-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {p.commodity}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                      {p.mandi}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-400 text-[11px]">
                      {p.state}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-black text-slate-900 dark:text-white">
                      ₹{p.modalPrice.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">/ qtl</span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-500 text-[11px]">
                      ₹{p.minPrice} – ₹{p.maxPrice}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-0.5 font-bold ${
                        isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                      }`}>
                        {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {Math.abs(p.change24h)}%
                      </span>
                    </td>
                    <td className="py-3 pl-3 text-right whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.recommendation === 'Strong Sell'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : p.recommendation === 'Accumulate'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {p.recommendation}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 30-Day Trend Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
          Wheat (Lokwan) 30-Day Mandi Price Momentum
        </h3>
        <p className="text-xs text-slate-500 mb-4">Lasalgaon & Nashik combined modal rate (₹ / quintal)</p>

        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mandiTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis domain={[2500, 2800]} tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  fontSize: '11px', 
                  backgroundColor: '#0f172a', 
                  color: '#ffffff',
                  border: 'none'
                }} 
              />
              <Line type="monotone" dataKey="price" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

