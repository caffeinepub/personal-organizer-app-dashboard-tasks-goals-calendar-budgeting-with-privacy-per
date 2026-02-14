import { Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SecurityNote() {
  return (
    <Alert className="security-note">
      <Shield className="h-4 w-4" />
      <AlertDescription className="text-xs">
        Your entries are protected with encryption and integrity safeguards. Secure login required.
      </AlertDescription>
    </Alert>
  );
}
