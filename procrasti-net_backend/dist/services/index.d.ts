import type { User, Skill, Todo, Routine, Checkin } from '../repositories/index.js';
import type { UserInput, LoginInput, SkillInput, TodoInput, RoutineInput, CheckinInput } from '../schemas/validation.js';
export declare class AuthService {
    private userRepository;
    register(input: UserInput): Promise<{
        user: User;
        token: string;
    }>;
    login(input: LoginInput): Promise<{
        user: User;
        token: string;
    }>;
    findUserById(id: number): Promise<User | null>;
}
export declare class SkillService {
    private skillRepository;
    getAll(category?: string, tag?: string): Promise<Skill[]>;
    getOne(id: number): Promise<Skill>;
    create(input: SkillInput): Promise<Skill>;
    update(id: number, input: SkillInput): Promise<Skill>;
    delete(id: number): Promise<{
        message: string;
    }>;
}
export declare class TodoService {
    private todoRepository;
    getAll(userId: number, status?: string): Promise<Todo[]>;
    getOne(id: number, userId: number): Promise<Todo>;
    create(userId: number, input: TodoInput): Promise<Todo>;
    update(id: number, userId: number, input: TodoInput): Promise<Todo>;
    delete(id: number, userId: number): Promise<{
        message: string;
    }>;
}
export declare class RoutineService {
    private routineRepository;
    getAll(userId: number): Promise<Routine[]>;
    getOne(id: number, userId: number): Promise<Routine>;
    create(userId: number, input: RoutineInput): Promise<Routine>;
    update(id: number, userId: number, input: RoutineInput): Promise<Routine>;
    delete(id: number, userId: number): Promise<{
        message: string;
    }>;
    complete(id: number, userId: number, date: string, done: boolean, note?: string): Promise<{
        message: string;
    }>;
}
export declare class CheckinService {
    private checkinRepository;
    getAll(userId: number, from?: string, to?: string): Promise<Checkin[]>;
    getOne(id: number, userId: number): Promise<Checkin>;
    create(userId: number, input: CheckinInput): Promise<Checkin>;
    delete(id: number, userId: number): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=index.d.ts.map