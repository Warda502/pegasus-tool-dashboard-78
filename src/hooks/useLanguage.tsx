
import { createContext, useContext, useState, useEffect } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import arTranslations from '@/translations/ar';
import enTranslations from '@/translations/en';

// Configure i18next
i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      ar: {
        translation: arTranslations
      }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // Not needed for React
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng'
    }
  });

interface LanguageContextType {
  currentLanguage: string;
  isRTL: boolean;
  t: (key: string) => string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [isRTL, setIsRTL] = useState(i18n.language === 'ar');

  // Function to change language
  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang).then(() => {
      setCurrentLanguage(lang);
      setIsRTL(lang === 'ar');
      localStorage.setItem('i18nextLng', lang);
      
      // Update HTML dir attribute for RTL support
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      
      // Apply RTL-specific styles to the document
      if (lang === 'ar') {
        document.body.classList.add('rtl');
      } else {
        document.body.classList.remove('rtl');
      }
    });
  };

  // Initialize RTL setting on mount
  useEffect(() => {
    const currentLang = i18n.language;
    setIsRTL(currentLang === 'ar');
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    
    if (currentLang === 'ar') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, []);

  // Translation function
  const t = (key: string): string => {
    return i18n.t(key);
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, isRTL, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
