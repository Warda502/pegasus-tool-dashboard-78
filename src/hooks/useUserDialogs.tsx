
import { useState } from 'react';
import { User } from './data/types';
import { ViewUserDialog } from '@/components/users/ViewUserDialog';
import { EditUserDialog } from '@/components/users/EditUserDialog';
import { AddUserDialog } from '@/components/users/AddUserDialog';
import { RenewUserDialog } from '@/components/users/RenewUserDialog';

// Custom hook to manage all user-related dialogs
export const useUserDialogs = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); 
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);
  const [isAddCreditsDialogOpen, setIsAddCreditsDialogOpen] = useState(false);
  const [isAddToPlanDialogOpen, setIsAddToPlanDialogOpen] = useState(false);

  const viewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const editUser = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const renewUserDialog = (user: User) => {
    setSelectedUser(user);
    setIsRenewDialogOpen(true);
  };

  const openAddUser = () => {
    setIsAddDialogOpen(true);
  };

  const openAddCreditsDialog = () => {
    setIsAddCreditsDialogOpen(true);
  };
  
  const openAddToPlanDialog = () => {
    setIsAddToPlanDialogOpen(true);
  };

  // Create dialog components
  const ViewUserDialog = () => {
    return selectedUser ? (
      <ViewUserDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        user={selectedUser}
      />
    ) : null;
  };

  const EditUserDialog = ({ onUpdate }: { onUpdate: (user: User) => Promise<boolean> }) => {
    return selectedUser ? (
      <EditUserDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={selectedUser}
        onUpdate={onUpdate}
      />
    ) : null;
  };

  const AddUserDialog = ({ onAdd }: { onAdd: (userData: any) => Promise<boolean> }) => {
    return (
      <AddUserDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={onAdd}
      />
    );
  };

  const RenewUserDialog = ({ onRenew }: { onRenew: (user: User, months: string) => Promise<boolean> }) => {
    return selectedUser ? (
      <RenewUserDialog
        open={isRenewDialogOpen}
        onOpenChange={setIsRenewDialogOpen}
        user={selectedUser}
        onRenew={onRenew}
      />
    ) : null;
  };

  return {
    selectedUser,
    isViewDialogOpen,
    isEditDialogOpen,
    isAddDialogOpen,
    isRenewDialogOpen,
    isAddCreditsDialogOpen,
    isAddToPlanDialogOpen,
    setIsViewDialogOpen,
    setIsEditDialogOpen,
    setIsAddDialogOpen,
    setIsRenewDialogOpen,
    setIsAddCreditsDialogOpen,
    setIsAddToPlanDialogOpen,
    viewUser,
    editUser,
    renewUserDialog,
    openAddUser,
    openAddCreditsDialog,
    openAddToPlanDialog,
    ViewUserDialog,
    EditUserDialog,
    AddUserDialog,
    RenewUserDialog,
    isViewOpen: isViewDialogOpen,
    isEditOpen: isEditDialogOpen,
    isAddOpen: isAddDialogOpen,
    isRenewOpen: isRenewDialogOpen
  };
};
