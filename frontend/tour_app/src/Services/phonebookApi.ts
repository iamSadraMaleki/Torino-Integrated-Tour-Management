import api from "../Router/api";
import {
  PhonebookJob,
  PhonebookJobRequest,
  PhonebookContact,
  PhonebookContactRequest,
} from "../Types/phonebook";
import { ApiResponse } from "../Types/reservation";

// ========== سمت مسافر و مدیر آژانس (مشترک) ==========
export const phonebookApi = {
  // --- سمتها و مشاغل ---
  getJobs: async (): Promise<ApiResponse<PhonebookJob[]>> => {
    const response = await api.get("/api/phonebook/jobs");
    return response.data;
  },
  createJob: async (data: PhonebookJobRequest): Promise<ApiResponse<PhonebookJob>> => {
    const response = await api.post("/api/phonebook/jobs", data);
    return response.data;
  },
  updateJob: async (id: number, data: PhonebookJobRequest): Promise<ApiResponse<PhonebookJob>> => {
    const response = await api.put(`/api/phonebook/jobs/${id}`, data);
    return response.data;
  },
  deleteJob: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/api/phonebook/jobs/${id}`);
    return response.data;
  },

  // --- مخاطبین دفترچه ---
  getContacts: async (): Promise<ApiResponse<PhonebookContact[]>> => {
    const response = await api.get("/api/phonebook/contacts");
    return response.data;
  },
  createContact: async (data: PhonebookContactRequest): Promise<ApiResponse<PhonebookContact>> => {
    const response = await api.post("/api/phonebook/contacts", data);
    return response.data;
  },
  updateContact: async (id: number, data: PhonebookContactRequest): Promise<ApiResponse<PhonebookContact>> => {
    const response = await api.put(`/api/phonebook/contacts/${id}`, data);
    return response.data;
  },
  deleteContact: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/api/phonebook/contacts/${id}`);
    return response.data;
  },
};

// ========== مانیتورینگ سوپرادمین ==========
export const adminPhonebookApi = {
  getAllContacts: async (): Promise<ApiResponse<PhonebookContact[]>> => {
    const response = await api.get("/api/admin/phonebook/contacts");
    return response.data;
  },
  getAllJobs: async (): Promise<ApiResponse<PhonebookJob[]>> => {
    const response = await api.get("/api/admin/phonebook/jobs");
    return response.data;
  },
};
