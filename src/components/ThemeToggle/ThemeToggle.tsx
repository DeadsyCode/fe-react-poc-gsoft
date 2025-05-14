import { FiSun, FiMoon } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

interface ThemeToggleProps {
  showText?: boolean;
}

const ThemeToggle = ({ showText = true }: ThemeToggleProps) => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="theme-toggle">
      <button 
        className="theme-button"
        onClick={toggleTheme}
        aria-label={t('navbar.theme.toggle')}
      >
        {theme === 'light' ? (
          <>
            <FiMoon className="theme-icon moon-icon" />
            {showText && <span className="theme-text">{t('navbar.theme.dark')}</span>}
          </>
        ) : (
          <>
            <FiSun className="theme-icon sun-icon" />
            {showText && <span className="theme-text">{t('navbar.theme.light')}</span>}
          </>
        )}
      </button>
    </div>
  );
};

export default ThemeToggle;