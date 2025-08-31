// scripts/clear-queue.ts
import * as dotenv from 'dotenv';
dotenv.config();

import Bull from 'bull'; // استيراد صحيح لإصدار Bull الحالي

async function clearQueue() {
  try {
    const queue = new Bull('orders', {
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        tls: {}, // ضروري لو AWS MemoryDB
      },
    });

    await queue.obliterate({ force: true });
    console.log('Queue cleared successfully!');
  } catch (err) {
    console.error('Failed to clear queue:', err);
  } finally {
    process.exit(0);
  }
}

clearQueue();
