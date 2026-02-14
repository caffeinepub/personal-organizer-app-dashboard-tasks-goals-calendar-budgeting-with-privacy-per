import { Card, CardContent } from '@/components/ui/card';
import { getYearMonths, getMonthDayKeys } from '@/utils/calendar/dateBuckets';

interface YearCalendarViewProps {
  year: number;
  scheduledDays: Set<string>;
  onDayClick?: (dayKey: string) => void;
}

export default function YearCalendarView({ year, scheduledDays, onDayClick }: YearCalendarViewProps) {
  const months = getYearMonths(year);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {months.map(({ month, name }) => {
        const dayKeys = getMonthDayKeys(year, month);
        const firstDay = new Date(year, month, 1).getDay();
        
        return (
          <Card key={month} className="settings-card">
            <CardContent className="p-3">
              <h3 className="text-sm font-semibold mb-2 text-center">{name}</h3>
              <div className="grid grid-cols-7 gap-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-xs text-center text-muted-foreground font-medium">
                    {day}
                  </div>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {dayKeys.map((dayKey) => {
                  const day = new Date(dayKey).getDate();
                  const hasEvent = scheduledDays.has(dayKey);
                  
                  return (
                    <button
                      key={dayKey}
                      onClick={() => onDayClick?.(dayKey)}
                      className="relative aspect-square text-xs rounded hover:bg-accent transition-colors flex items-center justify-center"
                    >
                      {day}
                      {hasEvent && (
                        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
