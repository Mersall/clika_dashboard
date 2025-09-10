import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface DaypartingHeatmapProps {
  data: Record<string, Record<number, number>>; // day -> hour -> value
  title?: string;
  valueLabel?: string;
  maxValue?: number;
}

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS: Record<string, string> = {
  'mon': 'Mon',
  'tue': 'Tue', 
  'wed': 'Wed',
  'thu': 'Thu',
  'fri': 'Fri',
  'sat': 'Sat',
  'sun': 'Sun'
};

export function DaypartingHeatmap({ 
  data, 
  title = 'Campaign Performance Heatmap',
  valueLabel = 'Impressions',
  maxValue
}: DaypartingHeatmapProps) {
  const { t } = useTranslation();
  
  // Calculate max value if not provided
  const calculatedMaxValue = useMemo(() => {
    if (maxValue) return maxValue;
    
    let max = 0;
    Object.values(data).forEach(hours => {
      Object.values(hours).forEach(value => {
        if (value > max) max = value;
      });
    });
    return max || 1;
  }, [data, maxValue]);
  
  // Generate hour labels
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Get color intensity based on value
  const getColorIntensity = (value: number) => {
    const intensity = Math.round((value / calculatedMaxValue) * 100);
    if (intensity === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (intensity <= 20) return 'bg-primary/20';
    if (intensity <= 40) return 'bg-primary/40';
    if (intensity <= 60) return 'bg-primary/60';
    if (intensity <= 80) return 'bg-primary/80';
    return 'bg-primary';
  };
  
  const getCellValue = (day: string, hour: number): number => {
    return data[day]?.[hour] || 0;
  };
  
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">{title}</h3>
      
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Hour labels */}
          <div className="flex mb-2">
            <div className="w-12"></div>
            {hours.map(hour => (
              <div 
                key={hour} 
                className="flex-1 text-center text-xs text-gray-500 dark:text-gray-400"
              >
                {hour}
              </div>
            ))}
            <div className="w-4"></div>
          </div>
          
          {/* Day rows */}
          {DAYS.map(day => (
            <div key={day} className="flex items-center mb-1">
              <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400">
                {DAY_LABELS[day]}
              </div>
              {hours.map(hour => {
                const value = getCellValue(day, hour);
                const percentage = Math.round((value / calculatedMaxValue) * 100);
                
                return (
                  <div
                    key={`${day}-${hour}`}
                    className="flex-1 mx-px"
                  >
                    <div
                      className={`h-8 rounded-sm ${getColorIntensity(value)} transition-colors cursor-pointer relative group`}
                      title={`${DAY_LABELS[day]} ${hour}:00 - ${value} ${valueLabel}`}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                          <div className="font-semibold">{DAY_LABELS[day]} {hour}:00</div>
                          <div>{value} {valueLabel} ({percentage}%)</div>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="w-4"></div>
            </div>
          ))}
          
          {/* Legend */}
          <div className="mt-6 flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">Low</span>
            <div className="flex gap-1">
              <div className="w-8 h-4 rounded bg-primary/20"></div>
              <div className="w-8 h-4 rounded bg-primary/40"></div>
              <div className="w-8 h-4 rounded bg-primary/60"></div>
              <div className="w-8 h-4 rounded bg-primary/80"></div>
              <div className="w-8 h-4 rounded bg-primary"></div>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">High</span>
            <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
              Max: {calculatedMaxValue} {valueLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}