import { z } from 'zod';
export declare const userSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    display_name: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const skillSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    difficulty: z.ZodDefault<z.ZodEnum<{
        easy: "easy";
        medium: "medium";
        hard: "hard";
    }>>;
}, z.core.$strip>;
export declare const todoSchema: z.ZodObject<{
    title: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    due_date: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<{
        open: "open";
        completed: "completed";
    }>>;
    priority: z.ZodDefault<z.ZodEnum<{
        medium: "medium";
        low: "low";
        high: "high";
    }>>;
}, z.core.$strip>;
export declare const routineSchema: z.ZodObject<{
    title: z.ZodString;
    schedule_type: z.ZodDefault<z.ZodEnum<{
        daily: "daily";
        weekly: "weekly";
    }>>;
    weekdays: z.ZodOptional<z.ZodArray<z.ZodString>>;
    reminder_time: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const checkinSchema: z.ZodObject<{
    date: z.ZodString;
    mood: z.ZodNumber;
    energy: z.ZodNumber;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UserInput = z.infer<typeof userSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type TodoInput = z.infer<typeof todoSchema>;
export type RoutineInput = z.infer<typeof routineSchema>;
export type CheckinInput = z.infer<typeof checkinSchema>;
//# sourceMappingURL=validation.d.ts.map