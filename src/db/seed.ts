import { query } from './connection';

async function seed() {
  try {
    console.log('Seeding database...');

    // Insert sample forecasters
    const forecaster1 = await query(
      `INSERT INTO forecaster (name, username, platform, bio, verified)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      ['John Economist', 'johnecon', 'twitter', 'Economic analyst and forecaster', true]
    );

    const forecaster2 = await query(
      `INSERT INTO forecaster (name, username, platform, bio, verified)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      ['Sarah Predictor', 'sarahpred', 'twitter', 'Political and tech forecaster', true]
    );

    console.log('Sample data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();

