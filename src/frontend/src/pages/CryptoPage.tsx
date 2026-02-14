import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useGetCryptoPortfolio } from '@/hooks/crypto/useCrypto';
import CryptoEntryList from '@/components/crypto/CryptoEntryList';
import CryptoEntryFormDialog from '@/components/crypto/CryptoEntryFormDialog';
import CryptoSummary from '@/components/crypto/CryptoSummary';
import SecurityNote from '@/components/common/SecurityNote';

export default function CryptoPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: entries = [], isLoading } = useGetCryptoPortfolio();

  return (
    <div className="space-y-5 crypto-theme">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crypto Portfolio</h1>
          <p className="text-muted-foreground text-sm">Track your cryptocurrency holdings</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="default" className="crypto-button">
          <Plus className="mr-2 h-4 w-4" />
          Add Position
        </Button>
      </div>

      <SecurityNote />

      <CryptoSummary entries={entries} />

      <CryptoEntryList entries={entries} isLoading={isLoading} />

      <CryptoEntryFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
