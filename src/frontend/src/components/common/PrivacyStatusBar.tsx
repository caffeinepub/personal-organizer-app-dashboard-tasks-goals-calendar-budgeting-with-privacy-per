import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Shield, ShieldAlert } from 'lucide-react';

export default function PrivacyStatusBar() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <div
      className={`privacy-status-bar ${
        isAuthenticated ? 'privacy-status-secure' : 'privacy-status-insecure'
      }`}
    >
      <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
        {isAuthenticated ? (
          <>
            <Shield className="h-4 w-4" />
            <span>Privacy Confirmed · Secure Session</span>
          </>
        ) : (
          <>
            <ShieldAlert className="h-4 w-4" />
            <span>Not Secure · Please Log In</span>
          </>
        )}
      </div>
    </div>
  );
}
