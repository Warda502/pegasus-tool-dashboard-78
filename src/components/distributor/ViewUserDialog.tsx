import { useLanguage } from '@/hooks/useLanguage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DistributorUser } from '@/hooks/types/distributor';
import { format } from 'date-fns';

interface ViewUserDialogProps {
  user: DistributorUser;
  open: boolean;
  onClose: () => void;
}

export function ViewUserDialog({ user, open, onClose }: ViewUserDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('userDetails')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('name')}</h4>
              <p className="text-base">{user.name}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('email')}</h4>
              <p className="text-base">{user.email}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('credits')}</h4>
              <p className="text-base">{user.credits}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('expiryDate')}</h4>
              <p className="text-base">
                {user.expiryTime ? format(new Date(user.expiryTime), 'yyyy-MM-dd') : '-'}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('createdAt')}</h4>
              <p className="text-base">
                {user.createdAt ? format(new Date(user.createdAt), 'yyyy-MM-dd') : '-'}
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>
            {t('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
