// Mirrors accounts/serializers/auth.py and merchants/serializers/*.py.

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  status: string;
  kyc_status: "verified" | "pending";
  merchant_mode: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

export interface RegisterInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  business_name: string;
  business_phone: string;
}

export interface VerifyOtpInput {
  email: string;
  purpose: "email" | "password";
  otp: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  otp: string;
  new_password: string;
}

export interface KycDocument {
  id: string;
  document_type: string | null;
  document_file: string | null;
  verified: boolean;
  uploaded_at: string;
}

export interface Merchant {
  id: string;
  merchant_id: string;
  business_name: string;
  business_email: string | null;
  business_phone: string | null;
  business_type: string | null;
  website: string | null;
  address: string | null;
  country: string | null;
  state: string | null;
  registration_number: string | null;
  is_verified: boolean;
  kyc_documents: KycDocument[];
}

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_id: string;
  phone: string | null;
  gender: string | null;
  image: string | null;
  bio: string | null;
  address: string | null;
  country: string | null;
  state: string | null;
  account_type: string | null;
}

export interface UserDetail {
  profile: Profile;
  merchants: Merchant[];
}

export interface MerchantUpdateInput {
  business_name?: string;
  business_email?: string;
  business_phone?: string;
  business_type?: string;
  website?: string;
  address?: string;
  country?: string;
  state?: string;
  registration_number?: string;
}

export interface SettlementAccount {
  id: string;
  subaccount_code: string;
  account_name: string;
  account_number: string;
  bank_code: string;
  bank_name: string;
  is_active: boolean;
  created_at: string;
}

export interface SubaccountSetupInput {
  settlement_bank: string;
  account_number: string;
}

export interface AccountVerifyInput {
  account_number: string;
  bank_code: string;
}

export interface AccountVerifyResult {
  account_name: string;
  account_number: string;
  bank_code: string;
  bank_name: string;
}
