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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCreateCryptoEntry, useUpdateCryptoEntry } from '@/hooks/crypto/useCrypto';
import { useCryptoLivePrice } from '@/hooks/crypto/useCryptoLivePrices';
import { toast } from 'sonner';
import { Loader2, AlertCircle, TrendingUp } from 'lucide-react';
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
  const [manualPriceMode, setManualPriceMode] = useState(false);

  const createEntry = useCreateCryptoEntry();
  const updateEntry = useUpdateCryptoEntry();

  // Fetch live price for the entered symbol
  const { data: livePrice, isLoading: priceLoading, error: priceError } = useCryptoLivePrice(symbol);

  useEffect(() => {
    if (editingEntry) {
      setSymbol(editingEntry.symbol);
      // Fix: Divide by 1000000 to convert back to human units
      setAmount((Number(editingEntry.amount) / 1000000).toString());
      setPurchasePrice((Number(editingEntry.purchasePriceCents) / 100).toString());
      setCurrentPrice((Number(editingEntry.currentPriceCents) / 100).toString());
      setManualPriceMode(false);
    } else {
      setSymbol('');
      setAmount('');
      setPurchasePrice('');
      setCurrentPrice('');
      setManualPriceMode(false);
    }
  }, [editingEntry, open]);

  // Auto-populate current price when live price is fetched
  useEffect(() => {
    if (!editingEntry && livePrice && !manualPriceMode) {
      setCurrentPrice(livePrice.toFixed(2));
    }
  }, [livePrice, editingEntry, manualPriceMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!symbol.trim() || !amount || !purchasePrice) {
      toast.error('Please fill in symbol, amount, and purchase price');
      return;
    }

    const amountNum = parseFloat(amount);
    const purchasePriceNum = parseFloat(purchasePrice);

    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Amount must be a positive number');
      return;
    }

    if (isNaN(purchasePriceNum) || purchasePriceNum < 0) {
      toast.error('Purchase price must be a valid number');
      return;
    }

    // Use live price if available and not in manual mode, otherwise use manual input
    let finalCurrentPrice: number;
    if (!manualPriceMode && livePrice && !editingEntry) {
      finalCurrentPrice = livePrice;
    } else {
      if (!currentPrice) {
        toast.error('Please enter a current price or wait for live price to load');
        return;
      }
      const currentPriceNum = parseFloat(currentPrice);
      if (isNaN(currentPriceNum) || currentPriceNum < 0) {
        toast.error('Current price must be a valid number');
        return;
      }
      finalCurrentPrice = currentPriceNum;
    }

    try {
      if (editingEntry) {
        await updateEntry.mutateAsync({
          id: editingEntry.id,
          // Fix: Multiply by 1000000 to store in micro-units
          amount: BigInt(Math.floor(amountNum * 1000000)),
          purchasePriceCents: BigInt(Math.floor(purchasePriceNum * 100)),
          currentPriceCents: BigInt(Math.floor(finalCurrentPrice * 100)),
        });
        toast.success('Position updated successfully');
      } else {
        await createEntry.mutateAsync({
          symbol: symbol.trim(),
          // Fix: Multiply by 1000000 to store in micro-units
          amount: BigInt(Math.floor(amountNum * 1000000)),
          purchasePriceCents: BigInt(Math.floor(purchasePriceNum * 100)),
          currentPriceCents: BigInt(Math.floor(finalCurrentPrice * 100)),
        });
        toast.success('Position added successfully');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(editingEntry ? 'Failed to update position' : 'Failed to add position');
    }
  };

  const isPending = createEntry.isPending || updateEntry.isPending;
  const showPriceError = !editingEntry && priceError && !manualPriceMode && symbol.trim().length > 0;
  const showLivePrice = !editingEntry && livePrice && !manualPriceMode;

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
                onChange={(e) => {
                  setSymbol(e.target.value);
                  setManualPriceMode(false);
                }}
                disabled={isPending || !!editingEntry}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (units)</Label>
              <Input
                id="amount"
                type="number"
                step="0.000001"
                placeholder="1.0"
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
              <Label htmlFor="currentPrice">
                Current Price (USD)
                {!editingEntry && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {priceLoading && '(fetching...)'}
                    {showLivePrice && '(live)'}
                  </span>
                )}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="currentPrice"
                  type="number"
                  step="0.01"
                  placeholder="47500.00"
                  value={currentPrice}
                  onChange={(e) => {
                    setCurrentPrice(e.target.value);
                    setManualPriceMode(true);
                  }}
                  disabled={isPending || (!editingEntry && priceLoading && !manualPriceMode)}
                />
                {showLivePrice && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    title="Live price"
                  >
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </Button>
                )}
              </div>
              {showPriceError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Unable to fetch live price for {symbol.toUpperCase()}. Please enter the current price manually.
                  </AlertDescription>
                </Alert>
              )}
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
