import React, { createContext, useContext, useState } from "react";

// Define language context type
interface LanguageContextType {
  language: "en" | "ar";
  t: (key: string) => string;
  setLanguage: (lang: "en" | "ar") => void;
  isRTL: boolean;
}

const defaultLanguage = "en";

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations = {
  // Common strings
  dashboard: {
    en: "Dashboard",
    ar: "لوحة التحكم"
  },
  users: {
    en: "Users",
    ar: "المستخدمين"
  },
  operations: {
    en: "Operations",
    ar: "العمليات"
  },
  settings: {
    en: "Settings",
    ar: "الإعدادات"
  },
  editProfile: {
    en: "Edit Profile",
    ar: "تعديل الملف الشخصي"
  },
  myCertFiles: {
    en: "My Certificate Files",
    ar: "ملفات شهاداتي"
  },
  serverApiData: {
    en: "Server API Data",
    ar: "بيانات API الخادم"
  },
  serverStorage: {
    en: "Server Storage",
    ar: "تخزين الخادم"
  },
  discounts: {
    en: "Discounts",
    ar: "الخصومات"
  },
  groupsManagement: {
    en: "Groups Management",
    ar: "إدارة المجموعات"
  },
  toolUpdate: {
    en: "Tool Update",
    ar: "تحديث الأداة"
  },
  
  // Login page
  welcome: {
    en: "Welcome",
    ar: "مرحبا"
  },
  email: {
    en: "Email",
    ar: "البريد الإلكتروني"
  },
  password: {
    en: "Password",
    ar: "كلمة المرور"
  },
  login: {
    en: "Login",
    ar: "تسجيل الدخول"
  },
  forgotPassword: {
    en: "Forgot Password?",
    ar: "نسيت كلمة المرور؟"
  },
  loginSuccess: {
    en: "Login Successful",
    ar: "تم تسجيل الدخول بنجاح"
  },
  loginFailed: {
    en: "Login Failed",
    ar: "فشل تسجيل الدخول"
  },
  welcomeBack: {
    en: "Welcome back!",
    ar: "مرحبًا بعودتك!"
  },
  
  // Dashboard
  totalUsers: {
    en: "Total Users",
    ar: "إجمالي المستخدمين"
  },
  activeUsers: {
    en: "Active Users",
    ar: "المستخدمين النشطين"
  },
  totalOperations: {
    en: "Total Operations",
    ar: "إجمالي العمليات"
  },
  recentActivity: {
    en: "Recent Activity",
    ar: "النشاط الأخير"
  },
  monthlyOperations: {
    en: "Monthly Operations",
    ar: "العمليات الشهرية"
  },
  operationsByType: {
    en: "Operations by Type",
    ar: "العمليات حسب النوع"
  },

  // Users page
  addNewUser: {
    en: "Add New User",
    ar: "إضافة مستخدم جديد"
  },
  editUser: {
    en: "Edit User",
    ar: "تعديل المستخدم"
  },
  viewUser: {
    en: "View User",
    ar: "عرض المستخدم"
  },
  renewUser: {
    en: "Renew User",
    ar: "تجديد المستخدم"
  },
  addCredits: {
    en: "Add Credits",
    ar: "إضافة رصيد"
  },
  name: {
    en: "Name",
    ar: "الاسم"
  },
  emailAddress: {
    en: "Email Address",
    ar: "البريد الإلكتروني"
  },
  status: {
    en: "Status",
    ar: "الحالة"
  },
  type: {
    en: "Type",
    ar: "النوع"
  },
  expiryDate: {
    en: "Expiry Date",
    ar: "تاريخ الانتهاء"
  },
  startDate: {
    en: "Start Date",
    ar: "تاريخ البدء"
  },
  credits: {
    en: "Credits",
    ar: "الرصيد"
  },
  actions: {
    en: "Actions",
    ar: "الإجراءات"
  },
  userDetails: {
    en: "User Details",
    ar: "تفاصيل المستخدم"
  },
  phone: {
    en: "Phone",
    ar: "الهاتف"
  },
  country: {
    en: "Country",
    ar: "البلد"
  },
  activate: {
    en: "Activate",
    ar: "تفعيل"
  },
  blocked: {
    en: "Blocked",
    ar: "محظور"
  },
  hwid: {
    en: "HWID",
    ar: "معرف الجهاز"
  },
  active: {
    en: "Active",
    ar: "نشط"
  },
  inactive: {
    en: "Inactive",
    ar: "غير نشط"
  },
  notBlocked: {
    en: "Not Blocked",
    ar: "غير محظور"
  },
  admin: {
    en: "Admin",
    ar: "مدير"
  },
  user: {
    en: "User",
    ar: "مستخدم"
  },
  monthlyLicense: {
    en: "Monthly License",
    ar: "رخصة شهرية"
  },
  annualLicense: {
    en: "Annual License",
    ar: "رخصة سنوية"
  },
  lifetimeLicense: {
    en: "Lifetime License",
    ar: "رخصة مدى الحياة"
  },
  addUser: {
    en: "Add User",
    ar: "إضافة مستخدم"
  },
  save: {
    en: "Save",
    ar: "حفظ"
  },
  cancel: {
    en: "Cancel",
    ar: "إلغاء"
  },
  saveChanges: {
    en: "Save Changes",
    ar: "حفظ التغييرات"
  },
  confirmRenewal: {
    en: "Confirm Renewal",
    ar: "تأكيد التجديد"
  },
  renewalSuccess: {
    en: "Renewal Successful",
    ar: "تم التجديد بنجاح"
  },
  renewalFailed: {
    en: "Renewal Failed",
    ar: "فشل التجديد"
  },
  creditsAdded: {
    en: "Credits Added",
    ar: "تمت إضافة الرصيد"
  },
  userCreated: {
    en: "User Created",
    ar: "تم إنشاء المستخدم"
  },
  userUpdated: {
    en: "User Updated",
    ar: "تم تحديث المستخدم"
  },
  errorOccurred: {
    en: "An error occurred",
    ar: "حدث خطأ"
  },
  searchUsers: {
    en: "Search users...",
    ar: "بحث المستخدمين..."
  },
  passwordConfirmation: {
    en: "Password Confirmation",
    ar: "تأكيد كلمة المرور"
  },
  enterAmount: {
    en: "Enter Amount",
    ar: "أدخل المبلغ"
  },
  currentCredits: {
    en: "Current Credits",
    ar: "الرصيد الحالي"
  },
  newTotalCredits: {
    en: "New Total Credits",
    ar: "إجمالي الرصيد الجديد"
  },
  renewFor: {
    en: "Renew For",
    ar: "تجديد لمدة"
  },
  month: {
    en: "Month",
    ar: "شهر"
  },
  months: {
    en: "Months",
    ar: "أشهر"
  },
  year: {
    en: "Year",
    ar: "سنة"
  },
  years: {
    en: "Years",
    ar: "سنوات"
  },
  newExpiryDate: {
    en: "New Expiry Date",
    ar: "تاريخ انتهاء جديد"
  },
  
  // Operations page
  id: {
    en: "ID",
    ar: "المعرف"
  },
  brand: {
    en: "Brand",
    ar: "العلامة التجارية"
  },
  model: {
    en: "Model",
    ar: "الموديل"
  },
  imei: {
    en: "IMEI",
    ar: "IMEI"
  },
  operationType: {
    en: "Operation Type",
    ar: "نوع العملية"
  },
  date: {
    en: "Date",
    ar: "التاريخ"
  },
  operationDetails: {
    en: "Operation Details",
    ar: "تفاصيل العملية"
  },
  phoneInfo: {
    en: "Phone Information",
    ar: "معلومات الهاتف"
  },
  serialNumber: {
    en: "Serial Number",
    ar: "الرقم التسلسلي"
  },
  android: {
    en: "Android",
    ar: "أندرويد"
  },
  baseband: {
    en: "Baseband",
    ar: "الحزمة الأساسية"
  },
  securityPatch: {
    en: "Security Patch",
    ar: "تحديث الأمان"
  },
  carrier: {
    en: "Carrier",
    ar: "شركة الاتصالات"
  },
  cost: {
    en: "Cost",
    ar: "التكلفة"
  },
  searchOperations: {
    en: "Search operations...",
    ar: "بحث العمليات..."
  },
  refreshData: {
    en: "Refresh Data",
    ar: "تحديث البيانات"
  },
  exportData: {
    en: "Export Data",
    ar: "تصدير البيانات"
  },
  operationsRecords: {
    en: "Operations Records",
    ar: "سجلات العمليات"
  },
  
  // File management
  uploadFile: {
    en: "Upload File",
    ar: "رفع ملف"
  },
  fileName: {
    en: "File Name",
    ar: "اسم الملف"
  },
  fileSize: {
    en: "Size",
    ar: "الحجم"
  },
  fileType: {
    en: "Type",
    ar: "النوع"
  },
  uploadDate: {
    en: "Upload Date",
    ar: "تاريخ الرفع"
  },
  download: {
    en: "Download",
    ar: "تحميل"
  },
  delete: {
    en: "Delete",
    ar: "حذف"
  },
  deleteFile: {
    en: "Delete File",
    ar: "حذف الملف"
  },
  deleteConfirmation: {
    en: "Are you sure you want to delete this file?",
    ar: "هل أنت متأكد من أنك تريد حذف هذا الملف؟"
  },
  selectFiles: {
    en: "Select files",
    ar: "اختر الملفات"
  },
  dragAndDrop: {
    en: "or drag and drop",
    ar: "أو اسحب وأفلت"
  },
  uploadSuccess: {
    en: "File uploaded successfully",
    ar: "تم رفع الملف بنجاح"
  },
  uploadFailed: {
    en: "File upload failed",
    ar: "فشل رفع الملف"
  },
  
  // Certificates
  certificates: {
    en: "Certificates",
    ar: "الشهادات"
  },
  phoneModel: {
    en: "Phone Model",
    ar: "موديل الهاتف"
  },
  phoneSN: {
    en: "Phone S/N",
    ar: "الرقم التسلسلي للهاتف"
  },
  notes: {
    en: "Notes",
    ar: "ملاحظات"
  },
  
  // Settings
  language: {
    en: "Language",
    ar: "اللغة"
  },
  english: {
    en: "English",
    ar: "الإنجليزية"
  },
  arabic: {
    en: "Arabic",
    ar: "العربية"
  },
  theme: {
    en: "Theme",
    ar: "المظهر"
  },
  light: {
    en: "Light",
    ar: "فاتح"
  },
  dark: {
    en: "Dark",
    ar: "داكن"
  },
  notifications: {
    en: "Notifications",
    ar: "الإشعارات"
  },
  securitySettings: {
    en: "Security Settings",
    ar: "إعدادات الأمان"
  },
  accountSettings: {
    en: "Account Settings",
    ar: "إعدادات الحساب"
  },
  changePassword: {
    en: "Change Password",
    ar: "تغيير كلمة المرور"
  },
  currentPassword: {
    en: "Current Password",
    ar: "كلمة المرور الحالية"
  },
  newPassword: {
    en: "New Password",
    ar: "كلمة المرور الجديدة"
  },
  confirmNewPassword: {
    en: "Confirm New Password",
    ar: "تأكيد كلمة المرور الجديدة"
  },
  passwordChanged: {
    en: "Password Changed Successfully",
    ar: "تم تغيير كلمة المرور بنجاح"
  },
  
  // Common actions/messages
  loading: {
    en: "Loading...",
    ar: "جاري التحميل..."
  },
  error: {
    en: "Error",
    ar: "خطأ"
  },
  success: {
    en: "Success",
    ar: "نجاح"
  },
  confirm: {
    en: "Confirm",
    ar: "تأكيد"
  },
  back: {
    en: "Back",
    ar: "رجوع"
  },
  next: {
    en: "Next",
    ar: "التالي"
  },
  submit: {
    en: "Submit",
    ar: "إرسال"
  },
  search: {
    en: "Search",
    ar: "بحث"
  },
  filter: {
    en: "Filter",
    ar: "تصفية"
  },
  sort: {
    en: "Sort",
    ar: "ترتيب"
  },
  view: {
    en: "View",
    ar: "عرض"
  },
  edit: {
    en: "Edit",
    ar: "تعديل"
  },
  renew: {
    en: "Renew",
    ar: "تجديد"
  },
  add: {
    en: "Add",
    ar: "إضافة"
  },
  update: {
    en: "Update",
    ar: "تحديث"
  },
  create: {
    en: "Create",
    ar: "إنشاء"
  },
  noResults: {
    en: "No results found",
    ar: "لم يتم العثور على نتائج"
  },
  noData: {
    en: "No data available",
    ar: "لا توجد بيانات متاحة"
  },
  allRightsReserved: {
    en: "© 2025 Pegasus Tool. All rights reserved.",
    ar: "© 2025 أداة بيغاسوس. جميع الحقوق محفوظة."
  },
  pegasusTool: {
    en: "Pegasus Tool",
    ar: "أداة بيغاسوس"
  },
  sessionExpired: {
    en: "Session Expired",
    ar: "انتهت صلاحية الجلسة"
  },
  pleaseLoginAgain: {
    en: "Please login again",
    ar: "يرجى تسجيل الدخول مجددًا"
  },
  logoutSuccess: {
    en: "Logged out successfully",
    ar: "تم تسجيل الخروج بنجاح"
  },
  logoutFailed: {
    en: "Failed to logout",
    ar: "فشل تسجيل الخروج"
  },
  comeBackSoon: {
    en: "Come back soon!",
    ar: "عد قريبًا!"
  },
  loggedOutInAnotherTab: {
    en: "Logged out in another tab",
    ar: "تم تسجيل الخروج في نافذة أخرى"
  },
  sessionEnded: {
    en: "Your session has ended",
    ar: "انتهت جلستك"
  },
  unexpectedError: {
    en: "An unexpected error occurred",
    ar: "حدث خطأ غير متوقع"
  },
  accessDenied: {
    en: "Access Denied",
    ar: "تم رفض الوصول"
  },
  noPermission: {
    en: "You don't have permission to access this page",
    ar: "ليس لديك إذن للوصول إلى هذه الصفحة"
  },
  logout: {
    en: "Logout",
    ar: "تسجيل الخروج"
  },

  // Discounts
  addNewDiscount: {
    en: "Add New Discount",
    ar: "إضافة خصم جديد"
  },
  discountDetails: {
    en: "Discount Details",
    ar: "تفاصيل الخصم"
  },
  userEmail: {
    en: "User Email",
    ar: "بريد المستخدم"
  },
  refundAmount: {
    en: "Refund Amount",
    ar: "مبلغ الاسترداد"
  },
  numberOfDiscounts: {
    en: "Number of Discounts",
    ar: "عدد الخصومات"
  },
  discountCreated: {
    en: "Discount Created",
    ar: "تم إنشاء الخصم"
  },
  discountUpdated: {
    en: "Discount Updated",
    ar: "تم تحديث الخصم"
  },
  discountDeleted: {
    en: "Discount Deleted",
    ar: "تم حذف الخصم"
  },
  searchDiscounts: {
    en: "Search discounts...",
    ar: "بحث الخصومات..."
  },
  
  // Groups Management
  addNewGroup: {
    en: "Add New Group",
    ar: "إضافة مجموعة جديدة"
  },
  groupDetails: {
    en: "Group Details",
    ar: "تفاصيل المجموعة"
  },
  groupKey: {
    en: "Group Key",
    ar: "مفتاح المجموعة"
  },
  groupValue: {
    en: "Group Value",
    ar: "قيمة المجموعة"
  },
  groupCreated: {
    en: "Group Created",
    ar: "تم إنشاء المجموعة"
  },
  groupUpdated: {
    en: "Group Updated",
    ar: "تم تحديث المجموعة"
  },
  groupDeleted: {
    en: "Group Deleted",
    ar: "تم حذف المجموعة"
  },
  searchGroups: {
    en: "Search groups...",
    ar: "بحث المجموعات..."
  },
  
  // Tool Update page
  updateTool: {
    en: "Update Tool",
    ar: "تحديث الأداة"
  },
  directDownload: {
    en: "Direct Download",
    ar: "التنزيل المباشر"
  },
  link: {
    en: "Link",
    ar: "الرابط"
  },
  changeLog: {
    en: "Changelog",
    ar: "سجل التغييرات"
  },
  verizon: {
    en: "Version",
    ar: "الإصدار"
  },
  updateLogs: {
    en: "Update Logs",
    ar: "سجلات التحديث"
  },
  saveUpdate: {
    en: "Save Update",
    ar: "حفظ التحديث"
  },
  updateSaved: {
    en: "Update Saved",
    ar: "تم حفظ التحديث"
  },
  
  // Add missing translations
  improvements: {
    en: "Improvements",
    ar: "التحسينات"
  },
  fixBugs: {
    en: "Fix Bugs",
    ar: "إصلاح الأخطاء"
  },
  
  // Add missing chat translations
  chatSupport: {
    en: "Chat Support",
    ar: "الدعم عبر المحادثة"
  },
  chatWithUser: {
    en: "Chat with User",
    ar: "محادثة مع المستخدم"
  },
  chatWithSupport: {
    en: "Chat with Support",
    ar: "محادثة مع الدعم"
  },
  typeMessage: {
    en: "Type a message...",
    ar: "اكتب رسالة..."
  },
  loginRequired: {
    en: "Please log in to use chat support",
    ar: "يرجى تسجيل الدخول لاستخدام الدعم عبر المحادثة"
  },
  noMessagesYet: {
    en: "No messages yet with this user",
    ar: "لا توجد رسائل بعد مع هذا المستخدم"
  },
  startConversation: {
    en: "Start a conversation with our support team",
    ar: "ابدأ محادثة مع فريق الدعم لدينا"
  },
  conversations: {
    en: "Conversations",
    ar: "المحادثات"
  },
  noSearchResults: {
    en: "No users match your search",
    ar: "لا يوجد مستخدمين مطابقين لبحثك"
  },
  noConversations: {
    en: "No conversations yet",
    ar: "لا توجد محادثات بعد"
  },
  selectConversation: {
    en: "Select a Conversation",
    ar: "اختر محادثة"
  },
  selectUserDescription: {
    en: "Choose a user from the list to view and respond to their messages.",
    ar: "اختر مستخدمًا من القائمة لعرض والرد على رسائله."
  },
  messageSent: {
    en: "Message sent",
    ar: "تم إرسال الرسالة"
  },
  errorSendingMessage: {
    en: "Error sending message",
    ar: "خطأ في إرسال ال��سالة"
  },
  loading: {
    en: "Loading...",
    ar: "جاري التحميل..."
  }
};

// Provider component
export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<"en" | "ar">(defaultLanguage as "en" | "ar");

  const t = (key: string): string => {
    const translationObj = translations[key as keyof typeof translations];
    
    if (translationObj) {
      return translationObj[language] || key;
    }
    
    return key;
  };

  const isRTL = language === "ar";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  
  return context;
};
