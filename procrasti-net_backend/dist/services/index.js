import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserRepository, SkillRepository, TodoRepository, RoutineRepository, CheckinRepository } from '../repositories/index.js';
import { config } from '../config/index.js';
const JWT_SECRET = config.jwtSecret;
export class AuthService {
    userRepository = new UserRepository();
    async register(input) {
        const existingUser = await this.userRepository.findByEmail(input.email);
        if (existingUser) {
            throw new Error('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(input.password, 10);
        const displayName = input.display_name ?? (input.email.split('@')[0] || 'User');
        const id = await this.userRepository.create({
            email: input.email,
            password_hash: hashedPassword,
            display_name: displayName,
        });
        const user = {
            id,
            email: input.email,
            display_name: displayName,
            created_at: new Date()
        };
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: '24h',
        });
        return { user, token };
    }
    async login(input) {
        const user = await this.userRepository.findByEmail(input.email);
        if (!user || !user.password_hash) {
            throw new Error('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(input.password, user.password_hash);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }
        const { password_hash, ...userWithoutPassword } = user;
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        return { user: userWithoutPassword, token };
    }
    async findUserById(id) {
        return this.userRepository.findById(id);
    }
}
export class SkillService {
    skillRepository = new SkillRepository();
    async getAll(category, tag) {
        return this.skillRepository.getAll(category, tag);
    }
    async getOne(id) {
        const skill = await this.skillRepository.getOne(id);
        if (!skill)
            throw new Error('Skill not found');
        return skill;
    }
    async create(input) {
        const id = await this.skillRepository.create({
            title: input.title,
            description: input.description ?? null,
            category: input.category ?? null,
            difficulty: input.difficulty,
        });
        return this.getOne(id);
    }
    async update(id, input) {
        const success = await this.skillRepository.update(id, {
            title: input.title,
            description: input.description ?? null,
            category: input.category ?? null,
            difficulty: input.difficulty,
        });
        if (!success)
            throw new Error('Skill not found or update failed');
        return this.getOne(id);
    }
    async delete(id) {
        const success = await this.skillRepository.delete(id);
        if (!success)
            throw new Error('Skill not found or delete failed');
        return { message: 'Skill deleted successfully' };
    }
}
export class TodoService {
    todoRepository = new TodoRepository();
    async getAll(userId, status) {
        return this.todoRepository.getAll(userId, status);
    }
    async getOne(id, userId) {
        const todo = await this.todoRepository.getOne(id, userId);
        if (!todo)
            throw new Error('Todo not found');
        return todo;
    }
    async create(userId, input) {
        const id = await this.todoRepository.create({
            user_id: userId,
            title: input.title,
            notes: input.notes ?? null,
            due_date: input.due_date ? new Date(input.due_date) : null,
            status: input.status,
            priority: input.priority,
        });
        return this.getOne(id, userId);
    }
    async update(id, userId, input) {
        const success = await this.todoRepository.update(id, userId, {
            title: input.title,
            notes: input.notes ?? null,
            due_date: input.due_date ? new Date(input.due_date) : null,
            status: input.status,
            priority: input.priority,
        });
        if (!success)
            throw new Error('Todo not found or update failed');
        return this.getOne(id, userId);
    }
    async delete(id, userId) {
        const success = await this.todoRepository.delete(id, userId);
        if (!success)
            throw new Error('Todo not found or delete failed');
        return { message: 'Todo deleted successfully' };
    }
}
export class RoutineService {
    routineRepository = new RoutineRepository();
    async getAll(userId) {
        return this.routineRepository.getAll(userId);
    }
    async getOne(id, userId) {
        const routine = await this.routineRepository.getOne(id, userId);
        if (!routine)
            throw new Error('Routine not found');
        return routine;
    }
    async create(userId, input) {
        const id = await this.routineRepository.create({
            user_id: userId,
            title: input.title,
            schedule_type: input.schedule_type,
            weekdays: input.weekdays ?? null,
            reminder_time: input.reminder_time ?? null,
        });
        return this.getOne(id, userId);
    }
    async update(id, userId, input) {
        const success = await this.routineRepository.update(id, userId, {
            title: input.title,
            schedule_type: input.schedule_type,
            weekdays: input.weekdays ?? null,
            reminder_time: input.reminder_time ?? null,
        });
        if (!success)
            throw new Error('Routine not found or update failed');
        return this.getOne(id, userId);
    }
    async delete(id, userId) {
        const success = await this.routineRepository.delete(id, userId);
        if (!success)
            throw new Error('Routine not found or delete failed');
        return { message: 'Routine deleted successfully' };
    }
    async complete(id, userId, date, done, note) {
        // Verify routine belongs to user
        const routine = await this.routineRepository.getOne(id, userId);
        if (!routine)
            throw new Error('Routine not found or access denied');
        await this.routineRepository.complete(id, userId, date, done, note);
        return { message: 'Routine completion recorded' };
    }
}
export class CheckinService {
    checkinRepository = new CheckinRepository();
    async getAll(userId, from, to) {
        return this.checkinRepository.getAll(userId, from, to);
    }
    async getOne(id, userId) {
        const checkin = await this.checkinRepository.getOne(id, userId);
        if (!checkin)
            throw new Error('Checkin not found');
        return checkin;
    }
    async create(userId, input) {
        const id = await this.checkinRepository.create({
            user_id: userId,
            date: new Date(input.date),
            mood: input.mood,
            energy: input.energy,
            note: input.note ?? null,
        });
        return this.getOne(id, userId);
    }
    async delete(id, userId) {
        const success = await this.checkinRepository.delete(id, userId);
        if (!success)
            throw new Error('Checkin not found or delete failed');
        return { message: 'Checkin deleted successfully' };
    }
}
//# sourceMappingURL=index.js.map