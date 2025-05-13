
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useDistributors } from "@/hooks/useDistributors";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Distributor, DistributorUser } from "@/hooks/data/types/distributors";
import { User } from "@/hooks/data/types";
import { PlusCircle, Trash2, Search, Check, X } from "lucide-react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui";

interface ManageUsersDialogProps {
  distributor: Distributor;
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export function ManageUsersDialog({
  distributor,
  children,
  onSuccess,
}: ManageUsersDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addUserOpen, setAddUserOpen] = useState(false);
  const { t } = useLanguage();
  
  const { 
    useDistributorUsers, 
    addUserToDistributor, 
    removeUserFromDistributor,
    loading 
  } = useDistributors();
  
  const { data: distributorUsers = [], refetch } = useDistributorUsers(distributor.id);

  // Fetch all users who aren't assigned to this distributor yet
  const { data: availableUsers = [] } = useQuery({
    queryKey: ['availableDistributorUsers', distributor.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, credits, user_type')
        .or(`distributor_id.is.null,distributor_id.neq.${distributor.id}`);

      if (error) {
        console.error('Error fetching available users:', error);
        return [];
      }

      return data as User[];
    },
    enabled: addUserOpen && open,
  });

  const filteredUsers = availableUsers.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = (userId: string) => {
    addUserToDistributor(
      { distributorId: distributor.id, userId },
      {
        onSuccess: () => {
          setAddUserOpen(false);
          refetch();
          if (onSuccess) onSuccess();
        },
      }
    );
  };

  const handleRemoveUser = (userId: string) => {
    if (window.confirm(t('confirmRemoveUser'))) {
      removeUserFromDistributor(
        { distributorId: distributor.id, userId },
        {
          onSuccess: () => {
            refetch();
            if (onSuccess) onSuccess();
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{t('manageUsers')}</DialogTitle>
          <DialogDescription>
            {t('manageUsersDescription', { name: distributor.name })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchUsers')}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Popover open={addUserOpen} onOpenChange={setAddUserOpen}>
              <PopoverTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t('addUser')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="end">
                <Command>
                  <CommandInput placeholder={t('searchUsers')} />
                  <CommandList>
                    <CommandEmpty>{t('noUsersFound')}</CommandEmpty>
                    <CommandGroup>
                      {filteredUsers.map((user) => (
                        <CommandItem
                          key={user.id}
                          onSelect={() => handleAddUser(user.id!)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <p>{user.name || user.email}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                            <Check className="h-4 w-4 opacity-0 group-data-[selected]:opacity-100" />
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('email')}</TableHead>
                  <TableHead>{t('credits')}</TableHead>
                  <TableHead>{t('userType')}</TableHead>
                  <TableHead className="w-[80px]">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {distributorUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      {t('noUsersAssigned')}
                    </TableCell>
                  </TableRow>
                ) : (
                  distributorUsers
                    .filter((user: DistributorUser) => 
                      !searchQuery || 
                      user.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      user.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((user: DistributorUser) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.user?.name || '-'}</TableCell>
                        <TableCell>{user.user?.email || '-'}</TableCell>
                        <TableCell>{user.user?.credits || '0.0'}</TableCell>
                        <TableCell>{user.user?.user_type || '-'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveUser(user.user_id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">{t('removeUser')}</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => setOpen(false)} type="button">
            {t('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
