import 'react-i18next';
import translationEN from './locales/en/translation.json';

// Define the shape of the translations
type TranslationResources = typeof translationEN;

// Extend the react-i18next to include our resource types
declare module 'react-i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: TranslationResources;
    };
  }
}