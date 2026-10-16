import { MongoMemoryServer } from 'mongodb-memory-server';
import { spawn } from 'child_process';

async function startDevServer() {
  console.log('Starting MongoDB Memory Server...');
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  console.log('MongoDB Memory Server started at:', mongoUri);
  
  process.env.MONGO_URL = mongoUri;
  
  console.log('Starting backend server...');
  const server = spawn('node', ['index.js'], {
    env: { ...process.env, MONGO_URL: mongoUri },
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  process.on('SIGINT', async () => {
    console.log('Shutting down...');
    server.kill();
    await mongoServer.stop();
    process.exit(0);
  });
}

startDevServer();
