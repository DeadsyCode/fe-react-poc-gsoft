import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setCurrentLanguage(lng);
  };

  return (
    <div className="language-selector">
      <button
        className={`language-button ${currentLanguage.startsWith('en') ? 'active' : ''}`}
        onClick={() => changeLanguage('en')}
      >
        🇺🇸 EN
      </button>
      <button
        className={`language-button ${currentLanguage.startsWith('es') ? 'active' : ''}`}
        onClick={() => changeLanguage('es')}
      >
        🇲🇽 ES
      </button>
    </div>
  );
};

export default LanguageSelector;