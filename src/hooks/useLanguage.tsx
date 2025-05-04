
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { useTranslation } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import { createContext, useContext, ReactNode } from "react";

// Translations
const translations = {
  en: {
    translation: {
      pegasusTool: "Pegasus Tool",
      welcome: "Welcome",
      logout: "Logout",
      dashboard: "Dashboard",
      users: "Users",
      operations: "Operations",
      settings: "Settings",
      allRightsReserved: "© 2024 All rights reserved.",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      confirm: "Confirm",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      save: "Save",
      search: "Search",
      name: "Name",
      email: "Email",
      role: "Role",
      actions: "Actions",
      addUser: "Add User",
      editUser: "Edit User",
      userCreatedSuccessfully: "User created successfully",
      userUpdatedSuccessfully: "User updated successfully",
      userDeletedSuccessfully: "User deleted successfully",
      createUser: "Create User",
      updateUser: "Update User",
      areYouSureDeleteUser: "Are you sure you want to delete this user?",
      no: "No",
      yes: "Yes",
      somethingWentWrong: "Something went wrong",
      usersManager: "Users Manager",
      admin: "Admin",
      user: "User",
      guest: "Guest",
      editProfile: "Edit Profile",
      updateProfile: "Update Profile",
      profileUpdatedSuccessfully: "Profile updated successfully",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmNewPassword: "Confirm New Password",
      passwordNotMatch: "Passwords do not match",
      passwordUpdatedSuccessfully: "Password updated successfully",
      updatePassword: "Update Password",
      serverApiData: "Server API Data",
      serverStorage: "Server Storage",
      myCertFiles: "My Cert Files",
      discounts: "Discounts",
      groupsManagement: "Groups Management",
      toolUpdate: "Tool Update",
      toolSettings: "Tool Settings",
      fixBugs: "Fix Bugs",
      chatSupport: "Chat Support",
      chatWithUser: "Chat with User",
      chatWithSupport: "Chat with Support",
      typeMessage: "Type a message...",
      loginRequired: "Please log in to use chat support",
      noMessagesYet: "No messages yet with this user",
      startConversation: "Start a conversation with our support team",
      conversations: "Conversations",
      noSearchResults: "No users match your search",
      noConversations: "No conversations yet",
      selectConversation: "Select a Conversation",
      selectUserDescription: "Choose a user from the list to view and respond to their messages.",
      messageSent: "Message sent",
      errorSendingMessage: "Error sending message"
    },
  },
  ar: {
    translation: {
      pegasusTool: "أداة بيغاسوس",
      welcome: "مرحبا",
      logout: "تسجيل الخروج",
      dashboard: "لوحة التحكم",
      users: "المستخدمون",
      operations: "العمليات",
      settings: "الإعدادات",
      allRightsReserved: "© 2024 جميع الحقوق محفوظة.",
      loading: "جار التحميل...",
      error: "خطأ",
      success: "نجاح",
      confirm: "تأكيد",
      cancel: "إلغاء",
      delete: "حذف",
      edit: "تعديل",
      save: "حفظ",
      search: "بحث",
      name: "الاسم",
      email: "البريد الإلكتروني",
      role: "الدور",
      actions: "الإجراءات",
      addUser: "إضافة مستخدم",
      editUser: "تعديل مستخدم",
      userCreatedSuccessfully: "تم إنشاء المستخدم بنجاح",
      userUpdatedSuccessfully: "تم تحديث المستخدم بنجاح",
      userDeletedSuccessfully: "تم حذف المستخدم بنجاح",
      createUser: "إنشاء مستخدم",
      updateUser: "تحديث مستخدم",
      areYouSureDeleteUser: "هل أنت متأكد أنك تريد حذف هذا المستخدم؟",
      no: "لا",
      yes: "نعم",
      somethingWentWrong: "حدث خطأ ما",
      usersManager: "إدارة المستخدمين",
      admin: "مدير",
      user: "مستخدم",
      guest: "ضيف",
      editProfile: "تعديل الملف الشخصي",
      updateProfile: "تحديث الملف الشخصي",
      profileUpdatedSuccessfully: "تم تحديث الملف الشخصي بنجاح",
      currentPassword: "كلمة المرور الحالية",
      newPassword: "كلمة المرور الجديدة",
      confirmNewPassword: "تأكيد كلمة المرور الجديدة",
      passwordNotMatch: "كلمات المرور غير متطابقة",
      passwordUpdatedSuccessfully: "تم تحديث كلمة المرور بنجاح",
      updatePassword: "تحديث كلمة المرور",
      serverApiData: "بيانات خادم API",
      serverStorage: "تخزين الخادم",
      myCertFiles: "ملفات الشهادات الخاصة بي",
      discounts: "الخصومات",
      groupsManagement: "إدارة المجموعات",
      toolUpdate: "تحديث الأداة",
      toolSettings: "إعدادات الأداة",
      fixBugs: "إصلاح الأخطاء",
      chatSupport: "الدعم عبر المحادثة",
      chatWithUser: "محادثة مع المستخدم",
      chatWithSupport: "محادثة مع الدعم",
      typeMessage: "اكتب رسالة...",
      loginRequired: "يرجى تسجيل الدخول لاستخدام الدعم عبر المحادثة",
      noMessagesYet: "لا توجد رسائل بعد مع هذا المستخدم",
      startConversation: "ابدأ محادثة مع فريق الدعم لدينا",
      conversations: "المحادثات",
      noSearchResults: "لا يوجد مستخدمين مطابقين لبحثك",
      noConversations: "لا توجد محادثات بعد",
      selectConversation: "اختر محادثة",
      selectUserDescription: "اختر مستخدمًا من القائمة لعرض والرد على رسائله.",
      messageSent: "تم إرسال الرسالة",
      errorSendingMessage: "خطأ في إرسال الرسالة"
    },
  },
};

// Initialize i18n instance
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: translations,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

// Create context for language provider
type LanguageContextType = {
  language: string;
  changeLanguage: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Create language provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };
  
  return (
    <LanguageContext.Provider value={{ 
      language: i18n.language,
      changeLanguage
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook to use language functionality
export const useLanguage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  
  // Get context values
  const context = useContext(LanguageContext);
  
  return { 
    t, 
    i18n, 
    isRTL,
    language: i18n.language,
    changeLanguage: (lang: string) => i18n.changeLanguage(lang)
  };
};
