import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateCryptoEntry, useUpdateCryptoEntry } from '@/hooks/crypto/useCrypto';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { CryptoEntry } from '@/backend';

interface CryptoEntryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEntry?: CryptoEntry | null;
}

export default function CryptoEntryFormDialog({
  open,
  onOpenChange,
  editingEntry,
}: CryptoEntryFormDialogProps) {
  const [symbol, setSymbol] = useState('');
  const [amount, setAmount] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');

  const createEntry = useCreateCryptoEntry();
  const updateEntry = useUpdateCryptoEntry();

  useEffect(() => {
    if (editingEntry) {
      setSymbol(editingEntry.symbol);
      setAmount(editingEntry.amount.toString());
      setPurchasePrice((Number(editingEntry.purchasePriceCents) / 100).toString());
      setCurrentPrice((Number(editingEntry.currentPriceCents) / 100).toString());
    } else {
      setSymbol('');
      setAmount('');
      setPurchasePrice('');
      setCurrentPrice('');
    }
  }, [editingEntry, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!symbol.trim() || !amount || !purchasePrice || !currentPrice) {
      toast.error('Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    const purchasePriceNum = parseFloat(purchasePrice);
    const currentPriceNum = parseFloat(currentPrice);

    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Amount must be a positive number');
      return;
    }

    if (isNaN(purchasePriceNum) || purchasePriceNum < 0) {
      toast.error('Purchase price must be a valid number');
      return;
    }

    if (isNaN(currentPriceNum) || currentPriceNum < 0) {
      toast.error('Current price must be a valid number');
      return;
    }

    try {
      if (editingEntry) {
        await updateEntry.mutateAsync({
          id: editingEntry.id,
          amount: BigInt(Math.floor(amountNum * 1000000)),
          purchasePriceCents: BigInt(Math.floor(purchasePriceNum * 100)),
          currentPriceCents: BigInt(Math.floor(currentPriceNum * 100)),
        });
        toast.success('Position updated successfully');
      } else {
        await createEntry.mutateAsync({
          symbol: symbol.trim(),
          amount: BigInt(Math.floor(amountNum * 1000000)),
          purchasePriceCents: BigInt(Math.floor(purchasePriceNum * 100)),
          currentPriceCents: BigInt(Math.floor(currentPriceNum * 100)),
        });
        toast.success('Position added successfully');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(editingEntry ? 'Failed to update position' : 'Failed to add position');
    }
  };

  const isPending = createEntry.isPending || updateEntry.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editingEntry ? 'Edit Position' : 'Add Crypto Position'}</DialogTitle>
            <DialogDescription>
              {editingEntry
                ? 'Update your cryptocurrency position details.'
                : 'Add a new cryptocurrency position to your portfolio.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                placeholder="BTC, ETH, ICP..."
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                disabled={isPending || !!editingEntry}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (units)</Label>
              <Input
                id="amount"
                type="number"
                step="0.000001"
                placeholder="0.5"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price (USD)</Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                placeholder="45000.00"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentPrice">Current Price (USD)</Label>
              <Input
                id="currentPrice"
                type="number"
                step="0.01"
                placeholder="47500.00"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="crypto-button">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingEntry ? 'Update' : 'Add'} Position
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
