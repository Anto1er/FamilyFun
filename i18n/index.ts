import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import fr from './fr.json';
import en from './en.json';

const resources = {
  fr: { translation: fr },
  en: { translation: en },
};

const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'fr';

i18next.use(initReactI18next).init({
  resources,
  lng: deviceLocale === 'fr' ? 'fr' : 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
