import { readFileSync } from 'fs';
import { join } from 'path';
import { query } from './connection';

async function migrate() {
  try {
    console.log('Running database migrations...');
    
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await query(statement);
        } catch (error: any) {
          // Ignore "already exists" errors
          if (!error.message.includes('already exists')) {
            console.error('Migration error:', error.message);
            throw error;
          }
        }
      }
    }
    
    console.log('Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();

