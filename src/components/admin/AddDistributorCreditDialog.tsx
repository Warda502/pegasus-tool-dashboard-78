import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Distributor } from '@/hooks/types/distributor';

interface AddDistributorCreditDialogProps {
  distributor: Distributor;
  open: boolean;
  onClose: () => void;
  onCreditAdded: () => void;
}

export function AddDistributorCreditDialog({ distributor, open, onClose, onCreditAdded }: AddDistributorCreditDialogProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '0',
    operationType: 'add',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: t('error'),
        description: t('adminIdNotFound'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
      }

      // 1. إضافة سجل في جدول رصيد الموزع
      const { error: creditError } = await supabase
        .from('distributor_credits')
        .insert({
          distributor_id: distributor.id,
          amount: amount,
          operation_type: formData.operationType,
          description: formData.description,
          admin_id: user.id,
        });

      if (creditError) throw creditError;

      // 2. تحديث الرصيد الحالي للموزع
      let newBalance = parseFloat(distributor.currentBalance || '0');
      if (formData.operationType === 'add') {
        newBalance += amount;
      } else if (formData.operationType === 'subtract') {
        newBalance -= amount;
      }

      const { error: updateError } = await supabase
        .from('distributors')
        .update({
          current_balance: newBalance,
        })
        .eq('id', distributor.id);

      if (updateError) throw updateError;
      
      toast({
        title: t('success'),
        description: t('creditOperationSuccessful'),
      });
      
      onCreditAdded();
      onClose();
    } catch (error) {
      console.error('Error adding credit:', error);
      toast({
        title: t('error'),
        description: t('errorAddingCredit'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('addCredit')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="operationType">{t('operationType')}</Label>
            <Select
              value={formData.operationType}
              onValueChange={(value) => handleSelectChange('operationType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectOperationType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">{t('add')}</SelectItem>
                <SelectItem value="subtract">{t('subtract')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">{t('amount')}</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">{t('description')}</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder={t('enterDescription')}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('addCredit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
