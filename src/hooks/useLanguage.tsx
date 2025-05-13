import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Existing translations
      dashboard: "Dashboard",
      operations: "Operations",
      usersManager: "Users Manager",
      discounts: "Discounts",
      groupsManagement: "Groups Management",
      myCertFiles: "My Cert Files",
      serverApiData: "Server API Data",
      serverStorage: "Server Storage",
      toolUpdate: "Tool Update",
      toolSettings: "Tool Settings",
      webSettings: "Web Settings",
      settings: "Settings",
      supportedModels: "Supported Models",
      pricing: "Pricing",
      notifications: "Notifications",
      noNewNotifications: "No new notifications",
      myProfile: "My Profile",
      twoFactorAuth: "Two-Factor Authentication",
      logout: "Logout",
      login: "Login",
      email: "Email",
      password: "Password",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      loginSuccess: "Login successful",
      welcomeBack: "Welcome back!",
      loginFailed: "Login failed",
      unexpectedError: "An unexpected error occurred",
      logoutSuccess: "Logout successful",
      comeBackSoon: "Come back soon!",
      logoutFailed: "Logout failed",
      loggedOutInAnotherTab: "Logged out in another tab",
      sessionEnded: "Your session has ended",
      sessionExpired: "Session expired",
      pleaseLoginAgain: "Please login again",
      fetchSuccessTitle: "Success",
      fetchSuccessDescription: "Data loaded successfully",
      fetchError: "Error",
      errorFetchingData: "Error fetching data",
      name: "Name",
      phone: "Phone",
      country: "Country",
      credits: "Credits",
      userType: "User Type",
      status: "Status",
      active: "Active",
      inactive: "Inactive",
      actions: "Actions",
      view: "View",
      edit: "Edit",
      delete: "Delete",
      cancel: "Cancel",
      close: "Close",
      loading: "Loading",
      search: "Search",
      all: "All",
      yes: "Yes",
      no: "No",
      confirm: "Confirm",
      confirmDelete: "Are you sure you want to delete this item?",
      deleteSuccess: "Item deleted successfully",
      deleteError: "Error deleting item",
      createError: "Error creating item",
      updateError: "Error updating item",
      addCreditsError: "Error adding credits",
      removeUserError: "Error removing user",

      // Distributor management translations
      distributorsManagement: "Distributors Management",
      distributorsManagementDescription: "Manage distributors, credits, and user assignments",
      addDistributor: "Add Distributor",
      editDistributor: "Edit Distributor",
      addDistributorDescription: "Create a new distributor account",
      editDistributorDescription: "Edit distributor information",
      distributorName: "Distributor Name",
      commissionRate: "Commission Rate",
      commissionRateDescription: "Percentage of sales given to distributor",
      maxCreditLimit: "Max Credit Limit",
      maxCreditLimitDescription: "Maximum credits allowed for this distributor",
      initialCredits: "Initial Credits",
      initialCreditsDescription: "Initial credits to allocate to this distributor",
      selectCountry: "Select Country",
      distributorCreated: "Distributor Created",
      distributorCreatedSuccess: "New distributor has been created successfully",
      distributorUpdated: "Distributor Updated",
      distributorUpdatedSuccess: "Distributor information has been updated",
      manageCredits: "Manage Credits",
      manageCreditsDescription: "Add or remove credits for {{name}}",
      currentBalance: "Current Balance",
      amount: "Amount",
      amountDescription: "Use positive values to add credits, negative to remove",
      notes: "Notes",
      notesDescription: "Optional notes for this transaction",
      updateCredits: "Update Credits",
      creditsAdded: "Credits Updated",
      creditsAddedSuccess: "Distributor credits have been updated successfully",
      processing: "Processing...",
      manageUsers: "Manage Users",
      manageUsersDescription: "Manage users assigned to {{name}}",
      searchUsers: "Search users...",
      addUser: "Add User",
      removeUser: "Remove User",
      noUsersFound: "No users found",
      noUsersAssigned: "No users assigned to this distributor",
      confirmRemoveUser: "Are you sure you want to remove this user from the distributor?",
      userAdded: "User Added",
      userAddedToDistributor: "User has been assigned to distributor",
      userRemoved: "User Removed",
      userRemovedFromDistributor: "User has been removed from distributor",
      transactionHistory: "Transaction History",
      transactionHistoryDescription: "View credit transactions for {{name}}",
      date: "Date",
      balance: "Balance",
      noTransactions: "No transactions found",
      distributorDetails: "Distributor Details",
      searchDistributors: "Search distributors...",
      noDistributorsFound: "No distributors found",
      maxLimit: "Max",
      creating: "Creating...",
      saving: "Saving...",
      create: "Create",
      save: "Save",
      
      // Arabic translations
      "ar": {
        // Distributor management translations (Arabic)
        distributorsManagement: "إدارة الموزعين",
        distributorsManagementDescription: "إدارة الموزعين والائتمانات وتعيينات المستخدمين",
        addDistributor: "إضافة موزع",
        editDistributor: "تعديل موزع",
        addDistributorDescription: "إنشاء حساب موزع جديد",
        editDistributorDescription: "تعديل معلومات الموزع",
        distributorName: "اسم الموزع",
        commissionRate: "نسبة العمولة",
        commissionRateDescription: "النسبة المئوية من المبيعات المعطاة للموزع",
        maxCreditLimit: "الحد الأقصى للائتمان",
        maxCreditLimitDescription: "الحد الأقصى للائتمانات المسموح بها لهذا الموزع",
        initialCredits: "الائتمانات الأولية",
        initialCreditsDescription: "الائتمانات الأولية لتخصيصها لهذا الموزع",
        selectCountry: "اختر البلد",
        distributorCreated: "تم إنشاء الموزع",
        distributorCreatedSuccess: "تم إنشاء موزع جديد بنجاح",
        distributorUpdated: "تم تحديث الموزع",
        distributorUpdatedSuccess: "تم تحديث معلومات الموزع",
        manageCredits: "إدارة الائتمانات",
        manageCreditsDescription: "إضافة أو إزالة الائتمانات لـ {{name}}",
        currentBalance: "الرصيد الحالي",
        amount: "المبلغ",
        amountDescription: "استخدم القيم الإيجابية لإضافة الائتمانات، والسلبية للإزالة",
        notes: "ملاحظات",
        notesDescription: "ملاحظات اختيارية لهذه المعاملة",
        updateCredits: "تحديث الائتمانات",
        creditsAdded: "تم تحديث الائتمانات",
        creditsAddedSuccess: "تم تحديث ائتمانات الموزع بنجاح",
        processing: "جاري المعالجة...",
        manageUsers: "إدارة المستخدمين",
        manageUsersDescription: "إدارة المستخدمين المعينين لـ {{name}}",
        searchUsers: "بحث عن مستخدمين...",
        addUser: "إضافة مستخدم",
        removeUser: "إزالة مستخدم",
        noUsersFound: "لم يتم العثور على مستخدمين",
        noUsersAssigned: "لا يوجد مستخدمين معينين لهذا الموزع",
        confirmRemoveUser: "هل أنت متأكد أنك تريد إزالة هذا المستخدم من الموزع؟",
        userAdded: "تمت إضافة المستخدم",
        userAddedToDistributor: "تم تعيين المستخدم للموزع",
        userRemoved: "تمت إزالة المستخدم",
        userRemovedFromDistributor: "تمت إزالة المستخدم من الموزع",
        transactionHistory: "سجل المعاملات",
        transactionHistoryDescription: "عرض معاملات الائتمان لـ {{name}}",
        date: "التاريخ",
        balance: "الرصيد",
        noTransactions: "لم يتم العثور على معاملات",
        distributorDetails: "تفاصيل الموزع",
        searchDistributors: "بحث عن موزعين...",
        noDistributorsFound: "لم يتم العثور على موزعين",
        maxLimit: "الحد الأقصى",
        creating: "جاري الإنشاء...",
        saving: "جاري الحفظ...",
        create: "إنشاء",
        save: "حفظ",
      }
    }
  }
};

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Define interface for the context
interface LanguageContextType {
  language: string;
  t: (key: string, options?: any) => string;
  changeLanguage: (lang: string) => void;
  isRTL: boolean;
}

// Create a context for the language
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  t: (key: string, options?: any) => key,
  changeLanguage: (lang: string) => {},
  isRTL: false,
});

// Provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(i18n.language || 'en');
  const [isRTL, setIsRTL] = useState(language === 'ar');

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
    setIsRTL(lang === 'ar');
    localStorage.setItem('i18nextLng', lang);
  };

  useEffect(() => {
    // Set the language direction attribute on the document
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [isRTL]);

  // Ensure the t function always returns a string
  const t = (key: string, options?: any): string => {
    const translation = i18n.t(key, options);
    return typeof translation === 'string' ? translation : String(translation);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export function useLanguage() {
  return useContext(LanguageContext);
}
