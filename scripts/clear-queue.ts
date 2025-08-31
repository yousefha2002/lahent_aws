import Queue from 'bull';
import * as dotenv from 'dotenv';
dotenv.config();

async function clearQueue() {
    try {
        const queue = new Queue('orders', {
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
