import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthDayKeys } from '@/utils/calendar/dateBuckets';

interface MonthCalendarViewProps {
  year: number;
  month: number;
  scheduledDays: Set<string>;
  onMonthChange: (year: number, month: number) => void;
  onDayClick?: (dayKey: string) => void;
}

export default function MonthCalendarView({
  year,
  month,
  scheduledDays,
  onMonthChange,
  onDayClick,
}: MonthCalendarViewProps) {
  const dayKeys = getMonthDayKeys(year, month);
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    if (month === 0) {
      onMonthChange(year - 1, 11);
    } else {
      onMonthChange(year, month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      onMonthChange(year + 1, 0);
    } else {
      onMonthChange(year, month + 1);
    }
  };

  return (
    <Card className="settings-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <CardTitle className="text-lg">{monthName}</CardTitle>
        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-sm text-center text-muted-foreground font-semibold py-2">
              {day}
            </div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {dayKeys.map((dayKey) => {
            const day = new Date(dayKey).getDate();
            const hasEvent = scheduledDays.has(dayKey);
            const isToday = dayKey === new Date().toISOString().split('T')[0];
            
            return (
              <button
                key={dayKey}
                onClick={() => onDayClick?.(dayKey)}
                className={`relative aspect-square text-sm rounded-lg hover:bg-accent transition-colors flex items-center justify-center ${
                  isToday ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''
                }`}
              >
                {day}
                {hasEvent && (
                  <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                    isToday ? 'bg-primary-foreground' : 'bg-primary'
                  }`} />
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
