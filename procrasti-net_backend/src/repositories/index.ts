import pool from '../db/connection.js';
import crypto from "crypto";
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

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
  weekdays?: string | string[] | null; // JSON in DB
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

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );
    return rows.length ? (rows[0] as User) : null;
  }

  async create(user: Partial<User>): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
        "INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)",
        [user.email, user.password_hash, user.display_name]
    );

    return result.insertId;
  }

  async findById(id: number): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT id, email, display_name, created_at FROM users WHERE id = ?",
        [id]
    );
    return rows.length ? (rows[0] as User) : null;
  }
}


export class SkillRepository {
  async getAll(category?: string, tag?: string): Promise<Skill[]> {
    let query = `
      SELECT
        s.id,
        s.name AS title,
        s.description,
        c.name AS category,
        CASE
          WHEN s.difficulty_level <= 1 THEN 'easy'
          WHEN s.difficulty_level <= 3 THEN 'medium'
          ELSE 'hard'
        END AS difficulty,
        s.created_at
      FROM skills s
      JOIN categories c ON c.id = s.category_id
    `;
    const params: string[] = [];
    if (tag) {
      query += `
        JOIN skill_tags st ON st.skill_id = s.id
        JOIN tags t ON t.id = st.tag_id
      `;
    }

    const conditions: string[] = [];
    if (category) {
      conditions.push(`c.name = ?`);
      params.push(category);
    }
    if (tag) {
      conditions.push(`t.name = ?`);
      params.push(tag);
    }
    if (conditions.length) query += ` WHERE ` + conditions.join(" AND ");

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return rows as Skill[];
  }

