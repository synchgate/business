import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserDetail, login as loginRequest } from "@/api/endpoints/auth";
import { registerUnauthorizedHandler } from "@/api/client";
import { session } from "@/lib/session";
import type { AuthUser, Merchant } from "@/types/auth";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  merchant: Merchant | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(() => !!session.getAccess());
  const [user, setUser] = useState<AuthUser | null>(null);

  const logout = useCallback(() => {
    session.clear();
    setHasToken(false);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    registerUnauthorizedHandler(logout);
  }, [logout]);

  // user/details/ is the source of truth for the merchant profile (and the
  // settlement account check that gates onboarding); login only returns a
  // slim user object, so we hydrate the rest right after token is present.
  const { data: detail, isLoading } = useQuery({
    queryKey: ["auth", "userDetail"],
    queryFn: getUserDetail,
    enabled: hasToken,
  });

  const merchant = detail?.merchants?.[0] ?? null;

  // After a hard refresh we only have the stored token, not the slim user
  // object login() returns — fall back to the full profile (user/details/)
  // for display purposes (name/email) until/unless the person logs in again.
  const effectiveUser: AuthUser | null =
    user ??
    (detail?.profile
      ? {
          id: detail.profile.id,
          email: detail.profile.email,
          full_name: `${detail.profile.first_name} ${detail.profile.last_name}`.trim(),
          status: "active",
          kyc_status: merchant?.is_verified ? "verified" : "pending",
          merchant_mode: "unknown",
        }
      : null);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginRequest(email, password);
    session.set(result.access, result.refresh);
    setUser(result.user);
    setHasToken(true);
    return result.user;
  }, []);

  const value: AuthContextValue = {
    isAuthenticated: hasToken,
    isLoading: hasToken && isLoading,
    user: effectiveUser,
    merchant,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
