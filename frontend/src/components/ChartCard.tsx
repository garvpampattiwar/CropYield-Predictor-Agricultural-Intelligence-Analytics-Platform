import React from 'react';

interface ChartCardProps {
  title: string;
  takeaway?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  takeaway,
  action,
  children,
  className = '',
}) => {
  return (
    <div className={`card-subtle p-5 flex flex-col justify-between ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-2 border-b border-zinc-100 dark:border-zinc-800/80">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
          {takeaway && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {takeaway}
            </p>
          )}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>

      <div className="flex-1 w-full min-h-[220px]">
        {children}
      </div>
    </div>
  );
};

