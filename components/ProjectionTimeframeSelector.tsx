import React from 'react';
import { ProjectionTimeframe } from '@/types';
import { PROJECTION_TIMEFRAMES } from '@/lib/config';

interface ProjectionTimeframeSelectorProps {
  selectedMonths: number;
  onTimeframeChange: (months: number) => void;
  className?: string;
}

export default function ProjectionTimeframeSelector({
  selectedMonths,
  onTimeframeChange,
  className = ''
}: ProjectionTimeframeSelectorProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="form-label">
        Projection Timeframe
      </label>
      <select
        value={selectedMonths}
        onChange={(e) => onTimeframeChange(Number(e.target.value))}
        className="form-input"
      >
        {PROJECTION_TIMEFRAMES.map((timeframe) => (
          <option key={timeframe.months} value={timeframe.months}>
            {timeframe.label} ({timeframe.months} months)
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Choose how far into the future to project your financial data
      </p>
    </div>
  );
}