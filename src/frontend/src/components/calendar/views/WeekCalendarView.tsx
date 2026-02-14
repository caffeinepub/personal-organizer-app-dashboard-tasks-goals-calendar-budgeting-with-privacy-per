import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getWeekDayKeys, getWeekStart } from '@/utils/calendar/dateBuckets';

interface WeekCalendarViewProps {
  startDate: Date;
  scheduledDays: Set<string>;
  onWeekChange: (startDate: Date) => void;
  onDayClick?: (dayKey: string) => void;
}

export default function WeekCalendarView({
  startDate,
  scheduledDays,
  onWeekChange,
  onDayClick,
}: WeekCalendarViewProps) {
  const dayKeys = getWeekDayKeys(startDate);
  const weekStart = new Date(startDate);
  const weekEnd = new Date(startDate);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const handlePrevWeek = () => {
    const newStart = new Date(startDate);
    newStart.setDate(newStart.getDate() - 7);
    onWeekChange(newStart);
  };

  const handleNextWeek = () => {
    const newStart = new Date(startDate);
    newStart.setDate(newStart.getDate() + 7);
    onWeekChange(newStart);
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <Card className="settings-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <CardTitle className="text-lg">{weekLabel}</CardTitle>
        <Button variant="ghost" size="icon" onClick={handleNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
          {dayKeys.map((dayKey, index) => {
            const date = new Date(dayKey);
            const day = date.getDate();
            const hasEvent = scheduledDays.has(dayKey);
            const isToday = dayKey === new Date().toISOString().split('T')[0];
            
            return (
              <button
                key={dayKey}
                onClick={() => onDayClick?.(dayKey)}
                className={`relative p-3 rounded-lg border transition-colors hover:bg-accent ${
                  isToday ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="text-xs text-muted-foreground mb-1">{dayNames[index]}</div>
                <div className={`text-2xl font-semibold ${isToday ? 'text-primary' : ''}`}>{day}</div>
                {hasEvent && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
