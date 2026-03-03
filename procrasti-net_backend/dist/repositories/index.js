import pool from '../db/connection.js';
import crypto from "crypto";
export class UserRepository {
    async findByEmail(email) {
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        return rows.length ? rows[0] : null;
    }
    async create(user) {
        const [result] = await pool.query("INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)", [user.email, user.password_hash, user.display_name]);
        return result.insertId;
    }
    async findById(id) {
        const [rows] = await pool.query("SELECT id, email, display_name, created_at FROM users WHERE id = ?", [id]);
        return rows.length ? rows[0] : null;
    }
}
export class SkillRepository {
    async getAll(category, tag) {
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
        const params = [];
        if (tag) {
            query += `
        JOIN skill_tags st ON st.skill_id = s.id
        JOIN tags t ON t.id = st.tag_id
      `;
        }
        const conditions = [];
        if (category) {
            conditions.push(`c.name = ?`);
            params.push(category);
        }
        if (tag) {
            conditions.push(`t.name = ?`);
            params.push(tag);
        }
        if (conditions.length)
            query += ` WHERE ` + conditions.join(" AND ");
        const [rows] = await pool.query(query, params);
        return rows;
    }
    async getOne(id) {
        const [rows] = await pool.query(`
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
      `, [id]);
        if (!rows.length)
            return null;
        const skill = rows[0];
        const [tagRows] = await pool.query(`SELECT t.name
       FROM tags t
       JOIN skill_tags st ON st.tag_id = t.id
       WHERE st.skill_id = ?`, [id]);
        skill.tags = tagRows.map((r) => r.name);
        return skill;
    }
    async create(skill) {
        // We need a category_id. We'll create/find the category by name if provided.
        const categoryName = skill.category || "Unsorted";
        const [catRows] = await pool.query(`SELECT id FROM categories WHERE name = ?`, [categoryName]);
        let categoryId;
        if (catRows && catRows.length > 0) {
            categoryId = catRows[0].id;
        }
        else {
            const [catRes] = await pool.query(`INSERT INTO categories (name) VALUES (?)`, [categoryName]);
            categoryId = catRes.insertId;
        }
        const difficultyLevel = skill.difficulty === "easy" ? 1 : skill.difficulty === "medium" ? 3 : 5;
        const [result] = await pool.query(`INSERT INTO skills (category_id, name, description, difficulty_level)
       VALUES (?, ?, ?, ?)`, [categoryId, skill.title, skill.description, difficultyLevel]);
        return result.insertId;
    }
    async update(id, skill) {
        const categoryName = skill.category || "Unsorted";
        const [catRows] = await pool.query(`SELECT id FROM categories WHERE name = ?`, [categoryName]);
        let categoryId;
        if (catRows && catRows.length > 0) {
            categoryId = catRows[0].id;
        }
        else {
            const [catRes] = await pool.query(`INSERT INTO categories (name) VALUES (?)`, [categoryName]);
            categoryId = catRes.insertId;
        }
        const difficultyLevel = skill.difficulty === "easy" ? 1 : skill.difficulty === "medium" ? 3 : 5;
        const [result] = await pool.query(`UPDATE skills
       SET category_id = ?, name = ?, description = ?, difficulty_level = ?
       WHERE id = ?`, [categoryId, skill.title, skill.description, difficultyLevel, id]);
        return result.affectedRows > 0;
    }
    async delete(id) {
        const [result] = await pool.query(`DELETE FROM skills WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }
}
export class TodoRepository {
    mapStatusToDb(status) {
        if (status === "completed")
            return "done";
        if (status === "open")
            return "todo";
        return undefined;
    }
    mapStatusFromDb(status) {
        return status === "done" ? "completed" : "open";
    }
    toDueAt(due_date) {
        if (!due_date)
            return null;
        const s = String(due_date);
        // If user sends YYYY-MM-DD, store as noon to avoid timezone chaos
        if (/^\d{4}-\d{2}-\d{2}$/.test(s))
            return `${s} 12:00:00`;
        // If ISO, MySQL will generally accept it, but strip Z if needed
        return s.replace("T", " ").replace("Z", "").slice(0, 19);
    }
    async getAll(userId, status) {
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
        const params = [userId];
        const dbStatus = this.mapStatusToDb(status);
        if (dbStatus) {
            query += ` AND status = ?`;
            params.push(dbStatus);
        }
        const [rows] = await pool.query(query, params);
        return rows;
    }
    async getOne(id, userId) {
        const [rows] = await pool.query(`
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
      `, [id, userId]);
        return rows.length ? rows[0] : null;
    }
    async create(todo) {
        const dbStatus = todo.status === "completed" ? "done" : "todo";
        const dueAt = this.toDueAt(todo.due_date);
        const [result] = await pool.query(`
      INSERT INTO tasks (user_id, title, description, status, energy_required, due_at)
      VALUES (?, ?, ?, ?, ?, ?)
      `, [
            todo.user_id,
            todo.title,
            todo.notes ?? null,
            dbStatus,
            todo.priority ?? "medium",
            dueAt,
        ]);
        return result.insertId;
    }
    async update(id, userId, todo) {
        const dbStatus = todo.status === "completed" ? "done" : "todo";
        const dueAt = this.toDueAt(todo.due_date);
        const [result] = await pool.query(`
      UPDATE tasks
      SET title = ?, description = ?, due_at = ?, status = ?, energy_required = ?
      WHERE id = ? AND user_id = ?
      `, [
            todo.title,
            todo.notes ?? null,
            dueAt,
            dbStatus,
            todo.priority ?? "medium",
            id,
            userId,
        ]);
        return result.affectedRows > 0;
    }
    async delete(id, userId) {
        const [result] = await pool.query(`DELETE FROM tasks WHERE id = ? AND user_id = ?`, [id, userId]);
        return result.affectedRows > 0;
    }
}
export class RoutineRepository {
    async getAll(userId) {
        const [rows] = await pool.query(`
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
      `, [userId]);
        return rows;
    }
    async getOne(id, userId) {
        const [rows] = await pool.query(`
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
      `, [id, userId]);
        return rows.length ? rows[0] : null;
    }
    async create(routine) {
        const [result] = await pool.query(`
      INSERT INTO routines (user_id, title, recurrence_type, weekdays, reminder_time)
      VALUES (?, ?, ?, ?, ?)
      `, [
            routine.user_id,
            routine.title,
            routine.schedule_type ?? "daily",
            routine.weekdays ? JSON.stringify(routine.weekdays) : null,
            routine.reminder_time ?? null,
        ]);
        return result.insertId;
    }
    async update(id, userId, routine) {
        const [result] = await pool.query(`
      UPDATE routines
      SET title = ?, recurrence_type = ?, weekdays = ?, reminder_time = ?
      WHERE id = ? AND user_id = ?
      `, [
            routine.title,
            routine.schedule_type ?? "daily",
            routine.weekdays ? JSON.stringify(routine.weekdays) : null,
            routine.reminder_time ?? null,
            id,
            userId,
        ]);
        return result.affectedRows > 0;
    }
    async delete(id, userId) {
        const [result] = await pool.query(`DELETE FROM routines WHERE id = ? AND user_id = ?`, [id, userId]);
        return result.affectedRows > 0;
    }
    async complete(routineId, userId, date, done, note) {
        if (!date)
            throw new Error("date is required (YYYY-MM-DD)");
        if (!done) {
            const [delRes] = await pool.query(`DELETE FROM routine_logs
         WHERE routine_id = ? AND user_id = ? AND done_date = ?`, [routineId, userId, date]);
            return delRes.affectedRows;
        }
        // Put done_at at noon so timezone weirdness doesn't shift the date
        const doneAt = `${date} 12:00:00`;
        const [result] = await pool.query(`
      INSERT INTO routine_logs (routine_id, user_id, done_at, note)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE done_at = VALUES(done_at), note = VALUES(note)
      `, [routineId, userId, doneAt, note ?? null]);
        return result.insertId;
    }
}
export class CheckinRepository {
    async getAll(userId, from, to) {
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
        const params = [userId];
        if (from) {
            query += ` AND DATE(logged_at) >= ?`;
            params.push(from);
        }
        if (to) {
            query += ` AND DATE(logged_at) <= ?`;
            params.push(to);
        }
        query += ` ORDER BY logged_at DESC`;
        const [rows] = await pool.query(query, params);
        return rows;
    }
    async getOne(id, userId) {
        const [rows] = await pool.query(`
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
      `, [id, userId]);
        return rows.length ? rows[0] : null;
    }
    async create(checkin) {
        // store at noon to avoid timezone shifting the date
        const loggedAt = checkin.date ? `${checkin.date} 12:00:00` : new Date();
        const [result] = await pool.query(`
      INSERT INTO state_logs
        (user_id, state_id, tension_level, energy_level, logged_at, note)
      VALUES
        (?, 1, ?, ?, ?, ?)
      `, [
            checkin.user_id,
            checkin.mood,
            checkin.energy,
            loggedAt,
            checkin.note ?? null,
        ]);
        return result.insertId;
    }
    async delete(id, userId) {
        const [result] = await pool.query(`DELETE FROM state_logs WHERE id = ? AND user_id = ?`, [id, userId]);
        return result.affectedRows > 0;
    }
}
//# sourceMappingURL=index.js.map