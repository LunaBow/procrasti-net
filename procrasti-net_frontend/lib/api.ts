export interface User {
    id: number;
    email?: string;
    display_name?: string;
    username?: string;
    handle?: string;
}

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
    user?: User;
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

export interface Todo extends TodoInput {
    id: number;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export interface RoutineInput {
    title: string;
    schedule_type?: "daily" | "weekly";
    weekdays?: string[];
    reminder_time?: string; // HH:MM:SS
}

export interface Routine extends RoutineInput {
    id: number;
    user_id: number;
    created_at: string;
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

export interface Checkin extends CheckinInput {
    id: number;
    user_id: number;
    created_at: string;
}

export interface Skill {
    id: number;
    title: string;
    description?: string;
    category?: string;
    difficulty?: string;
    tags?: string[];
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
        let data: unknown = null;
        try {
            data = text ? JSON.parse(text) : null;
        } catch {
            data = { message: text || "Invalid JSON response" };
        }

        if (res.status === 401) this.token = null;

        if (!res.ok) {
            const errData = data as { error?: string; message?: string };
            throw new Error(errData?.error || errData?.message || `Request failed (${res.status})`);
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

    async getCurrentUser(): Promise<User | null> {
        if (!this.token) return null;
        try {
            return await this.request<User>("/auth/me", { method: "GET" });
        } catch {
            return null;
        }
    }

    logout() {
        this.token = null;
    }

    // SKILLS
    async listSkills(): Promise<Skill[]> {
        return this.request<Skill[]>("/skills", { method: "GET" });
    }

    // TODOS
    async listTodos(status?: TodoStatus): Promise<Todo[]> {
        const qs = status ? `?status=${encodeURIComponent(status)}` : "";
        return this.request<Todo[]>(`/todos${qs}`, { method: "GET" });
    }

    async createTodo(input: TodoInput): Promise<Todo> {
        return this.request<Todo>("/todos", {
            method: "POST",
            body: JSON.stringify(input),
        });
    }

    async updateTodo(id: number | string, input: TodoInput): Promise<Todo> {
        return this.request<Todo>(`/todos/${encodeURIComponent(String(id))}`, {
            method: "PUT",
            body: JSON.stringify(input),
        });
    }

    async deleteTodo(id: number | string): Promise<boolean> {
        return this.request<boolean>(`/todos/${encodeURIComponent(String(id))}`, {
            method: "DELETE",
        });
    }

    // ROUTINES (Habits)
    async listRoutines(): Promise<Routine[]> {
        return this.request<Routine[]>("/routines", { method: "GET" });
    }

    async createRoutine(input: RoutineInput): Promise<Routine> {
        return this.request<Routine>("/routines", {
            method: "POST",
            body: JSON.stringify({ schedule_type: "daily", ...input }),
        });
    }

    async completeRoutine(id: number | string, input: RoutineCompleteInput): Promise<number> {
        return this.request<number>(`/routines/${encodeURIComponent(String(id))}/complete`, {
            method: "POST",
            body: JSON.stringify(input),
        });
    }

    // MEMBERS
    async getAllUsers(): Promise<User[]> {
        return this.request<User[]>("/users", { method: "GET" });
    }

    // CHECKINS
    async createCheckin(input: CheckinInput): Promise<Checkin> {
        return this.request<Checkin>("/checkins", {
            method: "POST",
            body: JSON.stringify(input),
        });
    }
}

const API_BASE = (import.meta.env.PUBLIC_API_URL || "https://mt231043-10992.node.ustp.cloud/api").replace(/\/$/, "");
export const api = new ApiClient(API_BASE);