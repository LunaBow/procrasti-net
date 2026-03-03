import type { Request, Response } from 'express';
import {
  AuthService, SkillService, TodoService, RoutineService, CheckinService
} from '../services/index.js';
import {
  userSchema, loginSchema, skillSchema, todoSchema, routineSchema, checkinSchema
} from '../schemas/validation.js';

const authService = new AuthService();
const skillService = new SkillService();
const todoService = new TodoService();
const routineService = new RoutineService();
const checkinService = new CheckinService();

interface AuthRequest extends Request {
  user?: { id: number }
}

export class AuthController {
  async register(req: AuthRequest, res: Response) {
    try {
      const validatedData = userSchema.parse(req.body);
      const result = await authService.register(validatedData);
      res.status(201).json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'Validation failed', details: error });
      }
    }
  }

  async login(req: AuthRequest, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData);
      res.json(result);
    } catch (error: unknown) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(400).json({ error: 'Login failed', details: error });
    }
  }

  async getCurrentUser(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'No user ID in token' });
      }
      const user = await authService.findUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error: unknown) {
      console.error('getCurrentUser error:', error);
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to get current user' });
      }
    }
  }
}

export class SkillController {
  async getAll(req: Request, res: Response) {
    try {
      const { category, tag } = req.query;
      const skills = await skillService.getAll(category as string, tag as string);
      res.json(skills);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Unknown server error' });
      }
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const skill = await skillService.getOne(Number(req.params.id));
      res.json(skill);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(404).json({ error: 'Unknown server error' });
      }
    }
  }

  async create(req: Request, res: Response) {
    try {
      const validatedData = skillSchema.parse(req.body);
      const skill = await skillService.create(validatedData);
      res.status(201).json(skill);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'Validation failed', details: error });
      }
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const validatedData = skillSchema.parse(req.body);
      const skill = await skillService.update(Number(req.params.id), validatedData);
      res.json(skill);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'Validation failed', details: error });
      }
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const result = await skillService.delete(Number(req.params.id));
      res.json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'Unknown server error' });
      }
    }
  }
}

export class TodoController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { status } = req.query;
      const todos = await todoService.getAll(userId, status as string);
      res.json(todos);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Unknown server error' });
      }
    }
  }

  async getOne(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const todo = await todoService.getOne(Number(req.params.id), userId);
      res.json(todo);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(404).json({ error: 'Unknown server error' });
      }
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const validatedData = todoSchema.parse(req.body);
      const todo = await todoService.create(userId, validatedData);
      res.status(201).json(todo);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'Validation failed', details: error });
      }
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const validatedData = todoSchema.parse(req.body);
      const todo = await todoService.update(Number(req.params.id), userId, validatedData);
      res.json(todo);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'Validation failed', details: error });
      }
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const result = await todoService.delete(Number(req.params.id), userId);
      res.json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'Unknown server error' });
      }
    }
  }
}

export class RoutineController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const routines = await routineService.getAll(userId);
      res.json(routines);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Unknown server error' });
      }
    }
  }

  async getOne(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const routine = await routineService.getOne(Number(req.params.id), userId);
      res.json(routine);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(404).json({ error: 'Unknown server error' });
      }
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const validatedData = routineSchema.parse(req.body);
      const routine = await routineService.create(userId, validatedData);
      res.status(201).json(routine);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'Validation failed', details: error });
      }
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const validatedData = routineSchema.parse(req.body);
      const routine = await routineService.update(Number(req.params.id), userId, validatedData);
      res.json(routine);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'Validation failed', details: error });
      }
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const result = await routineService.delete(Number(req.params.id), userId);
      res.json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'Unknown server error' });
      }
    }
  }

  async complete(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { date, done, note } = req.body;
      const result = await routineService.complete(Number(req.params.id), userId, date, done, note);
      res.json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'Unknown server error' });
      }
    }
  }
}

export class CheckinController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { from, to } = req.query;
      const checkins = await checkinService.getAll(userId, from as string, to as string);
      res.json(checkins);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Unknown server error' });
      }
    }
  }

  async getOne(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const checkin = await checkinService.getOne(Number(req.params.id), userId);
      res.json(checkin);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(404).json({ error: 'Unknown server error' });
      }
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const validatedData = checkinSchema.parse(req.body);
      const checkin = await checkinService.create(userId, validatedData);
      res.status(201).json(checkin);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'Validation failed', details: error });
      }
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const result = await checkinService.delete(Number(req.params.id), userId);
      res.json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'Unknown server error' });
      }
    }
  }
}