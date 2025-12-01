import type { StaticImageData } from "next/image";

export interface LeaderProfile {
  name: string;
  title: string;
  photo: StaticImageData;
}

export interface LeaderCategory {
  id: string;
  title: string;
  leaders: LeaderProfile[];
}

export interface DocumentSubcategory {
  id: string;
  label: string;
  code: string;
}

export interface DocumentCategory {
  id: string;
  label: string;
  subcategories: DocumentSubcategory[];
}

export interface QrRequestRecord {
  id: string;
  woreda_id: string;
  code: string;
  ip_address?: string;
  status: "pending" | "approved" | "denied";
  created_at: string;
  temporary_access_token?: string;
}

export interface TemporaryAccessRecord {
  id: string;
  request_id: string;
  woreda_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface DocumentUploadRecord {
  id: string;
  woreda_id: string;
  category_id: string;
  subcategory_code: string;
  year: string;
  file_name: string;
  r2_url: string;
  uploader_id: string;
  created_at: string;
}


