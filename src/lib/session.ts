// Thin wrapper around localStorage for the JWT pair. There is currently no
// /v1/accounts/auth/refresh/ endpoint on the backend (see the implementation
// plan, gap #5), so the refresh token is stored for forward-compatibility but
// nothing calls it yet — a session just lives for the access token's
// lifetime (SIMPLE_JWT.ACCESS_TOKEN_LIFETIME, 1 day) and then the user is
// signed out on the next 401.

const ACCESS_KEY = "synchgate_invoicing_access";
const REFRESH_KEY = "synchgate_invoicing_refresh";

export const session = {
  getAccess(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  },
  getRefresh(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  },
  set(access: string, refresh: string) {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
