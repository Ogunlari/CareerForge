import mongoose from 'mongoose';
import { env } from './env.js';

let connected = false;

export async function connectDatabase(): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.DATABASE_URL);
  connected = true;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  connected = false;
}

export function isDatabaseConnected(): boolean {
  return connected && mongoose.connection.readyState === 1;
}
