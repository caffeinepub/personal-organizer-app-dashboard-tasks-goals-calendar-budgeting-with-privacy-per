import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DashboardPreferences, SectionKey, SummaryMode } from '@/hooks/dashboard/useDashboardSummaryPreferences';
import { Settings2 } from 'lucide-react';

interface DashboardSummaryTogglesProps {
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

export function DashboardSummaryToggles({
  preferences,
  onToggleSection,
  onSetMode,
}: DashboardSummaryTogglesProps) {
  return (
    <Card className="settings-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings2 className="h-4 w-4" />
          Summary Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="settings-group">
          {sections.map((section) => (
            <div key={section.key} className="settings-group-item">
              <div className="flex items-center justify-between">
                <Label htmlFor={`toggle-${section.key}`} className="text-sm font-medium">
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
                  <SelectTrigger className="h-8 text-xs mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stats">Stats</SelectItem>
                    <SelectItem value="recent">Recent</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
