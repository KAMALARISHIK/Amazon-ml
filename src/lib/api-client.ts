import Cookies from "js-cookie";
import {
  AuthTokens,
  LoginRequest,
  SignupRequest,
  User,
  DatasetSummary,
  BlockingAnalyticsResponse,
  MatchingJobConfig,
  MatchingJob,
  MatchesResponse,
  MatchFilterParams,
  ValidationReport,
  AnalyticsData,
  SourceId,
  BusinessEntityRecord,
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== "undefined" ? Cookies.get("auth_token") : null;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      let errorMessage = `API Error: ${res.status} ${res.statusText}`;
      try {
        const errorBody = await res.json();
        if (errorBody && errorBody.detail) {
          errorMessage = typeof errorBody.detail === "string" ? errorBody.detail : JSON.stringify(errorBody.detail);
        } else if (errorBody && errorBody.message) {
          errorMessage = errorBody.message;
        }
      } catch {
        // use default error message
      }
      throw new Error(errorMessage);
    }
    return res.json();
  }

  // --- Auth Endpoints ---
  async login(payload: LoginRequest): Promise<AuthTokens> {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return this.handleResponse<AuthTokens>(res);
  }

  async signup(payload: SignupRequest): Promise<AuthTokens> {
    const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return this.handleResponse<AuthTokens>(res);
  }

  async getCurrentUser(): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<User>(res);
  }

  // --- Dataset Upload & Management ---
  async getDatasetsSummary(): Promise<Record<string, DatasetSummary>> {
    const res = await fetch(`${API_BASE_URL}/api/datasets`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<Record<string, DatasetSummary>>(res);
  }

  async getSourceRecords(source: SourceId, query?: string, page: number = 1, pageSize: number = 20): Promise<{
    records: BusinessEntityRecord[];
    total: number;
    page: number;
    page_size: number;
  }> {
    const params = new URLSearchParams();
    params.set("source", source);
    if (query) params.set("query", query);
    params.set("page", page.toString());
    params.set("page_size", pageSize.toString());

    const res = await fetch(`${API_BASE_URL}/api/datasets/records?${params.toString()}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(res);
  }

  async uploadTsvDataset(source: SourceId, file: File): Promise<DatasetSummary> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("source", source);

    const token = typeof window !== "undefined" ? Cookies.get("auth_token") : null;
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/api/datasets/upload`, {
      method: "POST",
      headers,
      body: formData,
    });
    return this.handleResponse<DatasetSummary>(res);
  }

  async seedDemoDatasets(): Promise<{ message: string; datasets: Record<string, DatasetSummary> }> {
    const res = await fetch(`${API_BASE_URL}/api/datasets/seed`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(res);
  }

  // --- Blocking Stage ---
  async getBlockingAnalytics(): Promise<BlockingAnalyticsResponse> {
    const res = await fetch(`${API_BASE_URL}/api/blocking`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<BlockingAnalyticsResponse>(res);
  }

  // --- Entity Matching Job ---
  async triggerMatchingJob(config: MatchingJobConfig): Promise<MatchingJob> {
    const res = await fetch(`${API_BASE_URL}/api/matching/run`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(config),
    });
    return this.handleResponse<MatchingJob>(res);
  }

  async getMatchingJobStatus(jobId: string): Promise<MatchingJob> {
    const res = await fetch(`${API_BASE_URL}/api/matching/status/${jobId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<MatchingJob>(res);
  }

  // --- Match Explorer ---
  async getMatches(filterParams: MatchFilterParams = {}): Promise<MatchesResponse> {
    const params = new URLSearchParams();
    if (filterParams.query) params.set("query", filterParams.query);
    if (filterParams.country) params.set("country", filterParams.country);
    if (filterParams.min_confidence !== undefined) params.set("min_confidence", filterParams.min_confidence.toString());
    if (filterParams.max_confidence !== undefined) params.set("max_confidence", filterParams.max_confidence.toString());
    if (filterParams.page) params.set("page", filterParams.page.toString());
    if (filterParams.page_size) params.set("page_size", filterParams.page_size.toString());

    const res = await fetch(`${API_BASE_URL}/api/matches?${params.toString()}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<MatchesResponse>(res);
  }

  // --- Validation ---
  async runValidation(): Promise<ValidationReport> {
    const res = await fetch(`${API_BASE_URL}/api/validation`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ValidationReport>(res);
  }

  // --- Analytics Trends ---
  async getAnalytics(): Promise<AnalyticsData> {
    const res = await fetch(`${API_BASE_URL}/api/analytics`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<AnalyticsData>(res);
  }
}

export const api = new ApiClient();
