export interface EmailBrandingConfig {
  id: string;
  header_type?: "image" | "html";
  header_url: string | null;
  header_filename: string | null;
  header_html?: string | null;
  footer_type?: "image" | "html";
  footer_url: string | null;
  footer_filename: string | null;
  footer_html?: string | null;
  updated_at?: string | null;
  updated_by?: string | null;
}



export interface SharedSignature {
  id: number;
  name: string;
  image_url: string;
  filename?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: string | null;
}

export interface ForwardPetitionPayload {
  petition_id: number;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  message: string;
  notes?: string;
  header_enabled: boolean;
  footer_enabled: boolean;
  signature_id?: number | null;
  html_content?: string;
}

export interface ForwardPetitionResult {
  success: boolean;
  message: string;
  petition_id: number;
  recipient: string;
  status: string;
}
