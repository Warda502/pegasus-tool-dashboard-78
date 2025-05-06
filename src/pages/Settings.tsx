
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Settings as SettingsIcon, 
  Languages, 
  Sun, 
  Moon, 
  Monitor, 
  CheckCircle2 
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Settings() {
  const { t, isRTL, currentLanguage, setLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage || "auto");
  const [selectedTheme, setSelectedTheme] = useState("auto");
  
  // Get current theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "auto";
    setSelectedTheme(savedTheme);
    
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // Auto theme based on system preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
  };

  const handleThemeChange = (value: string) => {
    setSelectedTheme(value);
  };

  const saveSettings = () => {
    // Save language
    setLanguage(selectedLanguage === "auto" ? 
      (window.navigator.language.includes("ar") ? "ar" : "en") : 
      selectedLanguage);
    
    // Save theme
    localStorage.setItem("theme", selectedTheme);
    
    // Apply theme
    if (selectedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (selectedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // Auto theme based on system preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      
      // Listen for changes in system preference
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        if (selectedTheme === "auto") {
          if (e.matches) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
        }
      });
    }
    
    toast.success(t("settingsSaved") || "Settings saved successfully");
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="grid gap-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <SettingsIcon className="h-5 w-5" />
            <span>{t("systemSettings") || "System Settings"}</span>
          </CardTitle>
          <CardDescription>
            {t("manageSystemSettings") || "Manage system settings and preferences"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-6">
              {/* Language Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Languages className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-medium">{t("language") || "Language"}</h3>
                </div>
                <Separator />
                <RadioGroup 
                  value={selectedLanguage} 
                  onValueChange={handleLanguageChange}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2"
                >
                  <div className="flex items-center space-x-2 space-y-0">
                    <RadioGroupItem value="en" id="lang-en" />
                    <Label htmlFor="lang-en" className="font-normal cursor-pointer">
                      English
                      {selectedLanguage === "en" && (
                        <CheckCircle2 className="h-3 w-3 text-primary inline ms-1" />
                      )}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-y-0">
                    <RadioGroupItem value="ar" id="lang-ar" />
                    <Label htmlFor="lang-ar" className="font-normal cursor-pointer">
                      العربية
                      {selectedLanguage === "ar" && (
                        <CheckCircle2 className="h-3 w-3 text-primary inline ms-1" />
                      )}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-y-0">
                    <RadioGroupItem value="auto" id="lang-auto" />
                    <Label htmlFor="lang-auto" className="font-normal cursor-pointer">
                      {t("autoSystem") || "Auto (System)"}
                      {selectedLanguage === "auto" && (
                        <CheckCircle2 className="h-3 w-3 text-primary inline ms-1" />
                      )}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Theme Settings */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2">
                  {selectedTheme === "dark" ? (
                    <Moon className="h-5 w-5 text-primary" />
                  ) : selectedTheme === "light" ? (
                    <Sun className="h-5 w-5 text-primary" />
                  ) : (
                    <Monitor className="h-5 w-5 text-primary" />
                  )}
                  <h3 className="text-lg font-medium">{t("theme") || "Theme"}</h3>
                </div>
                <Separator />
                <RadioGroup 
                  value={selectedTheme} 
                  onValueChange={handleThemeChange}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2"
                >
                  <div className="flex items-center space-x-2 space-y-0">
                    <RadioGroupItem value="light" id="theme-light" />
                    <Label htmlFor="theme-light" className="font-normal cursor-pointer">
                      <span className="flex items-center">
                        <Sun className="h-4 w-4 mr-2" />
                        {t("light") || "Light"}
                      </span>
                      {selectedTheme === "light" && (
                        <CheckCircle2 className="h-3 w-3 text-primary inline ms-1" />
                      )}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-y-0">
                    <RadioGroupItem value="dark" id="theme-dark" />
                    <Label htmlFor="theme-dark" className="font-normal cursor-pointer">
                      <span className="flex items-center">
                        <Moon className="h-4 w-4 mr-2" />
                        {t("dark") || "Dark"}
                      </span>
                      {selectedTheme === "dark" && (
                        <CheckCircle2 className="h-3 w-3 text-primary inline ms-1" />
                      )}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-y-0">
                    <RadioGroupItem value="auto" id="theme-auto" />
                    <Label htmlFor="theme-auto" className="font-normal cursor-pointer">
                      <span className="flex items-center">
                        <Monitor className="h-4 w-4 mr-2" />
                        {t("autoSystem") || "Auto (System)"}
                      </span>
                      {selectedTheme === "auto" && (
                        <CheckCircle2 className="h-3 w-3 text-primary inline ms-1" />
                      )}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="pt-6">
                <Button onClick={saveSettings} className="w-full sm:w-auto">
                  {t("saveSettings") || "Save Settings"}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
