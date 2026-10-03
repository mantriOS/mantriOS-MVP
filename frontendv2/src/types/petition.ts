export type Priority = "HIGH" | "MEDIUM" | "LOW" | string;

export type PetitionStatus =
  | "pending"
  | "analysed"
  | "forwarded"
  | "resolved"
  | "rejected"
  | "analysis_failed"
  | string;

export interface PetitionAnalysis {
  summary: string;
  department_code: string;
  priority: Priority;
  confidence: number;
  reason: string;
}

export interface Petition {
  id: number;
  subject: string;
  body: string;
  status: PetitionStatus;
  analysis: PetitionAnalysis | null;
}

export interface CountByValue {
  value: string;
  count: number;
}

export interface DashboardStats {
  total: number;
  pending: number;
  analysed: number;
  high_priority: number;
  forwarded: number;
  recent: Petition[];
  urgent: Petition[];
  by_department: CountByValue[];
}

export interface AnalyticsStats {
  total: number;
  resolved: number;
  rejected: number;
  open: number;
  resolution_rate: number;
  by_department: CountByValue[];
  by_priority: CountByValue[];
  by_status: CountByValue[];
}

export interface PetitionListResponse {
  items: Petition[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PetitionListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  priority?: string;
  department?: string;
}

export interface ProcessEmailRequest {
  subject: string;
  body: string;
  headers?: Record<string, unknown>;
}

export interface ProcessEmailResponse {
  petition_id: number;
  analysis_id: number;
  summary: string;
  department_code: string;
  priority: Priority;
  confidence: number;
  reason: string;
}
