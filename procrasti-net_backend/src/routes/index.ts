import { Router } from 'express';
import { 
  AuthController, SkillController, TodoController, RoutineController, CheckinController 
} from '../controllers/index.js';
import { config } from '../config/index.js';
import jwt from 'jsonwebtoken';

const router = Router();
const authController = new AuthController();
const skillController = new SkillController();
const todoController = new TodoController();
const routineController = new RoutineController();
const checkinController = new CheckinController();

const JWT_SECRET = config.jwtSecret;

// Middleware for authentication
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log(`Unauthorized access attempt to ${req.method} ${req.url} - no token provided`);
    return res.status(401).json({ error: 'No token provided', message: 'Authorization header required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.log(`Invalid token for ${req.method} ${req.url}:`, err.message);
      return res.status(403).json({ error: 'Invalid token', message: err.message });
    }
    req.user = user;
    next();
  });
};

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authenticateToken, authController.getCurrentUser);

// Skills routes
router.get('/skills', skillController.getAll);
router.get('/skills/:id', skillController.getOne);
router.post('/skills', authenticateToken, skillController.create); // Optional: only admin
router.put('/skills/:id', authenticateToken, skillController.update);
router.delete('/skills/:id', authenticateToken, skillController.delete);

// Todos routes
router.get('/todos', authenticateToken, todoController.getAll);
router.get('/todos/:id', authenticateToken, todoController.getOne);
router.post('/todos', authenticateToken, todoController.create);
router.put('/todos/:id', authenticateToken, todoController.update);
router.delete('/todos/:id', authenticateToken, todoController.delete);

// Routines routes
router.get('/routines', authenticateToken, routineController.getAll);
router.get('/routines/:id', authenticateToken, routineController.getOne);
router.post('/routines', authenticateToken, routineController.create);
router.put('/routines/:id', authenticateToken, routineController.update);
router.delete('/routines/:id', authenticateToken, routineController.delete);
router.post('/routines/:id/complete', authenticateToken, routineController.complete);

// Checkins routes
router.get('/checkins', authenticateToken, checkinController.getAll);
router.get('/checkins/:id', authenticateToken, checkinController.getOne);
router.post('/checkins', authenticateToken, checkinController.create);
router.delete('/checkins/:id', authenticateToken, checkinController.delete);

export default router;
