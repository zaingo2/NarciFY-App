
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';

// Define the structure for language metadata
interface Language {
  code: string;
  name: string;
  path: string;
}

// Define all supported languages
const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', path: './locales/en.json' },
  { code: 'es', name: 'Español', path: './locales/es.json' },
  { code: 'de', name: 'Deutsch', path: './locales/de.json' },
  { code: 'fr', name: 'Français', path: './locales/fr.json' },
  { code: 'ja', name: '日本語', path: './locales/ja.json' },
  { code: 'no', name: 'Norsk', path: './locales/no.json' },
  { code: 'sv', name: 'Svenska', path: './locales/sv.json' },
  { code: 'fi', name: 'Suomi', path: './locales/fi.json' },
];

const SUPPORTED_LANG_CODES = SUPPORTED_LANGUAGES.map(lang => lang.code);

// A generic type for our translation files.
interface Translations {
  [key: string]: string | Translations;
}

interface I18nContextType {
  language: string;
  changeLanguage: (lang: string) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
  languages: Language[];
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState<{ [key: string]: Translations } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load all translations on initial mount
  useEffect(() => {
    const loadAllTranslations = async () => {
        try {
            const responses = await Promise.all(
                SUPPORTED_LANGUAGES.map(lang => fetch(lang.path))
            );
            
            for (const response of responses) {
                if (!response.ok) {
                    throw new Error(`Failed to fetch translation file: ${response.url}`);
                }
            }

            const data = await Promise.all(responses.map(res => res.json()));

            const loadedTranslations = SUPPORTED_LANGUAGES.reduce((acc, lang, index) => {
                acc[lang.code] = data[index];
                return acc;
            }, {} as { [key: string]: Translations });

            setTranslations(loadedTranslations);

            // Determine initial language after translations are loaded
            const savedLang = localStorage.getItem('narciFyLanguage');
            const browserLang = navigator.language.split('-')[0];
            
            if (savedLang && SUPPORTED_LANG_CODES.includes(savedLang)) {
              setLanguage(savedLang);
            } else if (SUPPORTED_LANG_CODES.includes(browserLang)) {
              setLanguage(browserLang);
            } else {
              setLanguage('en'); // Default to English
            }

        } catch (error) {
            console.error("Failed to load translations:", error);
            // Fallback with minimal data to prevent app crash
            const enResponse = await fetch('./locales/en.json');
            if (enResponse.ok) {
                const enData = await enResponse.json();
                setTranslations({ en: enData });
            } else {
                setTranslations({ en: {} });
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    loadAllTranslations();
  }, []);

  const changeLanguage = (lang: string) => {
    if (translations && translations[lang]) {
      setLanguage(lang);
      try {
        localStorage.setItem('narciFyLanguage', lang);
      } catch (error) {
        console.error("Failed to save language to localStorage", error);
      }
    }
  };

  const getNestedTranslation = useCallback((lang: string, key: string): string | undefined => {
    if (!translations) return undefined;
    const langData = translations[lang];
    if (!langData) return undefined;
    return key.split('.').reduce((obj: any, k: string) => obj && obj[k], langData);
  }, [translations]);

  const t = useCallback((key: string, options?: { [key: string]: string | number }): string => {
    if (isLoading || !translations) return key; // Return key if not loaded

    let translation = getNestedTranslation(language, key) || getNestedTranslation('en', key) || key;

    // Handle pluralization for the specific key by parsing simple ICU format
    if (key === 'patternDetector.patternsCount' && options && typeof options.count === 'number') {
        const count = options.count;
        const translationString = getNestedTranslation(language, key) || getNestedTranslation('en', key) || '{count} times';
        
        // Simple ICU message format parser for: {count, plural, one {#...} other {#...}}
        const oneMatch = translationString.match(/one\s*{([^}]+)}/);
        const otherMatch = translationString.match(/other\s*{([^}]+)}/);

        if (oneMatch && otherMatch) {
            const oneForm = oneMatch[1].replace('#', String(count));
            const otherForm = otherMatch[1].replace('#', String(count));

            const pluralRules = new Intl.PluralRules(language);
            const category = pluralRules.select(count);

            return category === 'one' ? oneForm : otherForm;
        }
        // Fallback for formats that don't use the plural rule (e.g., Japanese)
        return translationString.replace('{count}', String(count));
    }


    if (options) {
      Object.keys(options).forEach(k => {
        const regex = new RegExp(`{${k}}`, 'g');
        translation = translation.replace(regex, String(options![k]));
      });
    }

    return translation;
  }, [language, getNestedTranslation, isLoading, translations]);

  const value = {
    language,
    changeLanguage,
    t,
    languages: SUPPORTED_LANGUAGES,
  };
  
  if (isLoading) {
    // Render nothing to prevent the app from showing untranslated keys while loading.
    return null; 
  }

  return (
    <I18nContext.Provider value={value}>
        {children}
    </I18nContext.Provider>
  );
};
