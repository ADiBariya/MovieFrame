// All shared TypeScript types

export interface User {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro" | "business";
  created_at: string;
  avatar_url?: string | null;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AutomationConfig {
  pages_to_scrape: number;
  hashtags: string[];
  platform: string;
}

export type RunStatus = "queued" | "running" | "succeeded" | "failed";

export interface AutomationRun {
  id: string;
  automation_type: string;
  status: RunStatus;
  started_at?: string;
  finished_at?: string;
  logs: string[];
  movie_title?: string;
  frame_url?: string;
  tweet_url?: string;
  user_id: string;
  config?: AutomationConfig;
}

export interface AutomationType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Platform {
  id: string;
  platform: string;
  connected: boolean;
  connected_at?: string;
  username?: string;
}

export interface PlatformConnectPayload {
  platform: string;
  api_key: string;
  api_secret: string;
  access_token?: string;
  access_secret?: string;
  bearer_token?: string;
}

export interface AnalyticsOverview {
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  success_rate: number;
  posts_today: number;
  connected_platforms: number;
  time_saved_hours: number;
}

export interface HistoryPoint {
  date: string;
  posts: number;
  failures: number;
}

export interface BillingPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  stripe_price_id?: string;
}

export interface SubscriptionStatus {
  plan: string;
  status: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
}

export interface ApiError {
  detail: string;
}
