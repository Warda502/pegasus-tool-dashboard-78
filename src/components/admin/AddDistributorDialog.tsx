import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface AddDistributorDialogProps {
  open: boolean;
  onClose: () => void;
  onDistributorAdded: () => void;
}

export function AddDistributorDialog({ open, onClose, onDistributorAdded }: AddDistributorDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    commissionRate: '10',
    website: '',
    facebook: '',
    creditLimit: '1000',
    status: 'active',
  });

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
      // 1. إنشاء المستخدم في جدول المصادقة
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (userError) throw userError;
      
      if (userData.user) {
        // 2. إضافة المستخدم إلى جدول المستخدمين مع دور "distributor"
        const { error: insertUserError } = await supabase
          .from('users')
          .insert({
            uid: userData.user.id,
            name: formData.name,
            email: formData.email,
            role: 'distributor',
            activate: 'yes',
          });

        if (insertUserError) throw insertUserError;
        
        // 3. إنشاء سجل الموزع في جدول الموزعين
        const { error: insertDistributorError } = await supabase
          .from('distributors')
          .insert({
            uid: userData.user.id,
            commission_rate: formData.commissionRate,
            website: formData.website,
            facebook: formData.facebook,
            credit_limit: formData.creditLimit,
            current_balance: 0,
            status: formData.status,
          });

        if (insertDistributorError) throw insertDistributorError;
        
        toast({
          title: t('success'),
          description: t('distributorAddedSuccessfully'),
        });
        
        onDistributorAdded();
        onClose();
      }
    } catch (error) {
      console.error('Error adding distributor:', error);
      toast({
        title: t('error'),
        description: t('errorAddingDistributor'),
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
          <DialogTitle>{t('addNewDistributor')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            
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
              {t('addDistributor')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
