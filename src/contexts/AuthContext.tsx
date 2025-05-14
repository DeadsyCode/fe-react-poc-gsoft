import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  login: (token: string, userInfo: UserInfo) => void;
  logout: () => void;
  getInitials: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    // Check if user is already logged in (token exists in localStorage)
    const token = localStorage.getItem('authToken');
    const storedUserInfo = localStorage.getItem('userInfo');

    if (token) {
      setIsAuthenticated(true);

      // Retrieve user info if available
      if (storedUserInfo) {
        try {
          const parsedUserInfo = JSON.parse(storedUserInfo);
          setUserInfo(parsedUserInfo);
        } catch (error) {
          console.error('Failed to parse user info', error);
          // If parsing fails, clear the invalid data
          localStorage.removeItem('userInfo');
        }
      }
    }
  }, []);

  const login = (token: string, newUserInfo: UserInfo) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
    setIsAuthenticated(true);
    setUserInfo(newUserInfo);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    setIsAuthenticated(false);
    setUserInfo(null);
  };

  const getInitials = (): string => {
    if (!userInfo) return '';
    
    const firstInitial = userInfo.firstName ? userInfo.firstName.charAt(0) : '';
    const lastInitial = userInfo.lastName ? userInfo.lastName.charAt(0) : '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userInfo, login, logout, getInitials }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};