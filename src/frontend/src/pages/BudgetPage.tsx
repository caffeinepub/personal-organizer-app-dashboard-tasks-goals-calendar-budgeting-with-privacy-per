import { useState } from 'react';
import { useGetBudgetItems } from '@/hooks/budget/useBudget';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import BudgetItemFormDialog from '@/components/budget/BudgetItemFormDialog';
import BudgetSummary from '@/components/budget/BudgetSummary';
import IntegrityWarningBanner from '@/components/common/IntegrityWarningBanner';
import SecurityNote from '@/components/common/SecurityNote';
import { useIntegrityVerifier } from '@/hooks/integrity/useIntegrityVerifier';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { useDeleteBudgetItem } from '@/hooks/budget/useBudget';
import { toast } from 'sonner';
import type { BudgetItem } from '@/backend';
import SectionExamples from '@/components/common/SectionExamples';
import { formatCentsAsCurrency } from '@/utils/money';

export default function BudgetPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const { data: items = [], isLoading } = useGetBudgetItems();
  const { hasIntegrityIssues } = useIntegrityVerifier(items, 'budget');
  const deleteItem = useDeleteBudgetItem();

  const handleEdit = (item: BudgetItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteItem.mutateAsync(id);
      toast.success('Item deleted successfully');
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingItem(null);
    }
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1000000).toLocaleDateString();
  };

  const budgetExamples = [
    { title: 'Grocery Shopping', description: 'Weekly food expenses' },
    { title: 'Freelance Payment', description: 'Income from client project' },
    { title: 'Monthly Rent', description: 'Housing expense' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget</h1>
          <p className="text-muted-foreground text-sm">Track income and expenses</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="default">
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {hasIntegrityIssues && (
        <IntegrityWarningBanner message="Some budget items may have been tampered with. Please verify your data." />
      )}

      <SecurityNote />

      <BudgetSummary items={items} />

      <Card className="settings-card">
        <CardHeader>
          <CardTitle className="text-lg">All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="space-y-4">
              <div className="text-center py-6 text-muted-foreground text-sm">
                No budget items yet. Add your first transaction to get started.
              </div>
              <SectionExamples sectionName="Budget Items" examples={budgetExamples} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id.toString()}>
                      <TableCell className="text-sm">{formatDate(item.date)}</TableCell>
                      <TableCell className="text-sm">{item.description}</TableCell>
                      <TableCell>
                        <Badge variant={item.itemType === 'income' ? 'default' : 'secondary'} className="text-xs">
                          {item.itemType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-sm">
                        {formatCentsAsCurrency(item.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(item.id)}
                            disabled={deleteItem.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <BudgetItemFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        editingItem={editingItem}
      />
    </div>
  );
}
