import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CalendarView } from '@/hooks/calendar/useCalendarViewPreference';

interface CalendarViewSelectorProps {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

export default function CalendarViewSelector({ view, onViewChange }: CalendarViewSelectorProps) {
  return (
    <Select value={view} onValueChange={(value: CalendarView) => onViewChange(value)}>
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="year">Year View</SelectItem>
        <SelectItem value="month">Month View</SelectItem>
        <SelectItem value="week">Week View</SelectItem>
      </SelectContent>
    </Select>
  );
}
