import { Worker, Job } from 'bullmq';
import { ConnectionOptions } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const connection: ConnectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

// Example worker for processing claims
// This can be extended to auto-ingest from social media, RSS feeds, etc.
export function createClaimWorker() {
  const worker = new Worker(
    'claim-processing',
    async (job: Job) => {
      console.log(`Processing claim job ${job.id}`, job.data);
      
      // Example: Process claim ingestion
      // This is where you would add logic for:
      // - Auto-ingesting from Twitter/X
      // - Processing RSS feeds
      // - Scraping YouTube videos
      // - Validating and enriching claims
      
      return { success: true, jobId: job.id };
    },
    {
      connection,
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
  });

  return worker;
}

// Start workers if this file is run directly
if (require.main === module) {
  console.log('Starting claim processing workers...');
  const worker = createClaimWorker();
  
  process.on('SIGTERM', async () => {
    await worker.close();
    process.exit(0);
  });
}

