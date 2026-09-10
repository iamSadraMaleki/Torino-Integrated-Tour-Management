// ========== دفترچه تلفن ==========

export interface PhonebookJob {
  id: number;
  name: string;
  description: string;
  contactCount: number;
  createdAt: string;
  ownerUsername?: string;
}

export interface PhonebookJobRequest {
  name: string;
  description?: string;
}

export interface PhonebookContact {
  id: number;
  fullName: string;
  phone: string;
  jobId: number | null;
  jobName: string | null;
  notes: string;
  createdAt: string;
  ownerUsername?: string;
  ownerCity?: string;
  ownerRoles?: string;
}

export interface PhonebookContactRequest {
  fullName: string;
  phone: string;
  jobId?: number | null;
  notes?: string;
}
