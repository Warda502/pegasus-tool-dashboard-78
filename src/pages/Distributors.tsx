
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { UserPlus, RefreshCcw, AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { User } from "@/hooks/useSharedData";
import { Label } from "@/components/ui/label";

// Type definition for distributor with User fields
interface Distributor extends User {
  // Additional distributor fields if needed
}

export default function Distributors() {
  const { isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDistributors, setFilteredDistributors] = useState<Distributor[]>([]);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddCreditsDialogOpen, setIsAddCreditsDialogOpen] = useState(false);
  
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [creditsToAdd, setCreditsToAdd] = useState(0);
  
  const fetchDistributors = async () => {
    if (!isAdmin) {
      toast("Not authorized", {
        description: "You need administrator privileges to view this data"
      });
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email_type', 'Distributor');

      if (error) {
        throw error;
      }

      return data.map(user => {
        const creditsValue = user.credits ? user.credits.toString().replace(/"/g, '') : "0.0";
        
        return {
          ...user,
          Name: user.name || "",
          Email: user.email || "",
          Password: user.password || "",
          Phone: user.phone || "",
          Country: user.country || "",
          Activate: user.activate || "Not Activate",
          Block: user.block || "Not Blocked",
          Credits: creditsValue,
          User_Type: user.user_type || "Credits License",
          Email_Type: user.email_type || "Distributor",
          Expiry_Time: user.expiry_time || "",
          Start_Date: user.start_date || "",
          Hwid: user.hwid || "",
          UID: user.uid || ""
        };
      });
    } catch (error) {
      console.error("Error fetching distributors:", error);
      toast("Error", {
        description: "Failed to fetch distributors"
      });
      return [];
    }
  };

  const { data: distributors = [], isLoading, refetch } = useQuery({
    queryKey: ["distributors"],
    queryFn: fetchDistributors,
    enabled: isAdmin
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Filter distributors based on search query
    const filtered = distributors.filter(distributor => {
      return query.trim() === "" || 
        (distributor.Email?.toLowerCase().includes(query.toLowerCase())) ||
        (distributor.Name?.toLowerCase().includes(query.toLowerCase())) ||
        (distributor.Phone?.toLowerCase().includes(query.toLowerCase())) ||
        (distributor.Country?.toLowerCase().includes(query.toLowerCase()));
    });
    
    setFilteredDistributors(filtered);
  };

  // Initialize filtered distributors when distributors change
  useEffect(() => {
    handleSearch(searchQuery);
  }, [distributors, searchQuery]);

  const resetFormStates = () => {
    setEmail("");
    setPassword("");
    setName("");
    setPhone("");
    setCountry("");
    setCreditsToAdd(0);
  };

  const handleOpenAddDistributor = () => {
    resetFormStates();
    setIsAddDialogOpen(true);
  };

  const handleOpenEditDistributor = (distributor: Distributor) => {
    setSelectedDistributor(distributor);
    setName(distributor.Name || "");
    setEmail(distributor.Email || "");
    setPassword("");
    setPhone(distributor.Phone || "");
    setCountry(distributor.Country || "");
    setIsEditDialogOpen(true);
  };

  const handleOpenAddCredits = (distributor: Distributor) => {
    setSelectedDistributor(distributor);
    setCreditsToAdd(0);
    setIsAddCreditsDialogOpen(true);
  };

  const handleAddDistributor = async () => {
    if (!email || !password) {
      toast("Missing Information", {
        description: "Email and password are required"
      });
      return;
    }

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error("No user returned from auth signup");
      
      // Insert user into users table
      const { error: userError } = await supabase.from('users').insert({
        id: authData.user.id,
        uid: authData.user.id,
        email,
        password,
        name: name || '',
        phone: phone || '',
        country: country || '',
        email_type: 'Distributor',
        credits: '0.0',
        activate: 'Active',
        block: 'Not Blocked'
      });

      if (userError) throw userError;
      
      // Log the operation in server history
      await supabase.from('server_history').insert({
        distributor_id: authData.user.id,
        operation_type: 'add_distributor',
        operation_details: {
          email,
          name,
          country
        }
      });
      
      toast("Success", {
        description: "Distributor added successfully"
      });
      
      setIsAddDialogOpen(false);
      resetFormStates();
      queryClient.invalidateQueries({ queryKey: ['distributors'] });
    } catch (error) {
      console.error("Error adding distributor:", error);
      toast("Error", {
        description: error instanceof Error ? error.message : "Failed to add distributor"
      });
    }
  };

  const handleEditDistributor = async () => {
    if (!selectedDistributor) return;

    try {
      const updateData: any = {
        name,
        phone,
        country
      };
      
      // Only update password if provided
      if (password) {
        updateData.password = password;
      }
      
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', selectedDistributor.id);

      if (error) throw error;
      
      toast("Success", {
        description: "Distributor updated successfully"
      });
      
      setIsEditDialogOpen(false);
      resetFormStates();
      queryClient.invalidateQueries({ queryKey: ['distributors'] });
    } catch (error) {
      console.error("Error updating distributor:", error);
      toast("Error", {
        description: error instanceof Error ? error.message : "Failed to update distributor"
      });
    }
  };

  const handleAddCredits = async () => {
    if (!selectedDistributor || creditsToAdd <= 0) return;

    try {
      // Get current credits
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', selectedDistributor.id)
        .single();
      
      if (userError) throw userError;
      
      let currentCredit = 0;
      try {
        currentCredit = parseFloat(userData.credits.toString().replace(/"/g, "")) || 0;
      } catch (e) {
        console.error("Error parsing credit:", e);
      }
      
      const newCredit = currentCredit + creditsToAdd;
      
      // Update credits
      const { error } = await supabase
        .from('users')
        .update({ credits: newCredit.toString() + ".0" })
        .eq('id', selectedDistributor.id);

      if (error) throw error;
      
      // Log in server history
      await supabase.from('server_history').insert({
        distributor_id: selectedDistributor.id,
        operation_type: 'add_distributor_credits',
        amount: creditsToAdd,
        operation_details: {
          previous_credits: currentCredit,
          new_credits: newCredit
        }
      });
      
      toast("Success", {
        description: `${creditsToAdd} credits added to distributor successfully`
      });
      
      setIsAddCreditsDialogOpen(false);
      resetFormStates();
      queryClient.invalidateQueries({ queryKey: ['distributors'] });
    } catch (error) {
      console.error("Error adding credits:", error);
      toast("Error", {
        description: error instanceof Error ? error.message : "Failed to add credits"
      });
    }
  };

  const handleDeleteDistributor = async (distributorId: string) => {
    if (confirm(t("confirmDeleteDistributor") || "Are you sure you want to delete this distributor?")) {
      try {
        // First, reassign all users of this distributor to null
        const { error: reassignError } = await supabase
          .from('users')
          .update({ distributor_id: null })
          .eq('distributor_id', distributorId);
        
        if (reassignError) throw reassignError;
        
        // Delete the distributor from users
        const { error: dbError } = await supabase
          .from('users')
          .delete()
          .eq('id', distributorId);
        
        if (dbError) throw dbError;
        
        // Delete from auth
        const { error: authError } = await supabase
          .rpc('delete_auth_user', { user_id: distributorId });
        
        if (authError) {
          console.warn("User removed from database but may remain in auth system:", authError);
        }
        
        toast("Success", {
          description: "Distributor deleted successfully"
        });
        
        queryClient.invalidateQueries({ queryKey: ['distributors'] });
      } catch (error) {
        console.error("Error deleting distributor:", error);
        toast("Error", {
          description: error instanceof Error ? error.message : "Failed to delete distributor"
        });
      }
    }
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              <span>{t("distributors") || "Distributors"}</span>
            </CardTitle>
            <CardDescription>
              {t("distributorsDescription") || "Manage system distributors"}
              {distributors.length > 0 && (
                <span className="ml-2 font-medium">
                  ({distributors.length} {t("totalDistributors") || "total distributors"})
                </span>
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="w-full md:w-80">
              <Input
                placeholder={t("searchDistributors") || "Search distributors..."}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleOpenAddDistributor}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                {t("addDistributor") || "Add Distributor"}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                title={t("refresh") || "Refresh"}
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-muted animate-pulse rounded-md"
                />
              ))}
            </div>
          ) : filteredDistributors.length > 0 ? (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-2 text-start font-medium">{t("name") || "Name"}</th>
                    <th className="p-2 text-start font-medium">{t("email") || "Email"}</th>
                    <th className="p-2 text-start font-medium">{t("credits") || "Credits"}</th>
                    <th className="p-2 text-start font-medium">{t("country") || "Country"}</th>
                    <th className="p-2 text-start font-medium">{t("actions") || "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDistributors.map((distributor) => (
                    <tr key={distributor.id} className="border-t">
                      <td className="p-2">{distributor.Name || "—"}</td>
                      <td className="p-2">{distributor.Email}</td>
                      <td className="p-2">{distributor.Credits}</td>
                      <td className="p-2">{distributor.Country || "—"}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-1 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditDistributor(distributor)}
                          >
                            {t("edit") || "Edit"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenAddCredits(distributor)}
                          >
                            {t("addCredits") || "Add Credits"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteDistributor(distributor.id)}
                          >
                            {t("delete") || "Delete"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center text-center bg-muted/20 rounded-md">
              <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium mb-1">
                {t("noDistributorsFound") || "No distributors found"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {searchQuery
                  ? t("noDistributorsMatchSearch") || "No distributors match your search query"
                  : t("addFirstDistributor") || "Create your first distributor by clicking 'Add Distributor' button"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Distributor Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("addDistributor") || "Add Distributor"}</DialogTitle>
            <DialogDescription>
              {t("addDistributorDescription") || "Create a new distributor account"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email") || "Email"}*</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="distributor@example.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t("password") || "Password"}*</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">{t("name") || "Name"}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("distributorName") || "Distributor name"}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">{t("phone") || "Phone"}</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("phoneNumber") || "Phone number"}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="country">{t("country") || "Country"}</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder={t("country") || "Country"}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t("cancel") || "Cancel"}
            </Button>
            <Button onClick={handleAddDistributor}>
              {t("add") || "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Distributor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("editDistributor") || "Edit Distributor"}</DialogTitle>
            <DialogDescription>
              {selectedDistributor?.Email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">{t("name") || "Name"}</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("distributorName") || "Distributor name"}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-password">{t("newPassword") || "New Password"}</Label>
              <Input
                id="edit-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("leaveEmptyToKeep") || "Leave empty to keep current"}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-phone">{t("phone") || "Phone"}</Label>
              <Input
                id="edit-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("phoneNumber") || "Phone number"}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-country">{t("country") || "Country"}</Label>
              <Input
                id="edit-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder={t("country") || "Country"}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t("cancel") || "Cancel"}
            </Button>
            <Button onClick={handleEditDistributor}>
              {t("update") || "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Credits Dialog */}
      <Dialog open={isAddCreditsDialogOpen} onOpenChange={setIsAddCreditsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("addCreditsToDistributor") || "Add Credits"}</DialogTitle>
            <DialogDescription>
              {selectedDistributor?.Email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="credits">{t("creditsAmount") || "Credits Amount"}</Label>
              <Input
                id="credits"
                type="number"
                min="0"
                step="1"
                value={creditsToAdd.toString()}
                onChange={(e) => setCreditsToAdd(Number(e.target.value))}
                placeholder="0"
              />
            </div>
            
            {selectedDistributor && (
              <div className="text-sm">
                <span className="font-medium">{t("currentCredits") || "Current Credits"}:</span>{" "}
                <Badge variant="outline">{selectedDistributor.Credits}</Badge>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCreditsDialogOpen(false)}>
              {t("cancel") || "Cancel"}
            </Button>
            <Button onClick={handleAddCredits}>
              {t("addCredits") || "Add Credits"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
