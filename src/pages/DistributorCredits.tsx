
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { CreditCard, RefreshCw, AlertCircle, Calendar } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";

interface CreditTransaction {
  id: string;
  operation_type: string;
  amount: number;
  created_at: string;
  description: string;
}

interface DistributorInfo {
  id: string;
  current_balance: number;
  credit_limit: number;
  commission_rate: string;
}

const DistributorCredits = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [distributorInfo, setDistributorInfo] = useState<DistributorInfo | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [requestAmount, setRequestAmount] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDistributorData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch distributor info
        const { data: distributorData, error: distributorError } = await supabase
          .from('distributors')
          .select('id, current_balance, credit_limit, commission_rate')
          .eq('uid', user.id)
          .single();
          
        if (distributorError) {
          console.error("Error fetching distributor info:", distributorError);
          return;
        }
        
        setDistributorInfo(distributorData);
        
        // Fetch credit transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('distributor_credits')
          .select('*')
          .eq('distributor_id', distributorData.id)
          .order('created_at', { ascending: false });
          
        if (transactionsError) {
          console.error("Error fetching transactions:", transactionsError);
          return;
        }
        
        setTransactions(transactionsData);
      } catch (err) {
        console.error("Error in fetchDistributorData:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDistributorData();
  }, [user]);

  const handleRefresh = async () => {
    if (!distributorInfo) return;
    
    setLoading(true);
    
    try {
      // Fetch distributor info
      const { data: distributorData, error: distributorError } = await supabase
        .from('distributors')
        .select('id, current_balance, credit_limit, commission_rate')
        .eq('uid', user?.id)
        .single();
        
      if (distributorError) {
        console.error("Error refreshing distributor info:", distributorError);
        return;
      }
      
      setDistributorInfo(distributorData);
      
      // Fetch credit transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('distributor_credits')
        .select('*')
        .eq('distributor_id', distributorData.id)
        .order('created_at', { ascending: false });
        
      if (transactionsError) {
        console.error("Error refreshing transactions:", transactionsError);
        return;
      }
      
      setTransactions(transactionsData);
      toast.success(t("success"), {
        description: t("dataRefreshed") || "Data refreshed successfully"
      });
    } catch (err) {
      console.error("Error in refreshData:", err);
      toast.error(t("error"), {
        description: t("refreshError") || "Error refreshing data"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCredits = async () => {
    if (!distributorInfo) return;
    
    // Validate input
    const amount = parseFloat(requestAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error(t("error"), {
        description: t("invalidAmount") || "Please enter a valid amount"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Record the credit request
      const { error } = await supabase
        .from('distributor_credits')
        .insert({
          distributor_id: distributorInfo.id,
          amount: amount,
          operation_type: 'request',
          description: requestDescription || 'Credit request'
        });
        
      if (error) {
        console.error("Error submitting credit request:", error);
        toast.error(t("error"), {
          description: t("requestFailed") || "Failed to submit request"
        });
        return;
      }
      
      toast.success(t("success"), {
        description: t("requestSubmitted") || "Credit request submitted successfully"
      });
      
      // Close dialog and reset form
      setIsRequestDialogOpen(false);
      setRequestAmount("");
      setRequestDescription("");
      
      // Refresh data
      handleRefresh();
    } catch (err) {
      console.error("Error in handleRequestCredits:", err);
      toast.error(t("error"), {
        description: t("requestFailed") || "Failed to submit request"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("distributorCredits") || "Distributor Credits"}</h1>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("refresh")}
          </Button>
          
          <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <CreditCard className="h-4 w-4 mr-2" />
                {t("requestCredits") || "Request Credits"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("requestCredits") || "Request Credits"}</DialogTitle>
                <DialogDescription>
                  {t("requestCreditsDescription") || "Request additional credits for your distributor account. An admin will review your request."}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">{t("amount") || "Amount"}</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.0"
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">{t("description") || "Description"}</Label>
                  <Textarea
                    id="description"
                    placeholder={t("requestReason") || "Reason for requesting credits"}
                    value={requestDescription}
                    onChange={(e) => setRequestDescription(e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsRequestDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  {t("cancel")}
                </Button>
                <Button 
                  onClick={handleRequestCredits}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("submitting") || "Submitting..." : t("submitRequest") || "Submit Request"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{t("currentBalance") || "Current Balance"}</CardTitle>
                <CardDescription>{t("availableCredits") || "Your available credits"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {distributorInfo?.current_balance || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{t("creditLimit") || "Credit Limit"}</CardTitle>
                <CardDescription>{t("maxCredits") || "Maximum credits allowed"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {distributorInfo?.credit_limit || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{t("commissionRate") || "Commission Rate"}</CardTitle>
                <CardDescription>{t("yourCommission") || "Your commission percentage"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {distributorInfo?.commission_rate || 0}%
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>{t("creditTransactions") || "Credit Transactions"}</CardTitle>
              <CardDescription>
                {t("transactionsHistory") || "History of your credit transactions"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <CreditCard className="h-10 w-10 mb-2" />
                  <p>{t("noTransactions") || "No transactions found"}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("date")}</TableHead>
                      <TableHead>{t("type")}</TableHead>
                      <TableHead>{t("amount")}</TableHead>
                      <TableHead>{t("description")}</TableHead>
                      <TableHead>{t("status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {format(new Date(transaction.created_at), 'yyyy/MM/dd HH:mm')}
                        </TableCell>
                        <TableCell>
                          <span className="capitalize">{transaction.operation_type}</span>
                        </TableCell>
                        <TableCell>
                          <span className={transaction.amount > 0 ? "text-green-600" : "text-red-600"}>
                            {transaction.amount > 0 ? "+" : ""}{transaction.amount}
                          </span>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            transaction.operation_type === 'request' ? "bg-yellow-100 text-yellow-800" : 
                            "bg-green-100 text-green-800"
                          }`}>
                            {transaction.operation_type === 'request' ? t("pending") || "Pending" : t("completed") || "Completed"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DistributorCredits;
