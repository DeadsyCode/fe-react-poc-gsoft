import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validateToken } from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(isAuthenticated);

  useEffect(() => {
    // Validate token when component mounts
    const checkToken = async () => {
      try {
        const tokenIsValid = await validateToken();
        setIsValid(tokenIsValid);
      } catch (error) {
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    if (isAuthenticated) {
      // Already authenticated according to context, skip validation
      setIsValidating(false);
      setIsValid(true);
    } else {
      // Check if token exists and is valid
      checkToken();
    }
  }, [isAuthenticated]);

  // Show loading or spinner while validating
  if (isValidating) {
    return <div className="loading-indicator">Validating session...</div>;
  }

  if (!isValid) {
    // Redirect to login page but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;