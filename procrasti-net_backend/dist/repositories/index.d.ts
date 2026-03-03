export interface User {
    id: number;
    email: string;
    password_hash?: string;
    display_name?: string | null;
    created_at: Date;
}
export interface Skill {
    id: number;
    title: string;
    description?: string | null;
    category?: string | null;
    difficulty: 'easy' | 'medium' | 'hard';
    created_at: Date;
    tags?: string[];
}
export interface Todo {
    id: number;
    user_id: number;
    title: string;
    notes?: string | null;
    due_date?: Date | null;
    status: 'open' | 'completed';
    priority: 'low' | 'medium' | 'high';
    created_at: Date;
    updated_at: Date;
}
export interface Routine {
    id: number;
    user_id: number;
    title: string;
    schedule_type: 'daily' | 'weekly';
    weekdays?: string | string[] | null;
    reminder_time?: string | null;
    created_at: Date;
}
export interface RoutineEntry {
    id: number;
    routine_id: number;
    date: Date;
    done: boolean;
    note?: string | null;
}
export interface Checkin {
    id: number;
    user_id: number;
    date: Date;
    mood: number;
    energy: number;
    note?: string | null;
    created_at: Date;
}
export declare class UserRepository {
    findByEmail(email: string): Promise<User | null>;
    create(user: Partial<User>): Promise<number>;
    findById(id: number): Promise<User | null>;
}
export declare class SkillRepository {
    getAll(category?: string, tag?: string): Promise<Skill[]>;
    getOne(id: number): Promise<Skill | null>;
    create(skill: Partial<Skill>): Promise<number>;
    update(id: number, skill: Partial<Skill>): Promise<boolean>;
    delete(id: number): Promise<boolean>;
}
export declare class TodoRepository {
    private mapStatusToDb;
    private mapStatusFromDb;
    private toDueAt;
    getAll(userId: number, status?: string): Promise<Todo[]>;
    getOne(id: number, userId: number): Promise<Todo | null>;
    create(todo: Partial<Todo>): Promise<number>;
    update(id: number, userId: number, todo: Partial<Todo>): Promise<boolean>;
    delete(id: number, userId: number): Promise<boolean>;
}
export declare class RoutineRepository {
    getAll(userId: number): Promise<Routine[]>;
    getOne(id: number, userId: number): Promise<Routine | null>;
    create(routine: Partial<Routine>): Promise<number>;
    update(id: number, userId: number, routine: Partial<Routine>): Promise<boolean>;
    delete(id: number, userId: number): Promise<boolean>;
    complete(routineId: number, userId: number, date: string, done: boolean, note?: string): Promise<number>;
}
export declare class CheckinRepository {
    getAll(userId: number, from?: string, to?: string): Promise<Checkin[]>;
    getOne(id: number, userId: number): Promise<Checkin | null>;
    create(checkin: Partial<Checkin>): Promise<number>;
    delete(id: number, userId: number): Promise<boolean>;
}
//# sourceMappingURL=index.d.ts.map