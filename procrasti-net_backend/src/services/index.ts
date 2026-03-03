import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { 
  UserRepository, SkillRepository, TodoRepository, RoutineRepository, CheckinRepository 
} from '../repositories/index.js';
import type { User, Skill, Todo, Routine, Checkin } from '../repositories/index.js';
import type { 
  UserInput, LoginInput, SkillInput, TodoInput, RoutineInput, CheckinInput 
} from '../schemas/validation.js';

import { config } from '../config/index.js';

const JWT_SECRET = config.jwtSecret;

export class AuthService {
  private userRepository = new UserRepository();

  async register(input: UserInput): Promise<{ user: User; token: string }> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const displayName: string = input.display_name ?? (input.email.split('@')[0] || 'User');
    const id = await this.userRepository.create({
      email: input.email,
      password_hash: hashedPassword,
      display_name: displayName,
    });

    const user: User = { 
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

  async login(input: LoginInput): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user || !user.password_hash) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const { password_hash, ...userWithoutPassword } = user;
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { user: userWithoutPassword as User, token };
  }

  async findUserById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }
}

export class SkillService {
  private skillRepository = new SkillRepository();

  async getAll(category?: string, tag?: string) {
    return this.skillRepository.getAll(category, tag);
  }

  async getOne(id: number) {
    const skill = await this.skillRepository.getOne(id);
    if (!skill) throw new Error('Skill not found');
    return skill;
  }

  async create(input: SkillInput) {
    const id = await this.skillRepository.create({
      title: input.title,
      description: input.description ?? null,
      category: input.category ?? null,
      difficulty: input.difficulty,
    });
    return this.getOne(id);
  }

  async update(id: number, input: SkillInput) {
    const success = await this.skillRepository.update(id, {
      title: input.title,
      description: input.description ?? null,
      category: input.category ?? null,
      difficulty: input.difficulty,
    });
    if (!success) throw new Error('Skill not found or update failed');
    return this.getOne(id);
  }

  async delete(id: number) {
    const success = await this.skillRepository.delete(id);
    if (!success) throw new Error('Skill not found or delete failed');
    return { message: 'Skill deleted successfully' };
  }
}

export class TodoService {
  private todoRepository = new TodoRepository();

  async getAll(userId: number, status?: string) {
    return this.todoRepository.getAll(userId, status);
  }

  async getOne(id: number, userId: number) {
    const todo = await this.todoRepository.getOne(id, userId);
    if (!todo) throw new Error('Todo not found');
    return todo;
  }

  async create(userId: number, input: TodoInput) {
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

  async update(id: number, userId: number, input: TodoInput) {
    const success = await this.todoRepository.update(id, userId, {
      title: input.title,
      notes: input.notes ?? null,
      due_date: input.due_date ? new Date(input.due_date) : null,
      status: input.status,
      priority: input.priority,
    });
    if (!success) throw new Error('Todo not found or update failed');
    return this.getOne(id, userId);
  }

  async delete(id: number, userId: number) {
    const success = await this.todoRepository.delete(id, userId);
    if (!success) throw new Error('Todo not found or delete failed');
    return { message: 'Todo deleted successfully' };
  }
}

export class RoutineService {
  private routineRepository = new RoutineRepository();

  async getAll(userId: number) {
    return this.routineRepository.getAll(userId);
  }

  async getOne(id: number, userId: number) {
    const routine = await this.routineRepository.getOne(id, userId);
    if (!routine) throw new Error('Routine not found');
    return routine;
  }

  async create(userId: number, input: RoutineInput) {
    const id = await this.routineRepository.create({
      user_id: userId,
      title: input.title,
      schedule_type: input.schedule_type,
      weekdays: input.weekdays ?? null,
      reminder_time: input.reminder_time ?? null,
    });
    return this.getOne(id, userId);
  }

  async update(id: number, userId: number, input: RoutineInput) {
    const success = await this.routineRepository.update(id, userId, {
      title: input.title,
      schedule_type: input.schedule_type,
      weekdays: input.weekdays ?? null,
      reminder_time: input.reminder_time ?? null,
    });
    if (!success) throw new Error('Routine not found or update failed');
    return this.getOne(id, userId);
  }

  async delete(id: number, userId: number) {
    const success = await this.routineRepository.delete(id, userId);
    if (!success) throw new Error('Routine not found or delete failed');
    return { message: 'Routine deleted successfully' };
  }

  async complete(id: number, userId: number, date: string, done: boolean, note?: string) {
    // Verify routine belongs to user
    const routine = await this.routineRepository.getOne(id, userId);
    if (!routine) throw new Error('Routine not found or access denied');

    await this.routineRepository.complete(id, userId, date, done, note);
    return { message: 'Routine completion recorded' };
  }
}

export class CheckinService {
  private checkinRepository = new CheckinRepository();

  async getAll(userId: number, from?: string, to?: string) {
    return this.checkinRepository.getAll(userId, from, to);
  }

  async getOne(id: number, userId: number) {
    const checkin = await this.checkinRepository.getOne(id, userId);
    if (!checkin) throw new Error('Checkin not found');
    return checkin;
  }

  async create(userId: number, input: CheckinInput) {
    const id = await this.checkinRepository.create({
      user_id: userId,
      date: new Date(input.date),
      mood: input.mood,
      energy: input.energy,
      note: input.note ?? null,
    });
    return this.getOne(id, userId);
  }

  async delete(id: number, userId: number) {
    const success = await this.checkinRepository.delete(id, userId);
    if (!success) throw new Error('Checkin not found or delete failed');
    return { message: 'Checkin deleted successfully' };
  }
}
