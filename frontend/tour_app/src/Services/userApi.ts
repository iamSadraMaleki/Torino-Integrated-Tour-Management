import api from "../Router/api";
import { ChangePasswordRequest, ChangePasswordResponse, UpdateProfileRequest, User } from "../Types/user";

// ========== User APIs ==========
export const userApi = {
  // دریافت اطلاعات کاربر جاری
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get("/api/users/me");
    return response.data;
  },

  // ویرایش پروفایل
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await api.put("/api/users/update-profile", data);
    return response.data;
  },

  // تغییر رمز عبور
  changePassword: async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
    const response = await api.put("/api/users/change-password", data);
    return { success: true, message: "رمز عبور با موفقیت تغییر کرد" };
  },
};