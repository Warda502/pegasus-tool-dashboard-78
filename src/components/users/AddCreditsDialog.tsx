
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/useLanguage";

interface User {
  id: string;
  Name: string;
  Email: string;
  Credits: string;
  [key: string]: string;
}

interface AddCreditsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onAddCredits: (userId: string, amount: number) => Promise<void>;
}

export const AddCreditsDialog = ({
  isOpen,
  onClose,
  users,
  onAddCredits
}: AddCreditsDialogProps) => {
  const [selectedUser, setSelectedUser] = useState("");
  const [creditsAmount, setCreditsAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { t, isRTL } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !creditsAmount) return;

    try {
      setLoading(true);
      await onAddCredits(selectedUser, Number(creditsAmount));
      // Reset form after submission
      setSelectedUser("");
      setCreditsAmount("");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle>{t("addCredit")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="user-select">{t("user")}</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectUser")} />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.Email} - {t("current")}: {user.Credits}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="credits-amount">{t("creditAmount")}</Label>
            <Input
              id="credits-amount"
              type="number"
              value={creditsAmount}
              onChange={e => setCreditsAmount(e.target.value)}
              placeholder="100"
              min="1"
            />
            <p className="text-xs text-muted-foreground">
              {t("creditExplanation")}
            </p>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>{t("cancel")}</Button>
            <Button type="submit" disabled={!selectedUser || !creditsAmount || loading}>
              {loading ? t("adding") : t("add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
