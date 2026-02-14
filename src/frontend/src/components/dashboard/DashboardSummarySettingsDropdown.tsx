import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings2 } from 'lucide-react';
import type { DashboardPreferences, SectionKey, SummaryMode } from '@/hooks/dashboard/useDashboardSummaryPreferences';

interface DashboardSummarySettingsDropdownProps {
  preferences: DashboardPreferences;
  onToggleSection: (section: SectionKey) => void;
  onSetMode: (section: SectionKey, mode: SummaryMode) => void;
}

const sections: Array<{ key: SectionKey; label: string }> = [
  { key: 'tasks', label: 'Tasks' },
  { key: 'goals', label: 'Goals' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'budget', label: 'Budget' },
];

export function DashboardSummarySettingsDropdown({
  preferences,
  onToggleSection,
  onSetMode,
}: DashboardSummarySettingsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          Summary Settings
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="p-2 space-y-3">
          <div className="text-sm font-medium px-2">Dashboard Summaries</div>
          <DropdownMenuSeparator />
          {sections.map((section, index) => (
            <div key={section.key}>
              <div className="space-y-2 px-2 py-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`toggle-${section.key}`} className="text-sm font-medium cursor-pointer">
                    {section.label}
                  </Label>
                  <Switch
                    id={`toggle-${section.key}`}
                    checked={preferences[section.key].enabled}
                    onCheckedChange={() => onToggleSection(section.key)}
                  />
                </div>
                {preferences[section.key].enabled && (
                  <Select
                    value={preferences[section.key].mode}
                    onValueChange={(value) => onSetMode(section.key, value as SummaryMode)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stats">Stats</SelectItem>
                      <SelectItem value="recent">Recent</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              {index < sections.length - 1 && <DropdownMenuSeparator />}
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