  async getOne(id: number): Promise<Skill | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
        `
      SELECT
        s.id,
        s.name AS title,
        s.description,
        c.name AS category,
        CASE
          WHEN s.difficulty_level <= 1 THEN 'easy'
          WHEN s.difficulty_level <= 3 THEN 'medium'
          ELSE 'hard'
        END AS difficulty,
        s.created_at
      FROM skills s
      JOIN categories c ON c.id = s.category_id
      WHERE s.id = ?
      `,
        [id]
    );
    if (!rows.length) return null;

    const skill = rows[0] as Skill;

    const [tagRows] = await pool.query<RowDataPacket[]>(
        `SELECT t.name
       FROM tags t
       JOIN skill_tags st ON st.tag_id = t.id
       WHERE st.skill_id = ?`,
        [id]
    );
    skill.tags = tagRows.map((r: RowDataPacket) => r.name as string);    return skill;
  }

  async create(skill: Partial<Skill>): Promise<number> {
    // We need a category_id. We'll create/find the category by name if provided.
    const categoryName = skill.category || "Unsorted";

    const [catRows] = await pool.query<RowDataPacket[]>(
        `SELECT id FROM categories WHERE name = ?`,
        [categoryName]
    );
    let categoryId: number;
    if (catRows && catRows.length > 0) {
      categoryId = catRows[0]!.id;
    } else {
      const [catRes] = await pool.query<ResultSetHeader>(
          `INSERT INTO categories (name) VALUES (?)`,
          [categoryName]
      );
      categoryId = catRes.insertId;
    }

    const difficultyLevel =
        skill.difficulty === "easy" ? 1 : skill.difficulty === "medium" ? 3 : 5;

    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO skills (category_id, name, description, difficulty_level)
       VALUES (?, ?, ?, ?)`,
        [categoryId, skill.title, skill.description, difficultyLevel]
    );
    return result.insertId;
  }

  async update(id: number, skill: Partial<Skill>): Promise<boolean> {
    const categoryName = skill.category || "Unsorted";

    const [catRows] = await pool.query<RowDataPacket[]>(
        `SELECT id FROM categories WHERE name = ?`,
        [categoryName]
    );
    let categoryId: number;
    if (catRows && catRows.length > 0) {
      categoryId = catRows[0]!.id;
    } else {
      const [catRes] = await pool.query<ResultSetHeader>(
          `INSERT INTO categories (name) VALUES (?)`,
          [categoryName]
      );
      categoryId = catRes.insertId;
    }

    const difficultyLevel =
        skill.difficulty === "easy" ? 1 : skill.difficulty === "medium" ? 3 : 5;

    const [result] = await pool.query<ResultSetHeader>(
        `UPDATE skills
       SET category_id = ?, name = ?, description = ?, difficulty_level = ?
       WHERE id = ?`,
        [categoryId, skill.title, skill.description, difficultyLevel, id]
    );
    return result.affectedRows > 0;
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
        `DELETE FROM skills WHERE id = ?`,
        [id]
    );
    return result.affectedRows > 0;
  }
}
export class TodoRepository {
  private mapStatusToDb(status?: string) {
    if (status === "completed") return "done";
    if (status === "open") return "todo";
    return undefined;
  }

  private mapStatusFromDb(status: string) {
    return status === "done" ? "completed" : "open";
  }

  private toDueAt(due_date?: Date | string | null): string | null {
    if (!due_date) return null;
    const s = String(due_date);
    // If user sends YYYY-MM-DD, store as noon to avoid timezone chaos
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s} 12:00:00`;
    // If ISO, MySQL will generally accept it, but strip Z if needed
    return s.replace("T", " ").replace("Z", "").slice(0, 19);
  }

  async getAll(userId: number, status?: string): Promise<Todo[]> {
    let query = `
      SELECT
        id,
        user_id,
        title,
        description AS notes,
        due_at AS due_date,
        energy_required AS priority,
        CASE
          WHEN status = 'done' THEN 'completed'
          ELSE 'open'
        END AS status,
        created_at,
        updated_at
      FROM tasks
      WHERE user_id = ?
    `;
    const params: (number | string)[] = [userId];
    const dbStatus = this.mapStatusToDb(status);
    if (dbStatus) {
      query += ` AND status = ?`;
      params.push(dbStatus);
    }

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return rows as Todo[];
  }

  async getOne(id: number, userId: number): Promise<Todo | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
        `
      SELECT
        id,
        user_id,
        title,
        description AS notes,
        due_at AS due_date,
        energy_required AS priority,
        CASE
          WHEN status = 'done' THEN 'completed'
          ELSE 'open'
        END AS status,
        created_at,
        updated_at
      FROM tasks
      WHERE id = ? AND user_id = ?
      `,
        [id, userId]
    );
    return rows.length ? (rows[0] as Todo) : null;
  }

  async create(todo: Partial<Todo>): Promise<number> {
    const dbStatus = todo.status === "completed" ? "done" : "todo";
    const dueAt = this.toDueAt(todo.due_date);
    const [result] = await pool.query<ResultSetHeader>(
        `
      INSERT INTO tasks (user_id, title, description, status, energy_required, due_at)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
        [
          todo.user_id,
          todo.title,
          todo.notes ?? null,
          dbStatus,
          todo.priority ?? "medium",
          dueAt,
        ]
    );
    return result.insertId;
  }

  async update(id: number, userId: number, todo: Partial<Todo>): Promise<boolean> {
    const dbStatus = todo.status === "completed" ? "done" : "todo";
    const dueAt = this.toDueAt(todo.due_date);
    const [result] = await pool.query<ResultSetHeader>(
        `
      UPDATE tasks
      SET title = ?, description = ?, due_at = ?, status = ?, energy_required = ?
      WHERE id = ? AND user_id = ?
      `,
        [
          todo.title,
          todo.notes ?? null,
          dueAt,
          dbStatus,
          todo.priority ?? "medium",
          id,
          userId,
        ]
    );
    return result.affectedRows > 0;
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
        `DELETE FROM tasks WHERE id = ? AND user_id = ?`,
        [id, userId]
    );
    return result.affectedRows > 0;
  }
}
export class RoutineRepository {
  async getAll(userId: number): Promise<Routine[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
        `
      SELECT
        id,
        user_id,
        title,
        recurrence_type AS schedule_type,
        weekdays,
        reminder_time,
        created_at
      FROM routines
      WHERE user_id = ?
      `,
        [userId]
    );
    return rows as Routine[];
  }

  async getOne(id: number, userId: number): Promise<Routine | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
        `
      SELECT
        id,
        user_id,
        title,
        recurrence_type AS schedule_type,
        weekdays,
        reminder_time,
        created_at
      FROM routines
      WHERE id = ? AND user_id = ?
      `,
        [id, userId]
    );
    return rows.length ? (rows[0] as Routine) : null;
  }

  async create(routine: Partial<Routine>): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
        `
      INSERT INTO routines (user_id, title, recurrence_type, weekdays, reminder_time)
      VALUES (?, ?, ?, ?, ?)
      `,
        [
          routine.user_id,
          routine.title,
          routine.schedule_type ?? "daily",
          routine.weekdays ? JSON.stringify(routine.weekdays) : null,
          routine.reminder_time ?? null,
        ]
    );
    return result.insertId;
  }

  async update(id: number, userId: number, routine: Partial<Routine>): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
        `
      UPDATE routines
      SET title = ?, recurrence_type = ?, weekdays = ?, reminder_time = ?
      WHERE id = ? AND user_id = ?
      `,
        [
          routine.title,
          routine.schedule_type ?? "daily",
          routine.weekdays ? JSON.stringify(routine.weekdays) : null,
          routine.reminder_time ?? null,
          id,
          userId,
        ]
    );
    return result.affectedRows > 0;
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
        `DELETE FROM routines WHERE id = ? AND user_id = ?`,
        [id, userId]
    );
    return result.affectedRows > 0;
  }

  async complete(routineId: number, userId: number, date: string, done: boolean, note?: string): Promise<number> {
    if (!date) throw new Error("date is required (YYYY-MM-DD)");

    if (!done) {
      const [delRes] = await pool.query<ResultSetHeader>(
          `DELETE FROM routine_logs
         WHERE routine_id = ? AND user_id = ? AND done_date = ?`,
          [routineId, userId, date]
      );
      return delRes.affectedRows;
    }

    // Put done_at at noon so timezone weirdness doesn't shift the date
    const doneAt = `${date} 12:00:00`;

    const [result] = await pool.query<ResultSetHeader>(
        `
      INSERT INTO routine_logs (routine_id, user_id, done_at, note)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE done_at = VALUES(done_at), note = VALUES(note)
      `,
        [routineId, userId, doneAt, note ?? null]
    );
    return result.insertId;
  }
}
export class CheckinRepository {
  async getAll(userId: number, from?: string, to?: string): Promise<Checkin[]> {
    let query = `
      SELECT
        id,
        user_id,
        DATE(logged_at) AS date,
        tension_level AS mood,
        energy_level AS energy,
        note,
        logged_at AS created_at
      FROM state_logs
      WHERE user_id = ?
    `;
    const params: (number | string)[] = [userId];
    if (from) {
      query += ` AND DATE(logged_at) >= ?`;
      params.push(from);
    }
    if (to) {
      query += ` AND DATE(logged_at) <= ?`;
      params.push(to);
    }

    query += ` ORDER BY logged_at DESC`;

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return rows as Checkin[];
  }

  async getOne(id: number, userId: number): Promise<Checkin | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
        `
      SELECT
        id,
        user_id,
        DATE(logged_at) AS date,
        tension_level AS mood,
        energy_level AS energy,
        note,
        logged_at AS created_at
      FROM state_logs
      WHERE id = ? AND user_id = ?
      `,
        [id, userId]
    );
    return rows.length ? (rows[0] as Checkin) : null;
  }

  async create(checkin: Partial<Checkin>): Promise<number> {
    // store at noon to avoid timezone shifting the date
    const loggedAt = checkin.date ? `${checkin.date} 12:00:00` : new Date();

    const [result] = await pool.query<ResultSetHeader>(
        `
      INSERT INTO state_logs
        (user_id, state_id, tension_level, energy_level, logged_at, note)
      VALUES
        (?, 1, ?, ?, ?, ?)
      `,
        [
          checkin.user_id,
          checkin.mood,
          checkin.energy,
          loggedAt,
          checkin.note ?? null,
        ]
    );

    return result.insertId;
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
        `DELETE FROM state_logs WHERE id = ? AND user_id = ?`,
        [id, userId]
    );
    return result.affectedRows > 0;
  }
}