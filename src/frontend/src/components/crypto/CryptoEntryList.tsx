import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { useDeleteCryptoEntry } from '@/hooks/crypto/useCrypto';
import { toast } from 'sonner';
import type { CryptoEntry } from '@/backend';
import { useState } from 'react';
import CryptoEntryFormDialog from './CryptoEntryFormDialog';
import SectionExamples from '@/components/common/SectionExamples';

interface CryptoEntryListProps {
  entries: CryptoEntry[];
  isLoading: boolean;
}

export default function CryptoEntryList({ entries, isLoading }: CryptoEntryListProps) {
  const [editingEntry, setEditingEntry] = useState<CryptoEntry | null>(null);
  const deleteEntry = useDeleteCryptoEntry();

  const handleDelete = async (id: bigint) => {
    if (!confirm('Are you sure you want to delete this position?')) return;
    try {
      await deleteEntry.mutateAsync(id);
      toast.success('Position deleted successfully');
    } catch (error) {
      toast.error('Failed to delete position');
    }
  };

  const formatPrice = (cents: bigint) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(cents) / 100);
  };

  const calculateValue = (amount: bigint, priceCents: bigint) => {
    return (Number(amount) * Number(priceCents)) / 100;
  };

  const cryptoExamples = [
    { title: 'BTC - 0.5 units', description: 'Bitcoin position at $45,000' },
    { title: 'ETH - 2.0 units', description: 'Ethereum position at $3,200' },
    { title: 'ICP - 100 units', description: 'Internet Computer position at $12' },
  ];

  if (isLoading) {
    return (
      <Card className="crypto-card">
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="crypto-card">
        <CardContent className="py-8 space-y-4">
          <div className="text-center text-muted-foreground text-sm">
            No crypto positions yet. Add your first position to start tracking.
          </div>
          <SectionExamples sectionName="Crypto Positions" examples={cryptoExamples} />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle className="text-lg">Your Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id.toString()}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {entry.symbol.toUpperCase()}
                    </Badge>
                    <span className="text-sm font-medium">
                      {Number(entry.amount).toLocaleString()} units
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Purchase: {formatPrice(entry.purchasePriceCents)}</span>
                    <span>Current: {formatPrice(entry.currentPriceCents)}</span>
                    <span className="font-medium">
                      Value: {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(calculateValue(entry.amount, entry.currentPriceCents))}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditingEntry(entry)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDelete(entry.id)}
                    disabled={deleteEntry.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <CryptoEntryFormDialog
        open={!!editingEntry}
        onOpenChange={(open) => !open && setEditingEntry(null)}
        editingEntry={editingEntry}
      />
    </>
  );
}
