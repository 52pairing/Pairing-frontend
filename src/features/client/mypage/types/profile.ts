export type ClientGradeCode = "SILVER" | "GOLD" | "DIAMOND";
export type EmployeeCountCode = "SIZE_1_4" | "SIZE_5_9" | "SIZE_10_49" | "SIZE_50_299" | "SIZE_300_OVER";

export interface ClientMyPageResponse {
  accountId: number;
  logoUrl: string | null;
  companyName: string;
  businessNo: string;
  businessField: string;
  employeeCount: EmployeeCountCode;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  addressParts: AddressParts | null;
  grade: ClientGradeCode;
  ratingAverage: number | null;
  reviewCount: number;
  withdrawable: boolean;
}

export interface ClientProfileUpdateRequest {
  companyName: string;
  employeeCount: EmployeeCountCode;
  phone?: string;
  address: AddressParts;
  logoFileId?: number;
}
import type { AddressParts } from "@/features/common/types/address";
