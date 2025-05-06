
import { useState } from 'react';
import { User } from './data/types';

// Custom hook to manage all user-related dialogs
export const useUserDialogs = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); 
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);
  const [isAddCreditsDialogOpen, setIsAddCreditsDialogOpen] = useState(false);

  const openViewDialog = (user: User) => {
    console.log("useUserDialogs: Opening view dialog for user:", user.Email);
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    console.log("useUserDialogs: Opening edit dialog for user:", user.Email);
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const openRenewDialog = (user: User) => {
    console.log("useUserDialogs: Opening renew dialog for user:", user.Email);
    setSelectedUser(user);
    setIsRenewDialogOpen(true);
  };

  const openAddDialog = () => {
    console.log("useUserDialogs: Opening add user dialog");
    setIsAddDialogOpen(true);
  };

  const openAddCreditsDialog = () => {
    console.log("useUserDialogs: Opening add credits dialog");
    setIsAddCreditsDialogOpen(true);
  };

  return {
    selectedUser,
    isViewDialogOpen,
    isEditDialogOpen,
    isAddDialogOpen,
    isRenewDialogOpen,
    isAddCreditsDialogOpen,
    setIsViewDialogOpen,
    setIsEditDialogOpen,
    setIsAddDialogOpen,
    setIsRenewDialogOpen,
    setIsAddCreditsDialogOpen,
    openViewDialog,
    openEditDialog,
    openRenewDialog,
    openAddDialog,
    openAddCreditsDialog
  };
};
