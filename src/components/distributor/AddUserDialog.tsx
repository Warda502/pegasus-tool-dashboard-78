import { useState } from 'react';
import { useAuth } from '@/hooks/auth/AuthContext';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

export function AddUserDialog({ open, onClose, onUserAdded }: AddUserDialogProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    credits: '0',
    expiryDays: '30',
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
    
    if (!user?.distributorId) {
      toast({
        title: t('error'),
        description: t('distributorIdNotFound'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // 1. إنشاء المستخدم في جدول المستخدمين
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (userError) throw userError;
      
      if (userData.user) {
        // 2. إضافة معلومات المستخدم في جدول users
        const now = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(now.getDate() + parseInt(formData.expiryDays));
        
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            uid: userData.user.id,
            name: formData.name,
            email: formData.email,
            role: 'user',
            credits: formData.credits,
            distributor_id: user.distributorId,
            start_date: now.toISOString(),
            expiry_time: expiryDate.toISOString(),
            activate: 'yes',
          });

        if (insertError) throw insertError;
        
        toast({
          title: t('success'),
          description: t('userAddedSuccessfully'),
        });
        
        onUserAdded();
        onClose();
      }
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: t('error'),
        description: t('errorAddingUser'),
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
          <DialogTitle>{t('addNewUser')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
            <Label htmlFor="credits">{t('credits')}</Label>
            <Input
              id="credits"
              name="credits"
              type="number"
              value={formData.credits}
              onChange={handleChange}
              required
              min="0"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expiryDays">{t('expiryDays')}</Label>
            <Select
              value={formData.expiryDays}
              onValueChange={(value) => handleSelectChange('expiryDays', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectExpiryDays')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 {t('days')}</SelectItem>
                <SelectItem value="60">60 {t('days')}</SelectItem>
                <SelectItem value="90">90 {t('days')}</SelectItem>
                <SelectItem value="180">180 {t('days')}</SelectItem>
                <SelectItem value="365">365 {t('days')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('addUser')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
