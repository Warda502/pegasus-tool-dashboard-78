import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define supported languages
export type Language = 'en' | 'ar';

// Define the translation interface
export interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}
// Context interface
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translations: Translations;
  isRTL: boolean;
}

// Create translations
export const translations: Translations = {
  dashboard: {
    en: "Dashboard",
    ar: "الرئيسية"
  },
  dataLoadError: {
    en: "Error Loading Data",
    ar: "فشل عرض البيانات"
  },
  dashboardDataError: {
    en: "Failed To Load Dashboard Data. Please Wait...",
    ar: "فشل تحميل بيانات لوحة المعلومات. يُرجى الانتظار..."
  },
  operations: {
    en: "Operations",
    ar: "العمليات"
  },
  refundedOperations: {
    en: "Refunded Operations",
    ar: "العمليات المستردة"
  },
  expiryTime: {
    en: "Expiry Time",
    ar: "تاريخ الانتهاء"
  },
  myCredits: {
    en: "My Credits",
    ar: "رصيدي"
  },
  users: {
    en: "Users Manager",
    ar: "إدارة المستخدمين"
  },
  settings: {
    en: "Settings",
    ar: "الإعدادات"
  },
  search: {
    en: "Search...",
    ar: "بحث..."
  },
  filter: {
    en: "Filter",
    ar: "تصفية"
  },
  successfulOperations: {
    en: "Successful Operations",
    ar: "العمليات الناجحة"
  },
  failedOperations: {
    en: "Failed Operations",
    ar: "العمليات الفاشلة"
  },
  loading: {
    en: "Loading Data...",
    ar: "جاري تحميل البيانات..."
  },
  noData: {
    en: "No Operations Found",
    ar: "لا توجد عمليات مسجلة"
  },
  export: {
    en: "Export Data",
    ar: "تصدير البيانات"
  },
  refresh: {
    en: "Refresh Data",
    ar: "تحديث البيانات"
  },
  exported: {
    en: "Exported",
    ar: "تم التصدير"
  },
  exportSuccess: {
    en: "Data Exported Successfully",
    ar: "تم تصدير البيانات بنجاح"
  },
  operationID: {
    en: "ID",
    ar: "رقم العملية"
  },
  operationType: {
    en: "Operation Type",
    ar: "نوع العملية"
  },
  serialNumber: {
    en: "Serial Number",
    ar: "الرقم التسلسلي"
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
  user: {
    en: "User",
    ar: "المستخدم"
  },
  credit: {
    en: "Credit",
    ar: "الرصيد"
  },
  time: {
    en: "Time",
    ar: "الوقت"
  },
  status: {
    en: "Status",
    ar: "الحالة"
  },
  android: {
    en: "Android",
    ar: "أندرويد"
  },
  baseband: {
    en: "Baseband",
    ar: "الباسباند"
  },
  carrier: {
    en: "Carrier",
    ar: "المشغل"
  },
  notes: {
    en: "Notes",
    ar: "ملاحضة"
  },
  securityPatch: {
    en: "Security Patch",
    ar: "تحديث الأمان"
  },
  uid: {
    en: "UID",
    ar: "UID"
  },
  hwid: {
    en: "HWID",
    ar: "HWID"
  },
  actions: {
    en: "Actions",
    ar: "الإجراءات"
  },
  details: {
    en: "Details",
    ar: "التفاصيل"
  },
  refund: {
    en: "Refund",
    ar: "استرداد"
  },
  operationsManagement: {
    en: "View And Manage System Operations",
    ar: "عرض وإدارة العمليات المس��لة في النظام"
  },
  totalOperations: {
    en: "Total Operations",
    ar: "إجمالي العمليات"
  },
  refundSuccess: {
    en: "Refund Completed",
    ar: "تم الاسترداد"
  },
  refundDescription: {
    en: "Credit Has Been Refunded Successfully",
    ar: "تم استرداد الرصيد بنجاح"
  },
  addUser: {
    en: "Add User",
    ar: "إضافة مستخدم جديد"
  },
  addCredit: {
    en: "Add Credit",
    ar: "إضافة رصيد"
  },
  viewDetails: {
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
  delete: {
    en: "Delete",
    ar: "حذف"
  },
  usersTitle: {
    en: "Users List",
    ar: "قائمة المستخدمين"
  },
  usersDescription: {
    en: "Manage All System Users From Here",
    ar: "يمكنك إدارة جميع المستخدمين من هنا"
  },
  searchUsers: {
    en: "Search For Users...",
    ar: "بحث عن مستخدم..."
  },
  email: {
    en: "Email",
    ar: "البريد الإلكتروني"
  },
  userType: {
    en: "User Type",
    ar: "نوع المستخدم"
  },
  country: {
    en: "Country",
    ar: "الدولة"
  },
  startDate: {
    en: "Start Date",
    ar: "تاريخ البداية"
  },
  expiryDate: {
    en: "Expiry Date",
    ar: "تاريخ الانتهاء"
  },
  noUsers: {
    en: "No users match your search",
    ar: "لا يوجد مستخدمين مطابقين لبحثك"
  },
  operationDetails: {
    en: "Operation Details",
    ar: "تفاصيل العملية"
  },
  close: {
    en: "Close",
    ar: "إغلاق"
  },
  home: {
    en: "Home",
    ar: "الرئيسية"
  },
  logout: {
    en: "Logout",
    ar: "تسجيل الخروج"
  },
  welcome: {
    en: "Welcome",
    ar: "مرحبًا"
  },
  userManagement: {
    en: "User Management",
    ar: "إدارة المستخدمين"
  },
  allRightsReserved: {
    en: "© 2025 Pegasus Tool - All Rights Reserved",
    ar: "© 2025 بيجاسوس تول - جميع الحقوق محفوظة"
  },
  pegasusTool: {
    en: "Pegasus Tool",
    ar: "بيجاسوس تول"
  },
  updateSuccess: {
    en: "Updated",
    ar: "تم التحديث"
  },
  updateUserSuccess: {
    en: "User information updated successfully",
    ar: "تم تحديث بيانات المستخدم بنجاح"
  },
  deleteSuccess: {
    en: "Deleted",
    ar: "تم الحذف"
  },
  deleteUserSuccess: {
    en: "User Deleted Successfully",
    ar: "تم حذف المستخدم بنجاح"
  },
  addSuccess: {
    en: "Added",
    ar: "تمت الإضافة"
  },
  addUserSuccess: {
    en: "User added successfully",
    ar: "تم إضافة المستخدم بنجاح"
  },
  renewSuccess: {
    en: "Renewed",
    ar: "تم التجديد"
  },
  renewUserSuccess: {
    en: "User account renewed successfully",
    ar: "تم تجديد حساب المستخدم بنجاح"
  },
  addCreditSuccess: {
    en: "Credit Added",
    ar: "تمت إضافة الرصيد"
  },
  addCreditDescription: {
    en: "Credit Added Successfully",
    ar: "تم إضافة الرصيد بنجاح"
  },
  selectUser: {
    en: "Select User",
    ar: "اختر مستخدم"
  },
  creditAmount: {
    en: "Credit Amount",
    ar: "قيمة الرصيد"
  },
  creditExplanation: {
    en: "The amount will be added with the .0 identifier",
    ar: "سيتم إضافة المبلغ مع علامة .0"
  },
  cancel: {
    en: "Cancel",
    ar: "إلغاء"
  },
  add: {
    en: "Add",
    ar: "إضافة"
  },
  adding: {
    en: "Adding...",
    ar: "جاري الإضافة..."
  },
  current: {
    en: "Current",
    ar: "الحالي"
  },
  fetchSuccessTitle: {
    en: "Data Loaded",
    ar: "تم تحميل البيانات"
  },
  fetchSuccessDescription: {
    en: "Data loaded successfully",
    ar: "تم جلب البيانات بنجاح"
  },
  login: {
    en: "Login",
    ar: "تسجيل الدخول"
  },
  password: {
    en: "Password",
    ar: "كلمة المرور"
  },
  loggingIn: {
    en: "Logging in...",
    ar: "جاري تسجيل الدخول..."
  },
  noAccount: {
    en: "Don't have an account?",
    ar: "ليس لديك حساب؟"
  },
  createAccount: {
    en: "Create a new account",
    ar: "إنشاء حساب جديد"
  },
  welcomeMessage: {
    en: "Welcome to User Management System",
    ar: "مرحباً بك في نظام إدارة المستخدمين"
  },
  systemDescription: {
    en: "An integrated system for managing users and tracking activities with an easy-to-use interface",
    ar: "نظام متكامل لإدارة المستخدمين وتتبع أنشطتهم بواجهة سهلة الاستخدام"
  },
  loginSuccess: {
    en: "Login Successful",
    ar: "تم تسجيل الدخول بنجاح"
  },
  loadingData: {
    en: "Loading Data...",
    ar: "جاري الآن جلب البيانات..."
  },
  loadingDashboard: {
    en: "Loading Dashboard...",
    ar: "جاري جلب البيانات الى لوحة التحكم..."
  },
  error: {
    en: "Error",
    ar: "خطأ"
  },
  unexpectedError: {
    en: "Unexpected error",
    ar: "حدث خطأ غير متوقع"
  },
  loginError: {
    en: "Login Error",
    ar: "حدث خطأ في تسجيل الدخول"
  },
  logoutSuccess: {
    en: "Successfully Logged Out",
    ar: "تم تسجيل الخروج بنجاح"
  },
  userDetails: {
    en: "User Details",
    ar: "تفاصيل المستخدم"
  },
  completeUserInfo: {
    en: "Complete User Information",
    ar: "معلومات كاملة عن المستخدم"
  },
  name: {
    en: "Name",
    ar: "الاسم"
  },
  phone: {
    en: "Phone Number",
    ar: "رقم الهاتف"
  },
  activation: {
    en: "Activation",
    ar: "التفعيل"
  },
  renewUser: {
    en: "Renew User Account",
    ar: "تجديد حساب المستخدم"
  },
  chooseRenewalMonths: {
    en: "Choose the number of months to renew the account",
    ar: "اختر عدد الأشهر التي تود تجديد الحساب بها"
  },
  numberOfMonths: {
    en: "Number of Months",
    ar: "عدد الأشهر"
  },
  selectMonths: {
    en: "Select months",
    ar: "اختر عدد الأشهر"
  },
  threeMonths: {
    en: "3 Months",
    ar: "3 أشهر"
  },
  sixMonths: {
    en: "6 Months",
    ar: "6 أشهر"
  },
  nineMonths: {
    en: "9 Months",
    ar: "9 أشهر"
  },
  twelveMonths: {
    en: "12 Months",
    ar: "12 أشهر"
  },
  editUser: {
    en: "Edit User",
    ar: "تعديل المستخدم"
  },
  editUserDescription: {
    en: "Edit user information",
    ar: "قم بتعديل بيانات المستخدم"
  },
  activate: {
    en: "Activate",
    ar: "تفعيل"
  },
  block: {
    en: "Block",
    ar: "حظر"
  },
  saveChanges: {
    en: "Save Changes",
    ar: "حفظ التغييرات"
  },
  updateUserError: {
    en: "Failed to update user data",
    ar: "فشل في حفظ بيانات المستخدم"
  },
  addNewUser: {
    en: "Add New User",
    ar: "إضافة مستخدم جديد"
  },
  enterNewUserData: {
    en: "Enter new user information",
    ar: "أدخل بيانات المستخدم الجديد"
  },
  selectUserType: {
    en: "Select user type",
    ar: "اختر نوع المستخدم"
  },
  creditsLicense: {
    en: "Credits License",
    ar: "رخصة رصيد"
  },
  monthlyLicense: {
    en: "Monthly License",
    ar: "رخص�� شهرية"
  },
  subscriptionPeriod: {
    en: "Subscription Period",
    ar: "مدة الاشتراك"
  },
  selectSubscriptionPeriod: {
    en: "Select subscription period",
    ar: "اختر مدة الاشتراك"
  },
  selectCountry: {
    en: "Select country",
    ar: "اختر الدولة"
  },
  addUserError: {
    en: "Failed to add user",
    ar: "فشل في إضافة المستخدم"
  },
  dashboardTitle: {
    en: "Dashboard",
    ar: "لوحة التحكم"
  },
  dashboardDescription: {
    en: "Overview of system activity",
    ar: "نظرة عامة على نشاط النظام"
  },
  totalUsers: {
    en: "Total Users",
    ar: "إجمالي المستخدمين"
  },
  activeUsers: {
    en: "Active Users",
    ar: "المستخدمين النشطين"
  },
  blockedUsers: {
    en: "Blocked Users",
    ar: "المستخدمين المحظورين"
  },
  settingsTitle: {
    en: "Settings",
    ar: "الإعدادات"
  },
  settingsDescription: {
    en: "Manage your system settings",
    ar: "إدارة إعدادات النظام"
  },
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
    ar: "السمة"
  },
  light: {
    en: "Light",
    ar: "فاتح"
  },
  dark: {
    en: "Dark",
    ar: "داكن"
  },
  system: {
    en: "System",
    ar: "النظام"
  },
  editProfile: {
    en: "Edit Profile",
    ar: "تعديل الملف الشخصي"
  },
  profileUpdated: {
    en: "Profile updated successfully",
    ar: "تم تحديث الملف الشخصي بنجاح"
  },
  errorUpdatingProfile: {
    en: "Error updating profile",
    ar: "خطأ في تحديث الملف الشخصي"
  },
  errorFetchingProfile: {
    en: "Error fetching profile data",
    ar: "خطأ في جلب بيانات الملف الشخصي"
  },
  saving: {
    en: "Saving...",
    ar: "جاري الحفظ..."
  },
  success: {
    en: "Success",
    ar: "تم بنجاح"
  },
  welcomeBack: {
    en: "Welcome Back!",
    ar: "مرحباً بعودتك!"
  },
  sending: {
    en: "Sending...",
    ar: "جاري الإرسال..."
  },
  verifying: {
    en: "Verifying...",
    ar: "جاري التحقق..."
  },
  updating: {
    en: "Updating...",
    ar: "جاري التحديث..."
  },
  jan: {
    en: "Jan",
    ar: "يناير"
  },
  feb: {
    en: "Feb",
    ar: "فبراير"
  },
  mar: {
    en: "Mar",
    ar: "مارس"
  },
  apr: {
    en: "Apr",
    ar: "أبريل"
  },
  may: {
    en: "May",
    ar: "مايو"
  },
  jun: {
    en: "Jun",
    ar: "يونيو"
  },
  jul: {
    en: "Jul",
    ar: "يوليو"
  },
  aug: {
    en: "Aug",
    ar: "أغسطس"
  },
  sep: {
    en: "Sep",
    ar: "سبتمبر"
  },
  oct: {
    en: "Oct",
    ar: "أكتوبر"
  },
  nov: {
    en: "Nov",
    ar: "نوفمبر"
  },
  dec: {
    en: "Dec",
    ar: "ديسمبر"
  },
  serverStorage: {
    en: "Server Storage",
    ar: "تخزين الخادم"
  },
  manageServerFiles: {
    en: "Manage And Organize Server Files And Folders",
    ar: "إدارة وتنظيم ملفات ومجلدات الخادم"
  },
  uploadFile: {
    en: "Upload File",
    ar: "رفع ملف"
  },
  newFolder: {
    en: "New Folder",
    ar: "مجلد جديد"
  },
  enterFolderName: {
    en: "Enter folder name",
    ar: "أدخل اسم المجلد"
  },
  upOneLevel: {
    en: "Up one level",
    ar: "مستوى واحد للأعلى"
  },
  totalFiles: {
    en: "Total Files",
    ar: "إجمالي الملفات"
  },
  fileDownloadedSuccessfully: {
    en: "File downloaded successfully",
    ar: "تم تحميل الملف بنجاح"
  },
  failedToDownloadFile: {
    en: "Failed to download file",
    ar: "فشل في تحميل الملف"
  },
  serverApiData: {
    en: "Server API Data",
    ar: "بيانات API الخادم"
  },
  viewServerData: {
    en: "View And Manage Server API Data",
    ar: "عرض وإدارة بيانات API الخادم"
  },
  totalMyCertFiles: {
    en: "Total My CertFiles",
    ar: "اجمالي ملفات الشهادات الخاصة بي"
  },
  myCertFiles: {
    en: "My CertFiles",
    ar: "ملفات الشهادات الخاصة بي"
  },
  viewCertFiles: {
    en: "View And Manage Your Cert Fles",
    ar: "عرض وإدارة بيانات API الخادم"
  },
  totalRecords: {
    en: "Total Records",
    ar: "إجمالي السجلات"
  },
  exportData: {
    en: "Export Data",
    ar: "تصدير البيانات"
  },
  showingResults: {
    en: "Showing",
    ar: "عرض"
  },
  of: {
    en: "Of",
    ar: "من"
  },
  phoneSn: {
    en: "Phone S/N",
    ar: "الرقم التسلسلي"
  },
  changeHwid: {
    en: "Change HWID",
    ar: "تغيير HWID"
  },
  confirmHwidReset: {
    en: "Confirm HWID Reset",
    ar: "تأكيد إعادة تعيين HWID"
  },
  hwidResetWarning: {
    en: "Are you sure you want to reset your HWID? This action cannot be undone.",
    ar: "هل أنت متأكد من إعادة تعيين HWID؟ لا يمكن التراجع عن هذا الإجراء."
  },
  hwidReset: {
    en: "HWID has been reset successfully",
    ar: "تم إعادة تعيين HWID بنجاح"
  },
  errorResettingHwid: {
    en: "Error resetting HWID",
    ar: "خطأ في إعادة تعيين HWID"
  },
  accountBlocked: {
    en: "Account Blocked",
    ar: "الحساب محظور"
  },
  accountBlockedDescription: {
    en: "Your account has been blocked. Please contact admin for assistance.",
    ar: "تم حظر حسابك. يرجى الاتصال بالمسؤول للحصول على المساعدة."
  },
  noCreditsLeftDescription: {
    en: "You don't have any credits left. Please contact admin to add credits.",
    ar: "ليس لديك أي رصيد متبقي. يرجى الاتصال بالمسؤول لإضافة رصيد."
  },
  checkingSession: {
    en: "Checking Session...",
    ar: "جاري التحقق من حالة الجلسة..."
  },
  sessionExpired: {
    en: "Session Expired",
    ar: "انتهت صلاحية الجلسة"
  },
  pleaseLoginAgain: {
    en: "Please Login Again",
    ar: "يرجى تسجيل الدخول مجددًا"
  },
  loginFailed: {
    en: "Login Failed",
    ar: "فشل تسجيل الدخول"
  },
  comeBackSoon: {
    en: "Come Back Soon!",
    ar: "نراك قريبًا!"
  },
  logoutFailed: {
    en: "Logout Failed",
    ar: "فشل تسجيل الخروج"
  },
  platformMonthlyActivity: {
    en: "Platform Monthly Activity",
    ar: "نشاط المنصة الشهري"
  },
  monthlyOperationsChart: {
    en: "Monthly Operations",
    ar: "العمليات الشهرية"
  },
  operationsByType: {
    en: "Operations by Type",
    ar: "العمليات حسب النوع"
  },
  platformOperationTypes: {
    en: "Platform Operation Types",
    ar: "أنواع عمليات المنصة"
  },
  lastSixMonths: {
    en: "Operations over the last 6 months",
    ar: "العمليات خلال الستة أشهر الماضية"
  },
  operationTypeDistribution: {
    en: "Distribution of operations by type",
    ar: "توزيع العمليات حسب النوع"
  },
  operationTypeBreakdown: {
    en: "Breakdown of all operations by type",
    ar: "تفصيل جميع العمليات حسب النوع"
  },
  guest: {
    en: "Guest",
    ar: "زائر"
  },
  discounts: {
    en: "Discounts",
    ar: "الخصومات"
  },
  manageDiscounts: {
    en: "Manage user discounts",
    ar: "إدارة خصومات المستخدمين"
  },
  addNewDiscount: {
    en: "Add New Discount",
    ar: "إضافة خصم جديد"
  },
  searchDiscounts: {
    en: "Search discounts...",
    ar: "بحث عن خصومات..."
  },
  discountAddedSuccess: {
    en: "Discount added successfully",
    ar: "تم إضافة الخصم بنجاح"
  },
  errorAddingDiscount: {
    en: "Error adding discount",
    ar: "خطأ في إضافة الخصم"
  },
  fillAllFields: {
    en: "Please fill all fields",
    ar: "يرجى ملء جميع الحقول"
  },
  countRefund: {
    en: "Refund Amount",
    ar: "مبلغ الاسترداد"
  },
  numberDiscounts: {
    en: "Number of Discounts",
    ar: "عدد الخصومات"
  },
  refundAmountExplanation: {
    en: "Amount to refund for each operation",
    ar: "المبلغ المسترد لكل عملية"
  },
  discountTimesExplanation: {
    en: "How many times the discount can be applied",
    ar: "كم مرة يمكن تطبيق الخصم"
  },
  groupsManagement: {
    en: "Groups Management",
    ar: "إدارة المجموعات"
  },
  manageGroupValues: {
    en: "Manage group values",
    ar: "إدارة قيم المجموعات"
  },
  addNewValue: {
    en: "Add New Value",
    ar: "إضافة قيمة جديدة"
  },
  searchGroups: {
    en: "Search groups...",
    ar: "بحث عن مجموعات..."
  },
  key: {
    en: "Key",
    ar: "المفتاح"
  },
  value: {
    en: "Value",
    ar: "القيمة"
  },
  valueOptional: {
    en: "Value is optional",
    ar: "القيمة اختيارية"
  },
  keyRequired: {
    en: "Key is required",
    ar: "المفتاح مطلوب"
  },
  groupValueAddedSuccess: {
    en: "Group value added successfully",
    ar: "تم إضافة قيمة المجموعة بنجاح"
  },
  errorAddingGroupValue: {
    en: "Error adding group value",
    ar: "خطأ في إضافة قيمة المجموعة"
  },
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
    ar: "خطأ في إرسال الرسالة"
  },
  // For Settings tool
  toolUpdate: {
    en: "Tool Update",
    ar: "تحديث الاداة"
  },
  toolSettings: {
    en: "Tool Settings",
    ar: "اعدادات الاداة"
  },
  buttons: {
    en: "Buttons",
    ar: "الازرار"
  },
  settingsSwitch: {
    en: "Settings Switch",
    ar: "اعدادات التبديل"
  },
  addNewObject: {
    en: "Add New Object",
    ar: "اضافة كأن جديد"
  },
  addNewSetting: {
    en: "Add New Object",
    ar: "اضافة كأن جديد"
  },
  objectType: {
    en: "Object Type",
    ar: "نوع الكأن"
  },
  title: {
    en: "Title",
    ar: "الاسم"
  },
  enterKey: {
    en: "Enter Key",
    ar: "ادخل المفتاح"
  },
  enterTitle: {
    en: "Enter Title",
    ar: "ادخل الاسم"
  },
  save: {
    en: "Save",
    ar: "حفظ"
  },
  allFieldsRequired: {
    en: "All fields are required",
    ar: "جميع الحقول مطلوبة"
  },
  noSettingsFound: {
    en: "No settings found",
    ar: "لم يتم العثور على الإعدادات"
  },
  settingAddedSuccessfully: {
    en: "Setting added successfully",
    ar: "تمت إضافة الإعداد بنجاح"
  },
  settingsUpdatedSuccessfully: {
    en: "Settings updated successfully",
    ar: "تم تحديث الإعدادات بنجاح"
  },
  pleaseRefreshPage: {
    en: "Please try refreshing the page.",
    ar: "من فضلك حاول تحديث الصفحة."
  },
  manageToolSettings: {
    en: "Manage tool settings and configurations",
    ar: "إدارة إعدادات الأداة وتكويناتها"
  },
  insertedAt: {
    en: "Inserted At",
    ar: "تم إدراجه في"
  },
  refundAmount: {
    en: "Refund Amount",
    ar: "مبلغ الاسترداد"
  },
  remainingDiscounts: {
    en: "Remaining Discounts",
    ar: "الخصومات المتبقية"
  },
  confirmDelete: {
    en: "Confirm Delete",
    ar: "تأكيد الحذف"
  },
  deleteDiscountConfirmation: {
    en: "Are you sure you want to delete this discount? This action cannot be undone.",
    ar: "هل أنت متأكد من رغبتك في حذف هذا الخصم؟ لا يمكن التراجع عن هذا الإجراء."
  },
  deleting: {
    en: "Deleting...",
    ar: "جاري الحذف..."
  },
  notifications: {
    en: "Notifications",
    ar: "الإشعارات"
  },
  sound: {
    en: "Sound",
    ar: "الصوت"
  },
  darkMode: {
    en: "Dark Mode",
    ar: "الوضع المظلم"
  },
  "fetchError": {
    "en": "Error fetching data",
    "ar": "خطأ في جلب البيانات"
  },
  "addError": {
    "en": "Failed To Add",
    "ar": "فشل في الإضافة"
  },
  "updateError": {
    "en": "Failed To Update",
    "ar": "فشل في التحديث"
  },
  "deleteError": {
    "en": "Failed To Delete",
    "ar": "فشل في الحذف"
  },
  "validationError": {
    "en": "Validation Error",
    "ar": "خطأ في التحقق من الصحة"
  },
  "nameAndPriceRequired": {
    "en": "Plan name and price are required",
    "ar": "اسم الخطة والسعر مطلوبان"
  },
  "pricingManagement": {
    "en": "Pricing Management",
    "ar": "إدارة التسعير"
  },
  "pricingDescription": {
    "en": "Take a look of our Pricing and select Your Choice",
    "ar": "اطلع على خطط التسعير واختر ما يناسبك"
  },
  "noPricingPlans": {
    "en": "No pricing plans defined yet",
    "ar": "لم يتم تعريف أي خطط تسعير بعد"
  },
  "addNewPlan": {
    "en": "Add New Plan",
    "ar": "إضافة خطة جديدة"
  },
  "addPricingPlan": {
    "en": "Add Pricing Plan",
    "ar": "إضافة خطة تسعير"
  },
  "planName": {
    "en": "Plan Name",
    "ar": "اسم الخطة"
  },
  "price": {
    "en": "Price",
    "ar": "السعر"
  },
  "features": {
    "en": "Features",
    "ar": "المميزات"
  },
  "featuresHelp": {
    "en": "Add each feature on a new line",
    "ar": "أضف كل ميزة في سطر جديد"
  },
  "perks": {
    "en": "Additional Perks",
    "ar": "امتيازات إضافية"
  },
  "editPricingPlan": {
    "en": "Edit Pricing Plan",
    "ar": "تعديل خطة التسعير"
  },
  "confirmDeletePlan": {
    "en": "Are you sure you want to delete this plan?",
    "ar": "هل أنت متأكد أنك تريد حذف هذه الخطة؟"
  },
  "brandAndModelRequired": {
    "en": "Brand and model are required",
    "ar": "العلامة التجارية والطراز مطلوبان"
  },
  "pleaseEnterJsonData": {
    "en": "Please enter JSON data to upload",
    "ar": "يرجى إدخال بيانات JSON للتحميل"
  },
  "dataMustBeArray": {
    "en": "Data must be an array of objects",
    "ar": "يجب أن تكون البيانات عبارة عن مصفوفة من الكائنات"
  },
  "noValidModelsFound": {
    "en": "No valid models found in the data",
    "ar": "لم يتم العثور على طرازات صالحة في البيانات"
  },
  "pleaseCheckFormat": {
    "en": "Please check the format of your JSON data",
    "ar": "يرجى التحقق من تنسيق بيانات JSON الخاصة بك"
  },
  "supportedModels": {
    "en": "Supported Models",
    "ar": "الطرازات المدعومة"
  },
  "supportedModelsDescription": {
    "en": "Manage supported device models",
    "ar": "إدارة الطرازات المدعومة للأجهزة"
  },
  "uploadModels": {
    "en": "Upload Models",
    "ar": "تحميل الطرازات"
  },
  "filterByBrand": {
    "en": "Filter by brand...",
    "ar": "تصفية حسب العلامة التجارية..."
  },
  "filterByModel": {
    "en": "Filter by model...",
    "ar": "تصفية حسب الطراز..."
  },
  "operation": {
    "en": "Operation",
    "ar": "العملية"
  },
  "security": {
    "en": "Security",
    "ar": "الأمان"
  },
  "noModelsFound": {
    "en": "No models matching your filter",
    "ar": "لم يتم العثور على طرازات مطابقة للفلتر"
  },
  "noModels": {
    "en": "No models available",
    "ar": "لا توجد طرازات متاحة"
  },
  "uploadInstructions": {
    "en": "Paste JSON data below to import models.",
    "ar": "الصق بيانات JSON أدناه لاستيراد الطرازات."
  },
  "editModel": {
    "en": "Edit Model",
    "ar": "تعديل الطراز"
  },
  "confirmDeleteModel": {
    "en": "Are you sure you want to delete this model?",
    "ar": "هل أنت متأكد أنك تريد حذف هذا الطراز؟"
  },
    "pricing": {
    "en": "Pricing",
    "ar": "التسعير"
  },
    "webSettings": {
    "en": "Web Settings",
    "ar": "إعدادات الويب"
  },
    "failedToCheckStatus": {
    "en": "Failed to check 2FA status",
    "ar": "فشل التحقق من حالة المصادقة الثنائية"
  },
  "twoFactorSetupError": {
    "en": "An error occurred during two-factor authentication setup. Please try again.",
    "ar": "حدث خطأ أثناء إعداد المصادقة الثنائية. يرجى المحاولة مرة أخرى."
  },
  "qrCodeSaved": {
    "en": "QR code saved successfully",
    "ar": "تم حفظ رمز الاستجابة السريعة (QR) بنجاح"
  },
  "qrCodeSaveError": {
    "en": "Failed to save QR code",
    "ar": "فشل في حفظ رمز الاستجابة السريعة (QR)"
  },
  "invalidVerificationCode": {
    "en": "Please enter a valid 6-digit verification code",
    "ar": "يرجى إدخال رمز تحقق مكوّن من 6 أرقام صحيح"
  },
  "twoFactorEnabled": {
    "en": "Two-factor authentication enabled successfully",
    "ar": "تم تفعيل المصادقة الثنائية بنجاح"
  },
  "verificationError": {
    "en": "Verification failed. Please try again.",
    "ar": "فشل التحقق. يرجى المحاولة مرة أخرى."
  },
  "twoFactorDisabled": {
    "en": "Two-factor authentication disabled",
    "ar": "تم تعطيل المصادقة الثنائية"
  },
  "disableError": {
    "en": "Failed to disable two-factor authentication",
    "ar": "فشل تعطيل المصادقة الثنائية"
  },
  "twoFactorDescription": {
    "en": "Enable two-factor authentication to add an extra layer of security to your account.",
    "ar": "قم بتفعيل المصادقة الثنائية لإضافة طبقة إضافية من الأمان لحسابك."
  },
  "enable2FA": {
    "en": "Enable Two-Factor Authentication",
    "ar": "تفعيل المصادقة الثنائية"
  },
  "twoFactorEnabledDescription": {
    "en": "Your account is protected with two-factor authentication.",
    "ar": "حسابك محمي بالمصادقة الثنائية."
  },
  "twoFactorAuthentication": {
    "en": "Two-Factor Authentication",
    "ar": "المصادقة الثنائية"
  },
  "twoFactorSecurity": {
    "en": "Two-Factor Security",
    "ar": "الأمان الثنائي"
  },
  "twoFactorNotEnabled": {
    "en": "Two-Factor Authentication Not Enabled",
    "ar": "المصادقة الثنائية غير مفعلة"
  },
  "twoFactorNotEnabledDescription": {
    "en": "Your account is not protected with two-factor authentication.",
    "ar": "حسابك غير محمي بالمصادقة الثنائية."
  },
  "twoFactorNote": {
    "en": "You'll need an authenticator app like Google Authenticator or Authy to use 2FA.",
    "ar": "ستحتاج إلى تطبيق مصادقة مثل Google Authenticator أو Authy لاستخدام المصادقة الثنائية."
  },
  "setup2FA": {
    "en": "Set Up Two-Factor Authentication",
    "ar": "إعداد المصادقة الثنائية"
  },
  "setup2FADescription": {
    "en": "Scan the QR code with your authenticator app and enter the verification code to enable 2FA.",
    "ar": "امسح رمز الاستجابة السريعة (QR) باستخدام تطبيق المصادقة الخاص بك وأدخل رمز التحقق لتفعيل المصادقة الثنائية."
  },
  "saveQRCode": {
    "en": "Save QR Code",
    "ar": "حفظ رمز QR"
  },
  "verificationCode": {
    "en": "Verification Code",
    "ar": "رمز التحقق"
  },
  "disable2FADescription": {
    "en": "Are you sure you want to disable two-factor authentication? This will make your account less secure.",
    "ar": "هل أنت متأكد أنك تريد تعطيل المصادقة الثنائية؟ هذا سيجعل حسابك أقل أمانًا."
  },
  "disable2FAWarning": {
    "en": "Disabling 2FA will reduce the security of your account. Are you sure you want to proceed?",
    "ar": "تعطيل المصادقة الثنائية سيخفض من أمان حسابك. هل أنت متأكد أنك تريد المتابعة؟"
  },
  "warning": {
    "en": "Warning",
    "ar": "تحذير"
  },
  "disabling": {
    "en": "Disabling...",
    "ar": "جارٍ التعطيل..."
  },
  "TwoFactorAuth": {
    "en": "Two-Factor Authentication",
    "ar": "المصادقة الثنائية"
  },
  "verify": {
    "en": "Verify",
    "ar": "تحقق"
  },
  "back": {
    "en": "Back",
    "ar": "رجوع"
  },
  "twoFactorAuth": {
    "en": "Two-Factor Authentication",
    "ar": "المصادقة الثنائية"
  },
  "enterVerificationCode": {
    "en": "Enter Verification Code",
    "ar": "أدخل رمز التحقق"
  },
  "useAuthenticatorApp": {
    "en": "Use Authenticator App",
    "ar": "استخدم تطبيق المصادقة"
  },
    "paymentMethodAdded": {
    "en": "Payment method added successfully",
    "ar": "تمت إضافة طريقة الدفع بنجاح"
  },
  "paymentMethodUpdated": {
    "en": "Payment method updated successfully",
    "ar": "تم تحديث طريقة الدفع بنجاح"
  },
  "paymentMethodDeleted": {
    "en": "Payment method deleted successfully",
    "ar": "تم حذف طريقة الدفع بنجاح"
  },
  "paymentMethods": {
    "en": "Payment Methods",
    "ar": "طرق الدفع"
  },
  "addNewMethodDescription": {
    "en": "Add a new payment method to your system",
    "ar": "أضف طريقة دفع جديدة إلى نظامك"
  },
  "addNewMethod": {
    "en": "Add New Method",
    "ar": "إضافة طريقة جديدة"
  },
  "methodName": {
    "en": "Method Name",
    "ar": "اسم الطريقة"
  },
  "description": {
    "en": "Description",
    "ar": "الوصف"
  },
  "imageURL": {
    "en": "Image URL",
    "ar": "رابط الصورة"
  },
  "noPaymentMethodsFound": {
    "en": "No payment methods found. Add your first payment method!",
    "ar": "لم يتم العثور على طرق دفع. أضف أول طريقة دفع!"
  },
  "noImage": {
    "en": "No Image",
    "ar": "لا توجد صورة"
  },
  "editMethod": {
    "en": "Edit Payment Method",
    "ar": "تعديل طريقة الدفع"
  },
  "editMethodDescription": {
    "en": "Update the payment method details",
    "ar": "قم بتحديث تفاصيل طريقة الدفع"
  },
  "deleteMethodConfirmation": {
    "en": "Are you sure you want to delete this payment method? This action cannot be undone.",
    "ar": "هل أنت متأكد أنك تريد حذف هذه طريقة الدفع؟ لا يمكن التراجع عن هذا الإجراء."
  },
  "discountOfferAdded": {
    "en": "Discount offer added successfully",
    "ar": "تمت إضافة عرض الخصم بنجاح"
  },
  "discountOfferUpdated": {
    "en": "Discount offer updated successfully",
    "ar": "تم تحديث عرض الخصم بنجاح"
  },
  "discountOfferDeleted": {
    "en": "Discount offer deleted successfully",
    "ar": "تم حذف عرض الخصم بنجاح"
  },
  "noExpiryDate": {
    "en": "No expiry date",
    "ar": "لا يوجد تاريخ انتهاء"
  },
  "discountOffers": {
    "en": "Discount Offers",
    "ar": "عروض الخصم"
  },
  "addNewOffer": {
    "en": "Add New Offer",
    "ar": "إضافة عرض جديد"
  },
  "addNewOfferDescription": {
    "en": "Create a new discount offer for your customers",
    "ar": "أنشئ عرض خصم جديد لعملائك"
  },
  "discountPercentage": {
    "en": "Discount Percentage",
    "ar": "نسبة الخصم"
  },
  "noDiscountOffersFound": {
    "en": "No discount offers found. Create your first offer!",
    "ar": "لم يتم العثور على عروض خصم. أنشئ أول عرض لك!"
  },
  "expiresOn": {
    "en": "Expires on",
    "ar": "ينتهي في"
  },
  "createdOn": {
    "en": "Created on",
    "ar": "تم الإنشاء في"
  },
  "editOffer": {
    "en": "Edit Offer",
    "ar": "تعديل العرض"
  },
  "editOfferDescription": {
    "en": "Update the discount offer details",
    "ar": "قم بتحديث تفاصيل عرض الخصم"
  },
  "deleteOfferConfirmation": {
    "en": "Are you sure you want to delete this offer? This action cannot be undone.",
    "ar": "هل أنت متأكد أنك تريد حذف هذا العرض؟ لا يمكن التراجع عن هذا الإجراء."
  }
};

// Create the context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: () => '',
  translations,
  isRTL: false,
});

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  // Detect browser language, defaulting to English if not Arabic
  const detectLanguage = (): Language => {
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'ar' ? 'ar' : 'en';
  };

  // Initialize with detected language
  const [language, setLanguage] = useState<Language>(detectLanguage());
  const isRTL = language === 'ar';

  // Function to translate text
  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language];
    }
    console.warn(`Translation key not found: ${key}`);
    return key;
  };
  // Apply RTL/LTR direction to document
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const value = {
    language,
    setLanguage,
    t,
    translations,
    isRTL
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
