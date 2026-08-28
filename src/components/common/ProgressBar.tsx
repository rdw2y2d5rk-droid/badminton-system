import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ProgressBarProps {
  attended: number;
  total: number;
  remaining?: number;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const SessionProgressBar: React.FC<ProgressBarProps> = ({
  attended,
  total,
  remaining: customRemaining,
  showDetails = true,
  size = 'md'
}) => {
  const remaining = customRemaining !== undefined ? customRemaining : Math.max(0, total - attended);
  const percentage = Math.min(100, Math.round((attended / (total || 1)) * 100));

  // Determine color scheme based on remaining sessions
  const isExpired = remaining === 0;
  const isWarning = remaining > 0 && remaining <= 2;

  let barColor = 'bg-emerald-500';
  let badgeColor = 'text-slate-600 bg-slate-100';

  if (isExpired) {
    barColor = 'bg-rose-500';
    badgeColor = 'text-rose-700 bg-rose-50 border border-rose-200';
  } else if (isWarning) {
    barColor = 'bg-amber-500';
    badgeColor = 'text-amber-800 bg-amber-50 border border-amber-200';
  }

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className="w-full min-w-[140px]">
      <div className="flex items-center justify-between mb-1 text-xs">
        <span className="font-semibold text-slate-800">
          {attended}/{total} <span className="font-normal text-slate-500">buổi</span>
        </span>
        {isExpired ? (
          <span className="inline-flex items-center gap-1 font-bold text-rose-600 text-[11px]">
            <AlertCircle className="w-3 h-3" /> Hết buổi
          </span>
        ) : isWarning ? (
          <span className="inline-flex items-center gap-1 font-semibold text-amber-600 text-[11px]">
            <AlertCircle className="w-3 h-3" /> Còn {remaining} buổi
          </span>
        ) : (
          <span className="font-medium text-emerald-700 text-[11px]">
            Còn {remaining} buổi
          </span>
        )}
      </div>

      {/* Progress track */}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClass} border border-slate-200/60`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {showDetails && (
        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
          <span>Tiến độ {percentage}%</span>
          <span>{total} buổi / khóa</span>
        </div>
      )}
    </div>
  );
};
