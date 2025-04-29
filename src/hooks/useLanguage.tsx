
import { createContext, useContext, useState, useEffect } from "react";

interface LanguageContextProps {
  language: string;
  setLanguage: (language: string) => void;
  isRTL: boolean;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
  const isRTL = language === "ar";

  useEffect(() => {
    document.documentElement.setAttribute("lang", language);
    document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
    localStorage.setItem("language", language);
  }, [language, isRTL]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === "en" ? "ar" : "en"));
  };

  const t = (key: string): string => {
    if (!key) return '';
    
    // Check if the translation exists for the current language
    if (TRANSLATIONS[language] && TRANSLATIONS[language][key]) {
      return TRANSLATIONS[language][key];
    }
    
    // Fallback to English if translation doesn't exist in current language
    if (language !== "en" && TRANSLATIONS["en"] && TRANSLATIONS["en"][key]) {
      console.log(`Missing translation for key "${key}" in language "${language}", falling back to English`);
      return TRANSLATIONS["en"][key];
    }
    
    // Return the key itself if no translation is found
    return key;
  };

  // Translation keys
  const TRANSLATIONS: Record<string, Record<string, string>> = {
    en: {
      dashboard: "Dashboard",
      editProfile: "Edit Profile",
      users: "Users",
      operations: "Operations",
      serverApiData: "Server API Data",
      serverStorage: "Server Storage",
      settings: "Settings",
      welcome: "Welcome",
      logout: "Logout",
      pegasusTool: "Pegasus Tool",
      allRightsReserved: "All rights reserved",
      totalUsers: "Total Users",
      monthlyLicense: "Monthly License",
      creditsLicense: "Credits License",
      totalOperations: "Total Operations",
      refundedOperations: "Refunded Operations",
      myCredits: "My Credits",
      expiryTime: "Expiry Time",
      userDataError: "User Data Error",
      userDataNotFound: "Please try refreshing the page",
      adminDataError: "Admin Data Error",
      adminDataNotFound: "Admin data could not be loaded",
      dataLoadError: "Error Loading Data",
      dashboardDataError: "Failed to load dashboard data. Please try refreshing the page.",
      loadingDashboard: "Loading dashboard...",
      // Login page translations
      login: "Login",
      email: "Email",
      password: "Password",
      loggingIn: "Logging in...",
      searchUsers: "Search users",
      checkingSession: "Checking session...",
      passwordResetSuccess: "Password reset successful",
      pleaseLoginWithNewPassword: "Please login with your new password",
      accountBlocked: "Account Blocked",
      accountBlockedDescription: "Your account has been blocked. Please contact support.",
      noCreditsLeft: "No Credits",
      noCreditsLeftDescription: "You have no credits left. Please recharge your account.",
      // New translations for charts
      monthlyOperationsChart: "Monthly Operations",
      operationsByType: "Operations by Type",
      platformMonthlyActivity: "Platform Monthly Activity",
      platformOperationTypes: "Platform Operation Types",
      lastSixMonths: "Operations over the last 6 months",
      operationTypeDistribution: "Distribution of operations by type",
      operationTypeBreakdown: "Breakdown of all operations by type",
      directUnlock: "Direct Unlock",
      frpRemove: "FRP Remove",
      readInfo: "Read Info",
      other: "Other",
      noOperationsFound: "No operations data available",
      monthData: "Month Data"
    },
    ar: {
      dashboard: "لوحة التحكم",
      editProfile: "تعديل الملف الشخصي",
      users: "المستخدمون",
      operations: "العمليات",
      serverApiData: "بيانات خادم واجهة البرمجة",
      serverStorage: "تخزين الخادم",
      settings: "الإعدادات",
      welcome: "مرحبًا",
      logout: "تسجيل الخروج",
      pegasusTool: "أداة بيغاسوس",
      allRightsReserved: "جميع الحقوق محفوظة",
      totalUsers: "إجمالي المستخدمين",
      monthlyLicense: "ترخيص شهري",
      creditsLicense: "ترخيص رصيد",
      totalOperations: "إجمالي العمليات",
      refundedOperations: "العمليات المستردة",
      myCredits: "رصيدي",
      expiryTime: "وقت الانتهاء",
      userDataError: "خطأ في بيانات المستخدم",
      userDataNotFound: "يرجى محاولة تحديث الصفحة",
      adminDataError: "خطأ في بيانات المسؤول",
      adminDataNotFound: "تعذر تحميل بيانات المسؤول",
      dataLoadError: "خطأ في تحميل البيانات",
      dashboardDataError: "فشل في تحميل بيانات لوحة التحكم. يرجى محاولة تحديث الصفحة.",
      loadingDashboard: "جارٍ تحميل لوحة التحكم...",
      // Login page translations
      login: "تسجيل الدخول",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      loggingIn: "جاري تسجيل الدخول...",
      searchUsers: "البحث عن المستخدمين",
      checkingSession: "جاري التحقق من حالة الجلسة...",
      passwordResetSuccess: "تم إعادة تعيين كلمة المرور بنجاح",
      pleaseLoginWithNewPassword: "الرجاء تسجيل الدخول بكلمة المرور الجديدة",
      accountBlocked: "الحساب محظور",
      accountBlockedDescription: "تم حظر حسابك. يرجى الاتصال بالدعم.",
      noCreditsLeft: "لا يوجد رصيد",
      noCreditsLeftDescription: "ليس لديك رصيد متبقي. يرجى إعادة شحن حسابك.",
      // New translations for charts
      monthlyOperationsChart: "العمليات الشهرية",
      operationsByType: "العمليات حسب النوع",
      platformMonthlyActivity: "نشاط المنصة الشهري",
      platformOperationTypes: "أنواع عمليات المنصة",
      lastSixMonths: "العمليات خلال الستة أشهر الماضية",
      operationTypeDistribution: "توزيع العمليات حسب النوع",
      operationTypeBreakdown: "تفصيل جميع العمليات حسب النوع",
      directUnlock: "فك القفل المباشر",
      frpRemove: "إزالة FRP",
      readInfo: "قراءة المعلومات",
      other: "أخرى",
      noOperationsFound: "لا توجد بيانات عمليات متاحة",
      monthData: "بيانات الشهر"
    }
  };

  const contextValue: LanguageContextProps = {
    language,
    setLanguage,
    isRTL,
    toggleLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextProps {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// The duplicate export was removed
