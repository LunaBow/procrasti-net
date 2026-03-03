export interface LoginParams {
    email: string;
    password: string;
}

export interface RegisterParams {
    email: string;
    password: string;
    display_name?: string;
    handle?: string;
}

export interface AuthResponse {
    token: string;
    user?: any;
}

export type TodoStatus = "open" | "completed";
export type TodoPriority = "low" | "medium" | "high";

export interface TodoInput {
    title: string;
    notes?: string;
    due_date?: string; // YYYY-MM-DD or ISO
    status?: TodoStatus;
    priority?: TodoPriority;
}

export interface RoutineInput {
    title: string;
    schedule_type?: "daily" | "weekly";
    weekdays?: string[];
    reminder_time?: string; // HH:MM:SS
}

export interface RoutineCompleteInput {
    date: string; // YYYY-MM-DD
    done: boolean;
    note?: string;
}

export interface CheckinInput {
    date: string; // YYYY-MM-DD
    mood: number; // 1..10
    energy: number; // 1..10
    note?: string;
}

export class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl.replace(/\/$/, "");
    }

    get token(): string | null {
        if (typeof window === "undefined") return null;
        return localStorage.getItem("jwt");
    }

    set token(v: string | null) {
        if (typeof window === "undefined") return;
        if (!v) localStorage.removeItem("jwt");
        else localStorage.setItem("jwt", v);
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...(options.headers as Record<string, string> | undefined),
        };

        if (this.token) headers.Authorization = `Bearer ${this.token}`;

        const res = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers });

        const text = await res.text();
        let data: any = null;
        try {
            data = text ? JSON.parse(text) : null;
        } catch {
            data = { message: text || "Invalid JSON response" };
        }

        if (res.status === 401) this.token = null;

        if (!res.ok) {
            throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
        }

        return data as T;
    }

    // AUTH
    async login(credentials: LoginParams): Promise<AuthResponse> {
        const data = await this.request<AuthResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify(credentials),
        });
        if (data?.token) this.token = data.token;
        return data;
    }

    async register(credentials: RegisterParams): Promise<AuthResponse> {
        const payload = {
            ...credentials,
            display_name: credentials.display_name || credentials.email.split("@")[0] || "User",
            handle: credentials.handle || credentials.email.split("@")[0] || "user",
        };

        const data = await this.request<AuthResponse>("/auth/register", {
            method: "POST",
            body: JSON.stringify(payload),
        });

        if (data?.token) this.token = data.token;
        return data;
    }

    async getCurrentUser(): Promise<any | null> {
        if (!this.token) return null;
        try {
            return await this.request<any>("/auth/me", { method: "GET" });
        } catch {
            return null;
        }
    }

    logout() {
        this.token = null;
    }

    // SKILLS
    async listSkills(): Promise<any[]> {
        return this.request<any[]>("/skills", { method: "GET" });
    }

    // TODOS
    async listTodos(status?: TodoStatus): Promise<any[]> {
        const qs = status ? `?status=${encodeURIComponent(status)}` : "";
        return this.request<any[]>(`/todos${qs}`, { method: "GET" });
    }

    async createTodo(input: TodoInput): Promise<any> {
        return this.request<any>("/todos", {
            method: "POST",
            body: JSON.stringify(input),
        });
    }

    async updateTodo(id: number | string, input: TodoInput): Promise<any> {
        return this.request<any>(`/todos/${encodeURIComponent(String(id))}`, {
            method: "PUT",
            body: JSON.stringify(input),
        });
    }

    async deleteTodo(id: number | string): Promise<any> {
        return this.request<any>(`/todos/${encodeURIComponent(String(id))}`, {
            method: "DELETE",
        });
    }

    // ROUTINES (Habits)
    async listRoutines(): Promise<any[]> {
        return this.request<any[]>("/routines", { method: "GET" });
    }

    async createRoutine(input: RoutineInput): Promise<any> {
        return this.request<any>("/routines", {
            method: "POST",
            body: JSON.stringify({ schedule_type: "daily", ...input }),
        });
    }

    async completeRoutine(id: number | string, input: RoutineCompleteInput): Promise<any> {
        return this.request<any>(`/routines/${encodeURIComponent(String(id))}/complete`, {
            method: "POST",
            body: JSON.stringify(input),
        });
    }

    // CHECKINS
    async listCheckins(from?: string, to?: string): Promise<any[]> {
        const p = new URLSearchParams();
        if (from) p.set("from", from);
        if (to) p.set("to", to);
        const qs = p.toString() ? `?${p.toString()}` : "";
        return this.request<any[]>(`/checkins${qs}`, { method: "GET" });
    }

    async createCheckin(input: CheckinInput): Promise<any> {
        return this.request<any>("/checkins", {
            method: "POST",
            body: JSON.stringify(input),
        });
    }
}

const API_BASE = (import.meta.env.PUBLIC_API_URL || "https://mt231043-10992.node.ustp.cloud/api").replace(/\/$/, "");
export const api = new ApiClient(API_BASE);