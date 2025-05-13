import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Moon, Sun, Globe, Languages } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const [currentLanguage, setCurrentLanguage] = useState<string>(language);
  const [currentTheme, setCurrentTheme] = useState<string>(
    localStorage.getItem("theme") || "system"
  );

  // Handle language change
  const handleLanguageChange = (value: string) => {
    setCurrentLanguage(value);
  };

  // Handle theme change
  const handleThemeChange = (value: string) => {
    setCurrentTheme(value);
    if (value === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else if (value === "light") {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      // System default
      localStorage.setItem("theme", "system");
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  // Save settings
  const saveSettings = () => {
    setLanguage(currentLanguage as "en" | "ar");
    handleThemeChange(currentTheme);
    toast.success(t("settingsUpdatedSuccessfully") || "Settings updated successfully");
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            <span>{t("settingsTitle") || "Settings"}</span>
          </CardTitle>
          <CardDescription>{t("settingsDescription") || "Manage your system settings"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Language Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">{t("language") || "Language"}</h3>
            </div>
            <div className="border rounded-lg p-4">
              <RadioGroup 
                value={currentLanguage} 
                onValueChange={handleLanguageChange}
                className="flex flex-col space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="en" id="lang-en" />
                  <Label htmlFor="lang-en" className="cursor-pointer">
                    {t("english") || "English"}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ar" id="lang-ar" />
                  <Label htmlFor="lang-ar" className="cursor-pointer">
                    {t("arabic") || "Arabic"}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">{t("theme") || "Theme"}</h3>
            </div>
            <div className="border rounded-lg p-4">
              <RadioGroup 
                value={currentTheme} 
                onValueChange={handleThemeChange}
                className="flex flex-col space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="theme-light" />
                  <Label htmlFor="theme-light" className="cursor-pointer">
                    {t("light") || "Light"}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="theme-dark" />
                  <Label htmlFor="theme-dark" className="cursor-pointer">
                    {t("dark") || "Dark"}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="theme-system" />
                  <Label htmlFor="theme-system" className="cursor-pointer">
                    {t("system") || "System"}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Other settings could be added here */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-medium">{t("settingsSwitch") || "Settings Switch"}</h3>
            </div>
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="cursor-pointer">
                  {t("notifications") || "Notifications"}
                </Label>
                <Switch id="notifications" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sound" className="cursor-pointer">
                  {t("sound") || "Sound"}
                </Label>
                <Switch id="sound" />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button onClick={saveSettings} className="w-full md:w-auto">
            {t("save") || "Save Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
