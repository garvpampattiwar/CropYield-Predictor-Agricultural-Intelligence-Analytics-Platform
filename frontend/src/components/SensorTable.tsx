import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Activity, Droplets, Thermometer, FlaskConical } from 'lucide-react';

export const SensorTable: React.FC = () => {
  const { sensors } = useAppStore();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-600" />
            Live In-Field IoT Sensor Array
          </h3>
          <p className="text-xs text-slate-500">Real-time telemetry stream from capacitive probes & NPK sensors</p>
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
          Emitting every 4s
        </span>
      </div>

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 pr-4">Field Block</th>
              <th className="py-2.5 px-3">Moisture</th>
              <th className="py-2.5 px-3">pH</th>
              <th className="py-2.5 px-3">NPK Ratio (N-P-K)</th>
              <th className="py-2.5 px-3">Soil Temp</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 pl-3 text-right">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {sensors.map((sensor) => {
              const isMoistureOptimal = sensor.soilMoisture >= 30 && sensor.soilMoisture <= 50;
              const isPhOptimal = sensor.soilPh >= 6.0 && sensor.soilPh <= 7.5;

              return (
                <tr 
                  key={sensor.id} 
                  className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 ${sensor.isNew ? 'highlight-row' : ''}`}
                >
                  <td className="py-3 pr-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {sensor.fieldName}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{sensor.soilMoisture}%</span>
                    <span className={`ml-1 text-[10px] ${isMoistureOptimal ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {isMoistureOptimal ? '● Opt' : '● Low'}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{sensor.soilPh}</span>
                    <span className={`ml-1 text-[10px] ${isPhOptimal ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {isPhOptimal ? '● Bal' : '● Acidic'}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      {sensor.nitrogen} - {sensor.phosphorus} - {sensor.potassium}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">kg/ha</span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                    {sensor.soilTemp}°C
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isMoistureOptimal
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}>
                      {isMoistureOptimal ? 'Optimal Growth' : 'Irrigate Promptly'}
                    </span>
                  </td>
                  <td className="py-3 pl-3 text-right text-slate-400 whitespace-nowrap text-[11px]">
                    {sensor.timestamp}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

