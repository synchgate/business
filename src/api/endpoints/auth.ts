import { apiClient } from "@/api/client";
import type { ApiSuccessEnvelope } from "@/api/envelope";
import type {
  ForgotPasswordInput,
  LoginResponse,
  RegisterInput,
  ResetPasswordInput,
  UserDetail,
  VerifyOtpInput,
} from "@/types/auth";

// Mirrors accounts/urls.py exactly.

export async function login(email: string, password: string) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<LoginResponse>>(
    "accounts/auth/login/",
    { email, password },
  );
  return data.data;
}

export async function register(input: RegisterInput) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<null>>(
    "accounts/auth/register/",
    input,
  );
  return data;
}

export async function verifyOtp(input: VerifyOtpInput) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<{ user: unknown; purpose: string }>>(
    "accounts/auth/verify-otp/",
    input,
  );
  return data.data;
}

export async function forgotPassword(input: ForgotPasswordInput) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<{ message: string }>>(
    "accounts/auth/forgot-password/",
    input,
  );
  return data.data;
}

export async function resetPassword(input: ResetPasswordInput) {
  const { data } = await apiClient.post<ApiSuccessEnvelope<{ message: string }>>(
    "accounts/auth/reset-password/",
    input,
  );
  return data.data;
}

export async function getUserDetail() {
  const { data } = await apiClient.get<ApiSuccessEnvelope<UserDetail>>("accounts/user/details/");
  return data.data;
}

export async function updateProfile(input: Record<string, unknown> | FormData) {
  const isFormData = input instanceof FormData;
  const { data } = await apiClient.patch<ApiSuccessEnvelope<unknown>>(
    "accounts/profile/update/",
    input,
    isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined,
  );
  return data.data;
}