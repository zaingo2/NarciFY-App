

import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';

// Define the structure for language metadata
interface Language {
  code: string;
  name: string; // This will now be the native name
  path: string;
}

// Define all supported languages with updated, absolute paths
const SUPPORTED_LANGUAGES: Omit<Language, 'name'>[] = [
  { code: 'en', path: '/locales/en.json' },
  { code: 'es', path: '/locales/es.json' },
  { code: 'de', path: '/locales/de.json' },
  { code: 'fr', path: '/locales/fr.json' },
  { code: 'ja', path: '/locales/ja.json' },
  { code: 'no', path: '/locales/no.json' },
  { code: 'sv', path: '/locales/sv.json' },
  { code: 'fi', path: '/locales/fi.json' },
  { code: 'pt', path: '/locales/pt.json' },
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
            const promises = SUPPORTED_LANGUAGES.map(lang => 
                fetch(lang.path)
                    .then(res => {
                        if (!res.ok) throw new Error(`Failed to load ${lang.code} translations at ${lang.path}`);
                        return res.json();
                    })
                    .then(data => ({ code: lang.code, data }))
            );

            // Use Promise.allSettled to ensure that even if one language file fails to load, the others are still processed.
            const results = await Promise.allSettled(promises);

            const loadedTranslations = results.reduce((acc, result) => {
                if (result.status === 'fulfilled') {
                    acc[result.value.code] = result.value.data;
                } else {
                    console.error(`Could not load translation for a language:`, result.reason);
                }
                return acc;
            }, {} as { [key: string]: Translations });

            // Ensure English is always available as a fallback
            if (!loadedTranslations.en) {
                console.warn("English translations failed to load. Attempting a fallback fetch.");
                 try {
                    const enResponse = await fetch('/locales/en.json');
                    if (enResponse.ok) {
                        loadedTranslations.en = await enResponse.json();
                    } else {
                         loadedTranslations.en = { langName: "English" }; // Minimal fallback
                    }
                } catch (e) {
                     loadedTranslations.en = { langName: "English" };
                }
            }
            
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
            console.error("A critical error occurred during translation loading:", error);
            setTranslations({ en: { langName: "English" } }); // Minimal fallback to prevent crash
        } finally {
            setIsLoading(false);
        }
    };
    
    loadAllTranslations();
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
    if (!translations) return undefined;
    const langData = translations[lang];
    if (!langData) return undefined;
    return key.split('.').reduce((obj: any, k: string) => obj && obj[k], langData);
  }, [translations]);

  const t = useCallback((key: string, options?: { [key: string]: string | number }): string => {
    if (isLoading || !translations) return key; // Return key if not loaded

    let translation = getNestedTranslation(language, key) || getNestedTranslation('en', key) || key;

    // Handle pluralization first, if applicable
    if (options && typeof options.count === 'number' && translation.includes('{count, plural,')) {
        const count = options.count;
        
        const oneMatch = translation.match(/one\s*{([^}]+)}/);
        const otherMatch = translation.match(/other\s*{([^}]+)}/);

        if (oneMatch && otherMatch) {
            const oneForm = oneMatch[1].replace(/#/g, String(count));
            const otherForm = otherMatch[1].replace(/#/g, String(count));

            const pluralRules = new Intl.PluralRules(language);
            const category = pluralRules.select(count);
            
            // Pluralization handled, this is the final string for this case.
            return category === 'one' ? oneForm : otherForm;
        }
    }

    // Handle simple variable replacement for all other cases
    if (options) {
      Object.keys(options).forEach(k => {
        const regex = new RegExp(`{${k}}`, 'g');
        translation = translation.replace(regex, String(options![k]));
      });
    }

    return translation;
  }, [language, getNestedTranslation, isLoading, translations]);

  // Create a memoized list of languages with their native names for the UI
  const languagesForSelector = useMemo((): Language[] => {
    return SUPPORTED_LANGUAGES.map(lang => ({
        ...lang,
        name: (translations?.[lang.code]?.langName as string) || lang.code.toUpperCase(),
    }));
  }, [translations]);

  const value = {
    language,
    changeLanguage,
    t,
    languages: languagesForSelector,
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
