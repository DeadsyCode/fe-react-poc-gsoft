import axios from 'axios';
import { API_CONFIG, getApiUrl } from '../config/api.config';

export interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
}

interface LoginResponse {
  token: string;
  firstName: string;
  lastName: string;
  email: string;
}

export const login = async (email: string, password: string): Promise<{ token: string, userInfo: UserInfo }> => {
  try {
    const response = await axios.post(
      getApiUrl(`${API_CONFIG.AUTH.BASE_PATH}${API_CONFIG.AUTH.LOGIN}`), 
      { email, password }
    );
    const data = response.data;
    
    // Extract user info from the response
    const userInfo: UserInfo = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email
    };

    return {
      token: data.token,
      userInfo
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Authentication failed');
    }
    throw new Error('Network error. Please try again later.');
  }
};

export const logout = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userInfo');
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('authToken');
  return !!token;
};

export const validateToken = async (): Promise<boolean> => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    return false;
  }
  
  try {
    // You can implement a token validation endpoint call here if available
    // For now, we'll just check if token exists
    return true;
    
    // If you have a token validation endpoint, uncomment the below code
    /*
    await axios.get(getApiUrl(`${API_CONFIG.AUTH.BASE_PATH}${API_CONFIG.AUTH.VALIDATE_TOKEN}`), {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return true;
    */
  } catch (error) {
    // If validation fails, clear the token
    logout();
    return false;
  }
};