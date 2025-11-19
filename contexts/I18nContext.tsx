
import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { resources } from '../locales/translations';

// Use the imported resources directly
const RESOURCES: Record<string, any> = resources;

interface Language {
  code: string;
  name: string;
}

const SUPPORTED_LANG_CODES = Object.keys(RESOURCES);

interface I18nContextType {
  language: string;
  changeLanguage: (lang: string) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
  languages: Language[];
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('narciFyLanguage');
    const browserLang = navigator.language.split('-')[0];
    
    if (savedLang && SUPPORTED_LANG_CODES.includes(savedLang)) {
      setLanguage(savedLang);
    } else if (SUPPORTED_LANG_CODES.includes(browserLang)) {
      setLanguage(browserLang);
    } else {
      setLanguage('en');
    }
  }, []);

  const changeLanguage = (lang: string) => {
    if (SUPPORTED_LANG_CODES.includes(lang)) {
      setLanguage(lang);
      try {
        localStorage.setItem('narciFyLanguage', lang);
      } catch (error) {
        console.error("Failed to save language to localStorage", error);
      }
    }
  };

  const getNestedTranslation = useCallback((lang: string, key: string): string | undefined => {
    const langData = RESOURCES[lang];
    if (!langData) return undefined;
    return key.split('.').reduce((obj: any, k: string) => obj && obj[k], langData);
  }, []);

  const t = useCallback((key: string, options?: { [key: string]: string | number }): string => {
    let translation = getNestedTranslation(language, key) || getNestedTranslation('en', key) || key;

    if (options && typeof options.count === 'number' && translation.includes('{count, plural,')) {
        const count = options.count;
        
        const oneMatch = translation.match(/one\s*{([^}]+)}/);
        const otherMatch = translation.match(/other\s*{([^}]+)}/);

        if (oneMatch && otherMatch) {
            const oneForm = oneMatch[1].replace(/#/g, String(count));
            const otherForm = otherMatch[1].replace(/#/g, String(count));

            const pluralRules = new Intl.PluralRules(language);
            const category = pluralRules.select(count);
            
            return category === 'one' ? oneForm : otherForm;
        }
    }

    if (options) {
      Object.keys(options).forEach(k => {
        const regex = new RegExp(`{${k}}`, 'g');
        translation = translation.replace(regex, String(options![k]));
      });
    }

    return translation;
  }, [language, getNestedTranslation]);

  const languagesForSelector = useMemo((): Language[] => {
    return SUPPORTED_LANG_CODES.map(code => ({
        code,
        name: RESOURCES[code].langName || code.toUpperCase(),
    }));
  }, []);

  const value = {
    language,
    changeLanguage,
    t,
    languages: languagesForSelector,
  };

  return (
    <I18nContext.Provider value={value}>
        {children}
    </I18nContext.Provider>
  );
};
