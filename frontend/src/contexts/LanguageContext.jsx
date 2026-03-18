import React, { createContext, useContext, useState, useEffect } from 'react';
import { fr } from '../locales/fr';
import { en } from '../locales/en';

const LanguageContext = createContext({
  language: 'en',
  translations: en,
  setLanguage: () => {},
  t: (key) => key,
});

const translations = {
  fr,
  en,
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    // Check localStorage first, default to English
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage);
    } else {
      // Default to English
      setLanguageState('en');
      localStorage.setItem('language', 'en');
    }
  }, []);

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, translations: translations[language], setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
