
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDownIcon, SearchIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/sonner';

type ServerHistoryItem = {
  id: string;
  distributor_id: string;
  operation_type: string;
  operation_details: Record<string, any>;
  amount: number;
  timestamp: string;
  status: string;
  target_user_id: string;
};

export default function DistributorOperations() {
  const { user } = useAuth();
  const [operations, setOperations] = useState<ServerHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof ServerHistoryItem>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (!user) return;

    const fetchOperations = async () => {
      try {
        const { data, error } = await supabase
          .from('server_history')
          .select('*')
          .eq('distributor_id', user.id)
          .order(sortField, { ascending: sortDirection === 'asc' });

        if (error) {
          throw error;
        }

        // Convert operation_details from Json to Record<string, any>
        const typedData = data.map(item => ({
          ...item,
          operation_details: typeof item.operation_details === 'string' 
            ? JSON.parse(item.operation_details) 
            : item.operation_details
        })) as ServerHistoryItem[];

        setOperations(typedData);
      } catch (error) {
        console.error('Error fetching distributor operations:', error);
        toast.error('Failed to fetch operations history');
      } finally {
        setLoading(false);
      }
    };

    fetchOperations();
  }, [user, sortField, sortDirection]);

  const handleSort = (field: keyof ServerHistoryItem) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredOperations = operations.filter(op => {
    const searchLower = searchQuery.toLowerCase();
    return (
      op.operation_type.toLowerCase().includes(searchLower) ||
      op.status.toLowerCase().includes(searchLower) ||
      op.target_user_id?.toLowerCase().includes(searchLower) ||
      op.id.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Server Operations History</CardTitle>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search operations..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading operations...</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('timestamp')}>
                      Date
                      {sortField === 'timestamp' && (
                        <ChevronDownIcon className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('operation_type')}>
                      Operation
                      {sortField === 'operation_type' && (
                        <ChevronDownIcon className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('target_user_id')}>
                      Target User
                      {sortField === 'target_user_id' && (
                        <ChevronDownIcon className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('amount')}>
                      Amount
                      {sortField === 'amount' && (
                        <ChevronDownIcon className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('status')}>
                      Status
                      {sortField === 'status' && (
                        <ChevronDownIcon className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                      )}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOperations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No operations found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOperations.map((op) => (
                    <TableRow key={op.id}>
                      <TableCell>
                        {format(new Date(op.timestamp), 'PPP p')}
                      </TableCell>
                      <TableCell className="capitalize">
                        {op.operation_type.replace(/_/g, ' ')}
                      </TableCell>
                      <TableCell>
                        {op.target_user_id ? op.target_user_id.substring(0, 8) + '...' : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {op.amount ? op.amount : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                          ${op.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            op.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {op.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
