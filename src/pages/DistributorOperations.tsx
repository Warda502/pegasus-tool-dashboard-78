
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/auth/AuthContext";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useLanguage } from "@/hooks/useLanguage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";

interface ServerHistoryOperation {
  id: string;
  timestamp: string;
  operation_type: string;
  status: string;
  amount: number;
  operation_details: any;
  target_user_id: string | null;
  target_user_email?: string;
}

export default function DistributorOperations() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [operations, setOperations] = useState<ServerHistoryOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOperation, setSelectedOperation] = useState<ServerHistoryOperation | null>(null);

  // Fetch operations for this distributor
  useEffect(() => {
    const fetchDistributorOperations = async () => {
      try {
        if (!user?.id) return;
        
        setLoading(true);
        // Get operations from server_history
        const { data, error } = await supabase
          .from('server_history')
          .select('*')
          .eq('distributor_id', user.id)
          .order('timestamp', { ascending: false });
          
        if (error) {
          console.error('Error fetching distributor operations:', error);
          toast.error(t("fetchError") || "Error fetching operations");
          return;
        }
        
        // Get user emails for target_user_ids
        const userIds = data
          .map(op => op.target_user_id)
          .filter(Boolean) as string[];
          
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id,email')
          .in('id', userIds.length > 0 ? userIds : ['00000000-0000-0000-0000-000000000000']);
          
        if (userError) {
          console.error('Error fetching user emails:', userError);
        }
        
        // Create a mapping of user IDs to emails
        const userEmailMap = userData ? 
          userData.reduce((acc, user) => ({...acc, [user.id]: user.email}), {}) : 
          {};
          
        // Add email to operations
        const operationsWithEmail = data.map(op => ({
          ...op,
          target_user_email: op.target_user_id ? (userEmailMap[op.target_user_id] || 'Unknown') : null
        }));
        
        setOperations(operationsWithEmail);
        
      } catch (error) {
        console.error('Error in fetchDistributorOperations:', error);
        toast.error(t("unexpectedError") || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDistributorOperations();
  }, [user, t]);
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "yyyy-MM-dd HH:mm:ss");
    } catch (error) {
      return timestamp;
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("distributorOperations") || "Operations History"}</CardTitle>
        </CardHeader>
        <CardContent>
          {operations.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              {t("noOperationsFound") || "No operations found"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("timestamp") || "Timestamp"}</TableHead>
                  <TableHead>{t("operationType") || "Operation Type"}</TableHead>
                  <TableHead>{t("amount") || "Amount"}</TableHead>
                  <TableHead>{t("status") || "Status"}</TableHead>
                  <TableHead>{t("targetUser") || "Target User"}</TableHead>
                  <TableHead>{t("actions") || "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operations.map((operation) => (
                  <TableRow key={operation.id}>
                    <TableCell>{formatTimestamp(operation.timestamp)}</TableCell>
                    <TableCell>{operation.operation_type}</TableCell>
                    <TableCell>{operation.amount?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>
                      <span className={
                        operation.status === 'completed' 
                          ? 'text-green-500' 
                          : operation.status === 'failed'
                            ? 'text-red-500'
                            : 'text-orange-500'
                      }>
                        {operation.status}
                      </span>
                    </TableCell>
                    <TableCell>{operation.target_user_email || 'N/A'}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => setSelectedOperation(operation)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>{t("operationDetails") || "Operation Details"}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="font-medium">{t("id") || "ID"}:</div>
                              <div>{operation.id}</div>
                              
                              <div className="font-medium">{t("timestamp") || "Timestamp"}:</div>
                              <div>{formatTimestamp(operation.timestamp)}</div>
                              
                              <div className="font-medium">{t("operationType") || "Operation Type"}:</div>
                              <div>{operation.operation_type}</div>
                              
                              <div className="font-medium">{t("amount") || "Amount"}:</div>
                              <div>{operation.amount?.toFixed(2) || '0.00'}</div>
                              
                              <div className="font-medium">{t("status") || "Status"}:</div>
                              <div>{operation.status}</div>
                              
                              <div className="font-medium">{t("targetUser") || "Target User"}:</div>
                              <div>{operation.target_user_email || 'N/A'}</div>
                            </div>
                            
                            <div className="pt-4 border-t">
                              <div className="font-medium mb-2">{t("operationDetails") || "Operation Details"}:</div>
                              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-[200px]">
                                {JSON.stringify(operation.operation_details, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
