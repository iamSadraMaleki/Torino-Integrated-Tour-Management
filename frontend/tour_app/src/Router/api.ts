// src/Router/api.ts
import axios from 'axios';

// مهم: baseURL رو خالی بذار تا از proxy استفاده کنه
const api = axios.create({
  baseURL: '',  // <-- خالی باشه
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// اینترسپتور برای اضافه کردن توکن
api.interceptors.request.use(
  (config) => {
    // برای درخواست‌های auth توکن اضافه نکن
    const isAuthRequest = config.url?.includes('/auth/');
    
    if (!isAuthRequest) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;