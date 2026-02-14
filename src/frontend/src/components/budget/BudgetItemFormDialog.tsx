import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateBudgetItem, useUpdateBudgetItem } from '@/hooks/budget/useBudget';
import { toast } from 'sonner';
import type { BudgetItem } from '@/backend';
import { BudgetItemType } from '@/backend';

interface BudgetItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem?: BudgetItem | null;
}

export default function BudgetItemFormDialog({
  open,
  onOpenChange,
  editingItem,
}: BudgetItemFormDialogProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [itemType, setItemType] = useState<'income' | 'expense'>('expense');
  const createItem = useCreateBudgetItem();
  const updateItem = useUpdateBudgetItem();

  useEffect(() => {
    if (editingItem) {
      setAmount(Number(editingItem.amount).toString());
      setDescription(editingItem.description);
      const itemDate = new Date(Number(editingItem.date) / 1000000);
      setDate(itemDate.toISOString().split('T')[0]);
      setItemType(editingItem.itemType);
    } else {
      setAmount('');
      setDescription('');
      setDate('');
      setItemType('expense');
    }
  }, [editingItem, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description.trim() || !date) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const dateTimestamp = BigInt(new Date(date).getTime() * 1000000);

    try {
      if (editingItem) {
        await updateItem.mutateAsync({
          id: editingItem.id,
          amount: BigInt(Math.round(amountValue * 100)),
          description: description.trim(),
          date: dateTimestamp,
          itemType: itemType as BudgetItemType,
        });
        toast.success('Item updated successfully');
      } else {
        await createItem.mutateAsync({
          amount: BigInt(Math.round(amountValue * 100)),
          description: description.trim(),
          date: dateTimestamp,
          itemType: itemType as BudgetItemType,
        });
        toast.success('Item created successfully');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(editingItem ? 'Failed to update item' : 'Failed to create item');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Edit Budget Item' : 'Add Budget Item'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="itemType">Type</Label>
            <Select value={itemType} onValueChange={(value: 'income' | 'expense') => setItemType(value)}>
              <SelectTrigger id="itemType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createItem.isPending || updateItem.isPending}>
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
