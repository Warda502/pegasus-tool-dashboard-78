
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            <span>إعدادات النظام</span>
          </CardTitle>
          <CardDescription>تحكم في إعدادات النظام من هنا</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">هذه الصفحة قيد التطوير حاليًا.</p>
          <Button variant="outline">حفظ الإعدادات</Button>
        </CardContent>
      </Card>
    </div>
  );
}
