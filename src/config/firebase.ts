
// هذا الملف يتم الاحتفاظ به للتوافق مع الكود القديم
// يمكن إزالته بعد التحول الكامل إلى Supabase

export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAoZXmXFEvXAujyaI1ahFolBf06in5R4P4',
  databaseURL: 'https://pegasus-tool-database-default-rtdb.firebaseio.com',
};

export const AUTH_ENDPOINTS = {
  signUp: `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_CONFIG.apiKey}`,
  signIn: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_CONFIG.apiKey}`,
};

export const getDatabaseUrl = (localId: string, idToken: string) => 
  `${FIREBASE_CONFIG.databaseURL}/users/${localId}.json?auth=${idToken}`;

// تمت إضافة تعليمات تشير إلى استخدام Supabase بدلاً من هذا الملف
// يمكن استخدام Supabase من خلال:
// import { supabase } from "@/integrations/supabase/client";
