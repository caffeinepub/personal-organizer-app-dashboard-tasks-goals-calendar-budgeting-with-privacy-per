import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { LucideIcon } from 'lucide-react';

interface SectionSummaryBlockProps {
  title: string;
  icon: LucideIcon;
  stats: Array<{ label: string; value: string | number }>;
  secondary?: string;
  isEmpty: boolean;
  isLoading: boolean;
  emptyMessage: string;
  color?: string;
}

export function SectionSummaryBlock({
  title,
  icon: Icon,
  stats,
  secondary,
  isEmpty,
  isLoading,
  emptyMessage,
  color = 'text-primary',
}: SectionSummaryBlockProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className={`h-5 w-5 ${color}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : isEmpty ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <>
            <div className="space-y-2">
              {stats.map((stat, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <span className="text-sm font-semibold">{stat.value}</span>
                </div>
              ))}
            </div>
            {secondary && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground line-clamp-2">{secondary}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
