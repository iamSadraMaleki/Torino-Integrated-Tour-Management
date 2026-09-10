import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import api from "../../Router/api";
import "./AuthPage.css";

// ========== Types ==========
interface LoginFormData {
  username: string;
  password: string;
}

interface RegisterFormData {
  username: string;
  email: string;
  mobile: string;
  password: string;
  role: "ROLE_USER" | "ROLE_CEO";
  city: string;
}

const AuthPage: React.FC = () => {
  const [rightPanelActive, setRightPanelActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginData, setLoginData] = useState<LoginFormData>({ 
    username: "", 
    password: "" 
  });
  
  const [registerData, setRegisterData] = useState<RegisterFormData>({
    username: "",
    email: "",
    mobile: "",
    password: "",
    role: "ROLE_USER",
    city: "",
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setRegisterData({ ...registerData, role: e.target.value as "ROLE_USER" | "ROLE_CEO" });
  };

  // ورود
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log("Login attempt with:", loginData.username);
      const result = await login(loginData.username, loginData.password);
      
      if (result.success) {
        alert("ورود موفق ✅");
      } else {
        alert("خطا در ورود ❌ " + result.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  // ثبت‌نام
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    
    // آماده سازی داده برای ارسال به سرور
    const payload = {
      username: registerData.username,
      password: registerData.password,
      email: registerData.email,
      mobile: registerData.mobile,
      role: registerData.role,
      city: registerData.city || undefined,
    };
    
    console.log("Sending registration data:", payload);
    console.log("API baseURL:", api.defaults.baseURL);
    
    try {
      const response = await api.post("/api/auth/register", payload);
      console.log("Registration response:", response.data);
      
      alert(`ثبت‌نام موفق ✅\nنقش شما: ${registerData.role === "ROLE_USER" ? "مسافر" : "مدیر آژانس"}\nحالا وارد شوید`);
      
      setRightPanelActive(false);
      
      // پاک کردن فرم ثبت‌نام
      setRegisterData({
        username: "",
        email: "",
        mobile: "",
        password: "",
        role: "ROLE_USER",
        city: "",
      });
      
    } catch (err: any) {
      console.error("Registration error FULL:", err);
      console.error("Error response:", err.response);
      console.error("Error message:", err.message);
      
      let errorMessage = "خطا در ثبت‌نام ❌ ";
      
      if (err.response) {
        // سرور پاسخ داده با خطا
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
        errorMessage += err.response.data?.message || err.response.data?.error || `کد خطا: ${err.response.status}`;
      } else if (err.request) {
        // درخواست ارسال شده ولی پاسخی دریافت نشده
        errorMessage += "سرور پاسخ نمی‌دهد. لطفاً مطمئن شوید سرور در حال اجراست.";
      } else {
        // خطای دیگر
        errorMessage += err.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className={`auth-container ${rightPanelActive ? "right-panel-active" : ""}`}>
        
        {/* فرم ثبت‌نام */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleRegister}>
            <h1>ثبت‌نام</h1>
            
            <input
              type="text"
              placeholder="نام کاربری"
              name="username"
              value={registerData.username}
              onChange={handleRegisterChange}
              required
              disabled={loading}
            />
            
            <input
              type="email"
              placeholder="ایمیل"
              name="email"
              value={registerData.email}
              onChange={handleRegisterChange}
              required
              disabled={loading}
            />
            
            <input
              type="text"
              placeholder="موبایل"
              name="mobile"
              value={registerData.mobile}
              onChange={handleRegisterChange}
              required
              disabled={loading}
            />
            
            <input
              type="password"
              placeholder="رمز عبور"
              name="password"
              value={registerData.password}
              onChange={handleRegisterChange}
              required
              disabled={loading}
            />
            
            <input
              type="text"
              placeholder="شهر (اختیاری)"
              name="city"
              value={registerData.city}
              onChange={handleRegisterChange}
              disabled={loading}
            />

            <div className="role-selector">
              <label>نقش خود را انتخاب کنید:</label>
              <div className="role-options">
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="ROLE_USER"
                    checked={registerData.role === "ROLE_USER"}
                    onChange={handleRoleChange}
                    disabled={loading}
                  />
                  <span className="role-label">👤 مسافر</span>
                </label>

                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="ROLE_CEO"
                    checked={registerData.role === "ROLE_CEO"}
                    onChange={handleRoleChange}
                    disabled={loading}
                  />
                  <span className="role-label">🏢 مدیر آژانس</span>
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
            </button>
          </form>
        </div>

        {/* فرم ورود */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleLogin}>
            <h1>ورود</h1>
            
            <input
              type="text"
              placeholder="نام کاربری"
              name="username"
              value={loginData.username}
              onChange={handleLoginChange}
              required
              disabled={loading}
            />
            
            <input
              type="password"
              placeholder="رمز عبور"
              name="password"
              value={loginData.password}
              onChange={handleLoginChange}
              required
              disabled={loading}
            />
            
            <a href="#">رمز عبور را فراموش کرده‌اید؟</a>
            <button type="submit" disabled={loading}>
              {loading ? "در حال ورود..." : "ورود"}
            </button>
          </form>
        </div>

        {/* پنل انیمیشن */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>خوش برگشتی!</h1>
              <p>اگر حساب داری وارد شو</p>
              <button className="ghost" onClick={() => setRightPanelActive(false)} disabled={loading}>
                ورود
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>سلام دوست من!</h1>
              <p>اگر حساب نداری همین حالا ثبت‌نام کن</p>
              <button className="ghost" onClick={() => setRightPanelActive(true)} disabled={loading}>
                ثبت‌نام
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;