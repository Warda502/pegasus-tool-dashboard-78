
import { useState } from "react";
import { Distributor } from "./data/types";

export const useDistributorDialogs = () => {
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const openViewDialog = (distributor: Distributor) => {
    setSelectedDistributor(distributor);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (distributor: Distributor) => {
    setSelectedDistributor(distributor);
    setIsEditDialogOpen(true);
  };

  const openAddDialog = () => {
    setIsAddDialogOpen(true);
  };

  return {
    selectedDistributor,
    isViewDialogOpen,
    isEditDialogOpen,
    isAddDialogOpen,
    setIsViewDialogOpen,
    setIsEditDialogOpen,
    setIsAddDialogOpen,
    openViewDialog,
    openEditDialog,
    openAddDialog
  };
};
