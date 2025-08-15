import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  nic: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'citizen' | 'officer' | 'admin';
  department?: any;
  isVerified: boolean;
  preferences: {
    language: string;
    notificationMethod: string;
  };
  address?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('govconnect_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get(`${API_BASE_URL}/auth/me`);
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth initialization failed:', error);
          localStorage.removeItem('govconnect_token');
          localStorage.removeItem('govconnect_user_role');
          setToken(null);
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (identifier: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        identifier,
        password
      });

      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('govconnect_token', newToken);
      localStorage.setItem('govconnect_user_role', userData.role);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      
      const { token: newToken, user: newUser } = response.data;
      
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('govconnect_token', newToken);
      localStorage.setItem('govconnect_user_role', newUser.role);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('govconnect_token');
    localStorage.removeItem('govconnect_user_role');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};