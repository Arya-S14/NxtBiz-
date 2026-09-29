import { app } from './app.js';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { configureOrchestrationQueue } from './queues/orchestration.js';
import { seedDemoData } from './seed.js';

await connectDatabase();
await seedDemoData();
const server = createServer(app);
const io = new Server(server, { cors: { origin: env.clientOrigin, credentials: true } });
app.set('io', io);
configureOrchestrationQueue(app);
server.listen(env.port, () => console.info(`NxtBiz API listening on port ${env.port}.`));
