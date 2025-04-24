
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MigrationTool } from "@/components/MigrationTool";
import { useLanguage } from "@/hooks/useLanguage";

export default function DataMigration() {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);
  
  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen">
      <div className="max-w-5xl mx-auto py-8 px-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <CardTitle>{t("dataMigration") || "Data Migration Tool"}</CardTitle>
              <CardDescription>
                {t("dataMigrationDesc") || "Migrate your data from Firebase to Supabase"}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="py-6">
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h3 className="font-medium text-yellow-800 mb-2">
                  {t("migrationWarningTitle") || "Important Information Before Migration"}
                </h3>
                <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                  <li>{t("migrationWarning1") || "Make sure you have admin credentials for your Firebase database."}</li>
                  <li>{t("migrationWarning2") || "This process will transfer all user accounts and operation data."}</li>
                  <li>{t("migrationWarning3") || "For large datasets, the migration may take several minutes."}</li>
                  <li>{t("migrationWarning4") || "It's recommended to perform this migration only once."}</li>
                </ul>
              </div>
              
              <MigrationTool />
              
              <div className="text-center text-sm text-gray-500">
                {t("migrationSupport") || "If you encounter any issues during migration, please contact support."}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
