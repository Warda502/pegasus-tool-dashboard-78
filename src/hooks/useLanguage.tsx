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
      monthData: "Month Data",
      // User management translations
      name: "Name",
      phone: "Phone",
      country: "Country",
      userType: "User Type",
      credit: "Credit",
      status: "Status",
      activation: "Activation",
      startDate: "Start Date",
      expiryDate: "Expiry Date",
      userDetails: "User Details",
      completeUserInfo: "Complete user information",
      viewDetails: "View Details",
      edit: "Edit",
      renew: "Renew",
      delete: "Delete",
      renewUser: "Renew User",
      chooseRenewalMonths: "Choose number of months to renew",
      numberOfMonths: "Number of Months",
      selectMonths: "Select number of months",
      threeMonths: "3 Months",
      sixMonths: "6 Months",
      nineMonths: "9 Months",
      twelveMonths: "12 Months",
      cancel: "Cancel",
      expired: "Expired",
      daysRemaining: "days remaining",
      notApplicable: "N/A",
      actions: "Actions",
      filterByStatus: "Filter by Status",
      allStatuses: "All Statuses",
      active: "Active",
      blocked: "Blocked",
      filterByLicenseType: "Filter by License Type",
      allLicenseTypes: "All License Types",
      loadingUsers: "Loading users...",
      noUsersFound: "No users found",
      // Server page translations
      manageServerFiles: "Manage and organize server files and folders",
      loadingData: "Loading data...",
      errorLoadingData: "Error Loading Data",
      pleaseRefreshPage: "Please try refreshing the page.",
      viewServerData: "View and manage server API data",
      totalRecords: "total records",
      // Settings page translations
      systemSettings: "System Settings",
      controlSystemSettings: "Control system settings from here",
      saveSettings: "Save Settings",
      underDevelopment: "This page is currently under development.",
      // Other actions
      refresh: "Refresh",
      addCredit: "Add Credit",
      addUser: "Add User"
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
      monthData: "بيانات الشهر",
      // User management translations
      name: "الاسم",
      phone: "الهاتف",
      country: "الدولة",
      userType: "نوع المستخدم",
      credit: "الرصيد",
      status: "الحالة",
      activation: "التفعيل",
      startDate: "تاريخ البدء",
      expiryDate: "تاريخ الانتهاء",
      userDetails: "تفاصيل المستخدم",
      completeUserInfo: "معلومات المستخدم الكاملة",
      viewDetails: "عرض التفاصيل",
      edit: "تعديل",
      renew: "تجديد",
      delete: "حذف",
      renewUser: "تجديد حساب المستخدم",
      chooseRenewalMonths: "اختر عدد الأشهر لتجديد الحساب",
      numberOfMonths: "عدد الأشهر",
      selectMonths: "اختر عدد الأشهر",
      threeMonths: "3 أشهر",
      sixMonths: "6 أشهر",
      nineMonths: "9 أشهر",
      twelveMonths: "12 أشهر",
      cancel: "إلغاء",
      expired: "منتهي الصلاحية",
      daysRemaining: "أيام متبقية",
      notApplicable: "غير متوفر",
      actions: "الإجراءات",
      filterByStatus: "تصفية حسب الحالة",
      allStatuses: "جميع الحالات",
      active: "نشط",
      blocked: "محظور",
      filterByLicenseType: "تصفية حسب نوع الترخيص",
      allLicenseTypes: "جميع أنواع التراخيص",
      loadingUsers: "جاري تحميل المستخدمين...",
      noUsersFound: "لم يتم العثور على مستخدمين",
      // Server page translations
      manageServerFiles: "إدارة وتنظيم ملفات ومجلدات الخادم",
      loadingData: "جاري تحميل البيانات...",
      errorLoadingData: "خطأ في تحميل البيانات",
      pleaseRefreshPage: "يرجى محاولة تحديث الصفحة.",
      viewServerData: "عرض وإدارة بيانات واجهة برمجة الخادم",
      totalRecords: "إجمالي السجلات",
      // Settings page translations
      systemSettings: "إعدادات النظام",
      controlSystemSettings: "تحكم في إعدادات النظام من هنا",
      saveSettings: "حفظ الإعدادات",
      underDevelopment: "هذه الصفحة قيد التطوير حاليًا.",
      // Other actions
      refresh: "تحديث",
      addCredit: "إضافة رصيد",
      addUser: "إضافة مستخدم"
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
