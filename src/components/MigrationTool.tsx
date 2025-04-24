
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Loader2, ArrowRightLeft, Check, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { useQueryClient } from "@tanstack/react-query";

export const MigrationTool: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const queryClient = useQueryClient();
  
  const handleMigration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast("Error", {
        description: "Please enter your admin email and password"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Call the migration function
      const { data, error } = await supabase.functions.invoke('migrate-firebase-data', {
        body: { email, password }
      });
      
      if (error) throw error;
      
      setResults(data);
      
      if (data.success) {
        toast("Migration Complete", {
          description: `Successfully migrated ${data.stats.users.migrated} users and ${data.stats.operations.migrated} operations.`
        });
        
        // Refresh the data in the app
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['operations'] });
      } else {
        toast("Migration Failed", {
          description: data.error || "An unknown error occurred during migration"
        });
      }
      
    } catch (error) {
      console.error("Migration error:", error);
      toast("Error", {
        description: error instanceof Error ? error.message : "Failed to start migration process"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-lg mx-auto" dir={isRTL ? "rtl" : "ltr"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5" />
          {t("dataImport") || "Firebase to Supabase Data Import"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleMigration}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("adminEmail") || "Admin Email"}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t("adminPassword") || "Admin Password"}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? (t("migrating") || "Migrating Data...") : (t("startMigration") || "Start Migration")}
            </Button>
          </div>
        </form>
        
        {results && (
          <div className="mt-6 border rounded-md p-4 bg-gray-50">
            <h3 className="font-medium text-lg mb-2">{t("migrationResults") || "Migration Results:"}</h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{t("users") || "Users"}:</span>
                </div>
                <p className="text-sm text-gray-600 ml-6">
                  {t("migratedCount") || "Migrated"}: {results.stats.users.migrated} / {results.stats.users.total}
                  {results.stats.users.errors > 0 && (
                    <span className="flex items-center gap-1 text-red-500 mt-1">
                      <AlertTriangle className="h-3 w-3" />
                      {t("errors") || "Errors"}: {results.stats.users.errors}
                    </span>
                  )}
                </p>
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{t("operations") || "Operations"}:</span>
                </div>
                <p className="text-sm text-gray-600 ml-6">
                  {t("migratedCount") || "Migrated"}: {results.stats.operations.migrated} / {results.stats.operations.total}
                  {results.stats.operations.errors > 0 && (
                    <span className="flex items-center gap-1 text-red-500 mt-1">
                      <AlertTriangle className="h-3 w-3" />
                      {t("errors") || "Errors"}: {results.stats.operations.errors}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-gray-500">
        {t("migrationWarning") || "This process may take some time depending on the amount of data."}
      </CardFooter>
    </Card>
  );
};
