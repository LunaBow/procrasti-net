import { z } from 'zod';

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  display_name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const skillSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('easy'),
});

export const todoSchema = z.object({
  title: z.string().min(1),
  notes: z.string().optional(),
  due_date: z.string().optional(), // Expected as ISO string or YYYY-MM-DD
  status: z.enum(['open', 'completed']).default('open'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

export const routineSchema = z.object({
  title: z.string().min(1),
  schedule_type: z.enum(['daily', 'weekly']).default('daily'),
  weekdays: z.array(z.string()).optional(),
  reminder_time: z.string().optional(), // HH:MM:SS
});

export const checkinSchema = z.object({
  date: z.string(), // YYYY-MM-DD
  mood: z.number().min(1).max(10),
  energy: z.number().min(1).max(10),
  note: z.string().optional(),
});

export type UserInput = z.infer<typeof userSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type TodoInput = z.infer<typeof todoSchema>;
export type RoutineInput = z.infer<typeof routineSchema>;
export type CheckinInput = z.infer<typeof checkinSchema>;
