import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiHome, FiPieChart, FiCalendar, FiGitBranch, FiUser, FiLogOut, FiBarChart2, FiSettings, FiLayers } from 'react-icons/fi';
import './Navbar.css';
import logo from '../../assets/genius-soft-logo.png';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { useAuth } from '../../contexts/AuthContext';

type NavItem = {
  path: string;
  labelKey: string;
  icon: React.ReactNode;
};

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, userInfo, getInitials, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { path: '/dashboard', labelKey: 'navbar.dashboard', icon: <FiPieChart className="nav-icon" /> },
    { path: '/', labelKey: 'navbar.home', icon: <FiLayers className="nav-icon" /> },
    { path: '/scheduler', labelKey: 'navbar.scheduler', icon: <FiCalendar className="nav-icon" /> },
    { path: '/workflow', labelKey: 'navbar.workflow', icon: <FiGitBranch className="nav-icon" /> },
  ];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="Genius Soft Logo" className="logo-image" />
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          <div className={isOpen ? 'hamburger active' : 'hamburger'}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
        </div>

        <ul className={isOpen ? 'nav-menu active' : 'nav-menu'}>
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
                aria-label={t(item.labelKey)}
              >
                {item.icon}
                <span className="nav-tooltip">{t(item.labelKey)}</span>
                <span className="nav-text">{t(item.labelKey)}</span>
              </Link>
            </li>
          ))}
          {isAuthenticated ? (
            <li className="nav-item user-profile-container">
              <div
                className="user-profile"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                onMouseEnter={() => setIsUserMenuOpen(true)}
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <div className="user-avatar">{getInitials()}</div>
                <div className={`user-menu ${isUserMenuOpen ? 'active' : ''}`}>
                  <div className="user-info">
                    <span className="user-name">
                      {userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : ''}
                    </span>
                    <span className="user-email">
                      {userInfo ? userInfo.email : ''}
                    </span>
                  </div>
                  <div className="language-option">
                    <span className="menu-section-label">{t('navbar.language')}</span>
                    <LanguageSelector />
                  </div>
                  <div className="theme-option">
                    <span className="menu-section-label">{t('navbar.theme.toggle')}</span>
                    <ThemeToggle />
                  </div>
                  <div
                    className="logout-option"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle logout
                      logout();
                      navigate('/login');
                    }}
                  >
                    <FiLogOut className="logout-icon" />
                    <span>{t('auth.logout')}</span>
                  </div>
                </div>
              </div>
            </li>
          ) : (
            <li className="nav-item nav-button">
              <Link to="/login" className="nav-link login-btn" onClick={() => setIsOpen(false)}>
                <FiUser className="login-icon" />
                <span className="login-text">{t('auth.login')}</span>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;