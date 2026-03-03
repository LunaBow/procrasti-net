import express from 'express';
import cors from 'cors';
import router from './routes/index.js';
const app = express();
app.use(cors({
    origin: [
        "https://mt231043-10996.node.ustp.cloud", // <--- The new frontend
        "https://mt231043-10993.node.ustp.cloud", // <--- The old frontend
        "http://localhost:5173",
        "http://localhost:4321"
    ], credentials: true
}));
// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const auth = req.headers['authorization'] ? '✓ with token' : '✗ no token';
    console.log(`[${timestamp}] ${method} ${url} ${auth}`);
    next();
});
app.use(express.json());
app.use(express.static('public'));
app.use('/api', router);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `${req.method} ${req.url} not found`,
        timestamp: new Date().toISOString()
    });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        timestamp: new Date().toISOString()
    });
});
export default app;
//# sourceMappingURL=app.js.map