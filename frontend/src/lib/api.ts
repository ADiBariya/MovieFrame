import axios from "axios";
import Cookies from "js-cookie";
import type {
  AnalyticsOverview,
  AuthToken,
  AutomationConfig,
  AutomationRun,
  AutomationType,
  BillingPlan,
  HistoryPoint,
  Platform,
  PlatformConnectPayload,
  SubscriptionStatus,
  User,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get("mf_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      Cookies.remove("mf_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (name: string, email: string, password: string) =>
    apiClient.post<AuthToken>("/auth/register", { name, email, password }).then((r) => r.data),

  login: (email: string, password: string) =>
    apiClient.post<AuthToken>("/auth/login", { email, password }).then((r) => r.data),

  forgotPassword: (email: string) =>
    apiClient.post("/auth/forgot-password", { email }).then((r) => r.data),

  me: () => apiClient.get<User>("/auth/me").then((r) => r.data),
};

// ── Automations ──────────────────────────────────────────────────────────────
export const automationsApi = {
  listTypes: () =>
    apiClient
      .get<{ automations: AutomationType[] }>("/automations")
      .then((r) => r.data.automations),

  triggerRun: (config: AutomationConfig) =>
    apiClient.post<AutomationRun>("/automations/run", config).then((r) => r.data),

  listRuns: () =>
    apiClient.get<AutomationRun[]>("/automations/runs").then((r) => r.data),

  getRun: (id: string) =>
    apiClient.get<AutomationRun>(`/automations/runs/${id}`).then((r) => r.data),
};

// ── Platforms ─────────────────────────────────────────────────────────────────
export const platformsApi = {
  list: () => apiClient.get<Platform[]>("/platforms").then((r) => r.data),

  connect: (payload: PlatformConnectPayload) =>
    apiClient.post<Platform>("/platforms/connect", payload).then((r) => r.data),

  disconnect: (id: string) => apiClient.delete(`/platforms/${id}`),

  status: () =>
    apiClient
      .get<{ connected: string[]; total: number }>("/platforms/status")
      .then((r) => r.data),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsApi = {
  overview: () =>
    apiClient.get<AnalyticsOverview>("/analytics/overview").then((r) => r.data),

  history: (days?: number) =>
    apiClient
      .get<HistoryPoint[]>("/analytics/history", { params: { days } })
      .then((r) => r.data),
};

// ── Billing ───────────────────────────────────────────────────────────────────
export const billingApi = {
  plans: () => apiClient.get<BillingPlan[]>("/billing/plans").then((r) => r.data),

  subscribe: (planId: string) =>
    apiClient.post("/billing/subscribe", null, { params: { plan_id: planId } }).then((r) => r.data),

  portal: () => apiClient.get("/billing/portal").then((r) => r.data),

  status: () => apiClient.get<SubscriptionStatus>("/billing/status").then((r) => r.data),
};
