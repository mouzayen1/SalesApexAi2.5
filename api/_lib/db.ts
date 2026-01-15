const postgres = require('postgres');

// Lazy initialization for serverless
let sql: ReturnType<typeof postgres> | null = null;

function getDb() {
  if (!sql) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    sql = postgres(connectionString, {
      ssl: 'require',
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return sql;
}

module.exports = { getDb };
