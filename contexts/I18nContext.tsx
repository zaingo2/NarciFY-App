
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';

// A generic type for our translation files.
interface Translations {
  [key: string]: string | Translations;
}

interface I18nContextType {
  language: string;
  changeLanguage: (lang: string) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState<{ [key: string]: Translations }>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch translation files on component mount
  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const [enResponse, esResponse] = await Promise.all([
          fetch('./locales/en.json'),
          fetch('./locales/es.json')
        ]);

        if (!enResponse.ok || !esResponse.ok) {
            throw new Error('Failed to fetch translation files');
        }

        const enData = await enResponse.json();
        const esData = await esResponse.json();
        
        setTranslations({ en: enData, es: esData });
      } catch (error) {
        console.error("Failed to load translation files:", error);
        // In case of error, we can fall back to a minimal empty state.
        // The `t` function will then just return the keys.
        setTranslations({ en: {}, es: {} });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslations();
  }, []);

  // Set initial language after translations are loaded
  useEffect(() => {
    if (!isLoading) {
        const savedLang = localStorage.getItem('narciFyLanguage');
        const browserLang = navigator.language.split('-')[0];
        
        if (savedLang && translations[savedLang]) {
          setLanguage(savedLang);
        } else if (translations[browserLang]) {
          setLanguage(browserLang);
        } else {
          setLanguage('en'); // Default to English
        }
    }
  }, [isLoading, translations]);

  const changeLanguage = (lang: string) => {
    if (translations[lang]) {
      setLanguage(lang);
      try {
        localStorage.setItem('narciFyLanguage', lang);
      } catch (error) {
        console.error("Failed to save language to localStorage", error);
      }
    }
  };

  const getNestedTranslation = useCallback((lang: string, key: string): string | undefined => {
    const langData = translations[lang];
    if (!langData) return undefined;
    return key.split('.').reduce((obj: any, k: string) => obj && obj[k], langData);
  }, [translations]);

  const t = useCallback((key: string, options?: { [key: string]: string | number }): string => {
    // If translations are still loading, return the key as a fallback.
    // This prevents empty strings from appearing during the initial load.
    if (isLoading) return key;

    let translation = getNestedTranslation(language, key) || getNestedTranslation('en', key) || key;

    if (key === 'patternDetector.patternsCount' && options && typeof options.count === 'number') {
        const pluralRules = new Intl.PluralRules(language);
        const pluralCategory = pluralRules.select(options.count);
        if (language === 'es') {
            const text = pluralCategory === 'one' ? '{count} vez' : '{count} veces';
            return text.replace('{count}', String(options.count));
        }
        const text = pluralCategory === 'one' ? '{count} time' : '{count} times';
        return text.replace('{count}', String(options.count));
    }

    if (options) {
      Object.keys(options).forEach(k => {
        const regex = new RegExp(`{${k}}`, 'g');
        translation = translation.replace(regex, String(options![k]));
      });
    }

    return translation;
  }, [language, translations, isLoading, getNestedTranslation]);

  const value = {
    language,
    changeLanguage,
    t,
  };
  
  // Render children only after translations are loaded to avoid UI flicker
  // or showing untranslated keys. A loading screen could also be shown here.
  return (
    <I18nContext.Provider value={value}>
        {!isLoading ? children : null}
    </I18nContext.Provider>
  );
};
