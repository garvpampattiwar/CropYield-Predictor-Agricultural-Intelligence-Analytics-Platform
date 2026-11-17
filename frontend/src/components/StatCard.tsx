import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
  icon?: LucideIcon;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  change,
  trend = 'neutral',
  description,
  icon: Icon,
}) => {
  return (
    <div className="card-subtle-hover p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </span>
        {Icon && (
          <Icon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" strokeWidth={1.5} />
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="num-tabular text-kpi text-zinc-900 dark:text-zinc-100">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {unit}
          </span>
        )}
      </div>

      {(change || description) && (
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          {change && (
            <span
              className={`inline-flex items-center font-medium px-1.5 py-0.5 rounded text-[11px] ${
                trend === 'up'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  : trend === 'down'
                  ? 'bg-red-500/10 text-red-700 dark:text-red-400'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {change}
            </span>
          )}
          {description && (
            <span className="text-zinc-500 dark:text-zinc-400 truncate">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
