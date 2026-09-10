import api from "../Router/api";
import { User, CeoVerification, VerificationStatistics } from "../Types/admin";

// ========== User Management APIs ==========
export const adminUserApi = {
  // دریافت لیست همه کاربران (فقط SUPERADMIN)
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await api.get("/api/users");
      return response.data;
    } catch (error: any) {
      console.error("getAllUsers error:", error.response?.status, error.response?.data);
      if (error.response?.status === 403) {
        throw new Error("شما دسترسی مشاهده لیست کاربران را ندارید. فقط سوپرادمین می‌تواند این بخش را ببیند.");
      }
      throw error;
    }
  },

  // دریافت کاربران بر اساس نقش
  getUsersByRole: async (roleName: string): Promise<User[]> => {
    const response = await api.get(`/api/users/role/${roleName}`);
    return response.data;
  },

  // تغییر وضعیت فعال/غیرفعال کاربر
  toggleUserEnabled: async (userId: number): Promise<User> => {
    const response = await api.patch(`/api/users/${userId}/toggle-enabled`);
    return response.data;
  },

  // دریافت اطلاعات یک کاربر (فقط SUPERADMIN)
  getUserById: async (userId: number): Promise<User> => {
    try {
      const response = await api.get(`/api/users/${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error("شما دسترسی مشاهده جزئیات کاربر را ندارید. فقط سوپرادمین می‌تواند این بخش را ببیند.");
      }
      throw error;
    }
  },

  // حذف کاربر (فقط SUPERADMIN)
  deleteUser: async (userId: number): Promise<void> => {
    try {
      await api.delete(`/api/users/${userId}`);
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error("شما دسترسی حذف کاربر را ندارید. فقط سوپرادمین می‌تواند این عملیات را انجام دهد.");
      }
      throw error;
    }
  },
};

// ========== Verification Management APIs ==========
export const adminVerificationApi = {
  // دریافت لیست درخواست‌های در انتظار (فقط SUPERADMIN)
  getPendingVerifications: async (): Promise<CeoVerification[]> => {
    try {
      const response = await api.get("/api/ceo-verification/pending");
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error("شما دسترسی مشاهده درخواست‌های احراز هویت را ندارید. فقط سوپرادمین می‌تواند این بخش را ببیند.");
      }
      throw error;
    }
  },

  // دریافت لیست همه درخواست‌ها (فقط SUPERADMIN)
  getAllVerifications: async (): Promise<CeoVerification[]> => {
    try {
      const response = await api.get("/api/ceo-verification/all");
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error("شما دسترسی مشاهده درخواست‌های احراز هویت را ندارید. فقط سوپرادمین می‌تواند این بخش را ببیند.");
      }
      throw error;
    }
  },

  // تایید درخواست احراز هویت (فقط SUPERADMIN)
  approveVerification: async (id: number): Promise<any> => {
    try {
      const response = await api.put(`/api/ceo-verification/approve/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error("شما دسترسی تایید درخواست را ندارید. فقط سوپرادمین می‌تواند این عملیات را انجام دهد.");
      }
      throw error;
    }
  },

  // رد درخواست احراز هویت (فقط SUPERADMIN)
  rejectVerification: async (id: number, rejectionReason: string): Promise<any> => {
    try {
      const response = await api.put(`/api/ceo-verification/reject/${id}`, { rejectionReason });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error("شما دسترسی رد درخواست را ندارید. فقط سوپرادمین می‌تواند این عملیات را انجام دهد.");
      }
      throw error;
    }
  },

  // دریافت آمار احراز هویت (فقط SUPERADMIN)
  getStatistics: async (): Promise<VerificationStatistics> => {
  try {
    const response = await api.get("/api/ceo-verification/statistics");
    const data = response.data;
    console.log("🔍 Raw statistics:", data);
    
    // نرمالایز کردن داده
    const normalized = {
      total: data.totalCeoUsers || 0,
      pending: data.pending?.count ?? data.pending ?? 0,
      verified: data.verified?.count ?? data.verified ?? 0,
      rejected: data.rejected?.count ?? data.rejected ?? 0,
      notVerified: data.notVerified?.count ?? data.notVerified ?? 0,
      pendingPercentage: data.pending?.percentage ?? 0,
      verifiedPercentage: data.verified?.percentage ?? 0,
      rejectedPercentage: data.rejected?.percentage ?? 0,
    };
    return normalized;
  } catch (error: any) {
    if (error.response?.status === 403) {
      throw new Error("شما دسترسی مشاهده آمار را ندارید. فقط سوپرادمین می‌تواند این بخش را ببیند.");
    }
    throw error;
  }
},

};