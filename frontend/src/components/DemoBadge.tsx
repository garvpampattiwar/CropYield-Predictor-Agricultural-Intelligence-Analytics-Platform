import React from 'react';

interface DemoBadgeProps {
  className?: string;
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({ className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 ${className}`}
      title="This component streams simulated demonstration telemetry"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
      Demo data
    </span>
  );
};

