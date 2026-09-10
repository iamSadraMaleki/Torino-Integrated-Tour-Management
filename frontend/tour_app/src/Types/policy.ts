// فایل: src/Types/policy.ts

/** بند لغو — هر سیاست می‌تواند چندین بند داشته باشد */
export interface CancellationPolicyClause {
  id?: number;
  /** حداقل ساعت قبل از حرکت (آستانه بند) */
  hoursBeforeDeparture: number;
  /** درصد برگشت مبلغ (0 تا 100) */
  refundPercentage: number;
}

export interface CancellationPolicy {
  id: number;
  policyName: string;
  description: string;
  /** بندهای لغو سیاست */
  clauses: CancellationPolicyClause[];
  /** فیلد قدیمی — سازگاری */
  hoursBeforeDeparture: number;
  /** فیلد قدیمی — سازگاری */
  refundPercentage: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CancellationPolicyRequest {
  policyName: string;
  description?: string;
  /** بندهای لغو سیاست */
  clauses: CancellationPolicyClause[];
  /** فیلد قدیمی — سازگاری */
  hoursBeforeDeparture?: number;
  /** فیلد قدیمی — سازگاری */
  refundPercentage?: number;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
