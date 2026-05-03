import Cookies from "js-cookie";
import type { User } from "@/types";

const TOKEN_KEY = "mf_token";
const USER_KEY = "mf_user";

export function saveAuth(token: string, user: User) {
  Cookies.set(TOKEN_KEY, token, { expires: 7, sameSite: "lax" });
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getToken(): string | null {
  return Cookies.get(TOKEN_KEY) ?? null;
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function clearAuth() {
  Cookies.remove(TOKEN_KEY);
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_KEY);
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}
