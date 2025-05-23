import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Distributor } from '@/hooks/types/distributor';

interface EditDistributorDialogProps {
  distributor: Distributor;
  open: boolean;
  onClose: () => void;
  onDistributorUpdated: () => void;
}

export function EditDistributorDialog({ distributor, open, onClose, onDistributorUpdated }: EditDistributorDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    commissionRate: '',
    website: '',
    facebook: '',
    creditLimit: '',
    status: '',
  });

  useEffect(() => {
    if (distributor) {
      setFormData({
        commissionRate: distributor.commissionRate || '',
        website: distributor.website || '',
        facebook: distributor.facebook || '',
        creditLimit: distributor.creditLimit?.toString() || '',
        status: distributor.status || 'active',
      });
    }
  }, [distributor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      // تحديث بيانات الموزع
      const { error } = await supabase
        .from('distributors')
        .update({
          commission_rate: formData.commissionRate,
          website: formData.website,
          facebook: formData.facebook,
          credit_limit: formData.creditLimit,
          status: formData.status,
        })
        .eq('id', distributor.id);

      if (error) throw error;
      
      toast({
        title: t('success'),
        description: t('distributorUpdatedSuccessfully'),
      });
      
      onDistributorUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating distributor:', error);
      toast({
        title: t('error'),
        description: t('errorUpdatingDistributor'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('editDistributor')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commissionRate">{t('commissionRate')} (%)</Label>
              <Input
                id="commissionRate"
                name="commissionRate"
                type="number"
                value={formData.commissionRate}
                onChange={handleChange}
                required
                min="0"
                max="100"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">{t('website')}</Label>
              <Input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="facebook">{t('facebook')}</Label>
              <Input
                id="facebook"
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="creditLimit">{t('creditLimit')}</Label>
              <Input
                id="creditLimit"
                name="creditLimit"
                type="number"
                value={formData.creditLimit}
                onChange={handleChange}
                required
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">{t('status')}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('active')}</SelectItem>
                  <SelectItem value="inactive">{t('inactive')}</SelectItem>
                  <SelectItem value="suspended">{t('suspended')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('saveChanges')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
