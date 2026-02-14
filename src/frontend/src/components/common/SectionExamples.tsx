import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';

interface Example {
  title: string;
  description?: string;
}

interface SectionExamplesProps {
  sectionName: string;
  examples: Example[];
}

export default function SectionExamples({ sectionName, examples }: SectionExamplesProps) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-muted-foreground" />
          Example {sectionName}
          <Badge variant="outline" className="ml-auto text-xs">
            Templates
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {examples.map((example, index) => (
          <div key={index} className="text-sm">
            <p className="font-medium text-muted-foreground">{example.title}</p>
            {example.description && (
              <p className="text-xs text-muted-foreground/70 mt-0.5">{example.description}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
