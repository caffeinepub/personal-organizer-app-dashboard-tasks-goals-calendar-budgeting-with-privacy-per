import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface IntegrityWarningBannerProps {
  message: string;
}

export default function IntegrityWarningBanner({ message }: IntegrityWarningBannerProps) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Integrity Warning</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
