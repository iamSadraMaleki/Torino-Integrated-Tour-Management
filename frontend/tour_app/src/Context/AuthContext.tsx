import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../Router/api";

// ========== Types ==========
interface User {
  id: string | number;
  username: string;
  email: string;
  roles: string[];
  role: 'user' | 'admin' | 'ceo' | 'superadmin';
  token: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasRole: (requiredRole: string) => boolean;
  loading: boolean;
  isVerified: boolean;
  checkVerificationStatus: () => Promise<void>;
}

// ========== Context ==========
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const navigate = useNavigate();

  // بررسی وضعیت احراز هویت برای CEO
  const checkVerificationStatus = async (): Promise<void> => {
    try {
      const response = await api.get('/api/ceo-verification/user-verification-status');
      const status = response.data.verificationStatus;
      setIsVerified(status === 'VERIFIED');
    } catch (error) {
      console.error('Error checking verification status:', error);
      setIsVerified(false);
    }
  };


  // بررسی localStorage برای لاگین خودکار
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const userData: User = JSON.parse(storedUser);
        setUser(userData);
        
        // اگر کاربر CEO است، وضعیت احراز هویت را بررسی کن
        if (userData.role === 'ceo') {
          checkVerificationStatus();
        } else {
          setIsVerified(true);
        }
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<LoginResponse> => {
    try {
      console.log("1️⃣ Sending login request to /api/auth/login");
      console.log("2️⃣ Credentials:", { username, password: "***" });
      
      const response = await api.post('/api/auth/login', {
        username,
        password
      });

      console.log("3️⃣ Login response:", response.data);

      const { token } = response.data;
      
      if (!token) {
        throw new Error("Token not received from server");
      }
      
      // ذخیره توکن
      localStorage.setItem('token', token);
      
      console.log("4️⃣ Token saved, fetching user info...");
      
      // گرفتن اطلاعات کاربر
      const userResponse = await api.get('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("5️⃣ User info response:", userResponse.data);

      const userData = userResponse.data;
      const roles: string[] = userData.roles || [];
      
      // تعیین نقش اصلی کاربر
      let primaryRole: User['role'] = 'user';
      if (roles.includes('ROLE_SUPERADMIN')) {
        primaryRole = 'superadmin';
      } else if (roles.includes('ROLE_ADMIN')) {
        primaryRole = 'admin';
      } else if (roles.includes('ROLE_CEO')) {
        primaryRole = 'ceo';
      }

      const userInfo: User = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        roles: roles,
        role: primaryRole,
        token: token
      };
      
      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));
      
      console.log("6️⃣ Login successful, role:", primaryRole);
      
      // هدایت کاربر بر اساس نقش
      if (primaryRole === 'superadmin') {
        navigate('/admin/dashboard');
      } else if (primaryRole === 'ceo') {
        navigate('/ceo/dashboard');
      } else if (primaryRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Login error FULL:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);
      
      let errorMessage = 'خطا در ورود به سیستم';
      
      // پیام سرور (مثلاً «اکانت شما تعلیق شده است») اولویت دارد
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 403) {
        errorMessage = 'دسترسی غیرمجاز (403) - لطفاً CORS را در سرور بررسی کنید';
      } else if (error.response?.status === 401) {
        errorMessage = 'نام کاربری یا رمز عبور اشتباه است';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  const logout = async (): Promise<void> => {
  try {
    // ارسال درخواست لاگ اوت به سرور
    const token = localStorage.getItem('token');
    if (token) {
      await api.post('/api/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    // پاک کردن اطلاعات محلی
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/auth');
  }
};

  const isAuthenticated = (): boolean => {
    return user !== null && localStorage.getItem('token') !== null;
  };

  const hasRole = (requiredRole: string): boolean => {
    return user !== null && user.role === requiredRole;
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated,
    hasRole,
    loading,
    isVerified,
    checkVerificationStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};