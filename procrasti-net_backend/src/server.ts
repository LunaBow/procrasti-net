import { config } from './config/index.js';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import app from './app.js';
import pool from './db/connection.js';

// Respect hosting-provided PORT, fall back to config.port
const PORT = Number(process.env.PORT ?? config.port);
// Bind to all interfaces so nginx/proxy can connect
const HOST = "0.0.0.0";

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

wss.on('connection', (ws) => {
    console.log('A user connected');

    ws.on('message', (message) => {
        try {
            const parsed = JSON.parse(message.toString());
            console.log('Message received:', parsed);

            let response;
            if (parsed.event === 'message') {
                response = {
                    event: 'message',
                    data: {
                        user_id: parsed.user_id,
                        message: parsed.message
                    }
                };
            } else if (parsed.event === 'startTyping' || parsed.event === 'stopTyping') {
                response = {
                    event: parsed.event,
                    data: {
                        user_id: parsed.user_id
                    }
                };
            }

            if (response) {
                const payload = JSON.stringify(response);
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(payload);
                    }
                });
            }
        } catch (error) {
            console.error('Error handling websocket message:', error);
        }
    });

    ws.on('close', () => {
        console.log('User disconnected');
    });
});

httpServer.listen(PORT, HOST, async () => {
    console.log(`===========================================`);
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`===========================================`);

    try {
        const connection = await pool.getConnection();
        console.log("✓ Successfully connected to the MySQL database!");
        connection.release();
    } catch (error) {
        console.error("✗ Error connecting to the database:", error);
        console.error("Server will keep running, but API calls needing DB will fail.");
        // DO NOT exit here pls
    }
});