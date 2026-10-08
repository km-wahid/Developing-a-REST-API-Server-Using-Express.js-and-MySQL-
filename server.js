import mysql from 'mysql2/promise';
import { createApp } from './app.js';

const db = mysql.createPool({
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5,
});

try {
  await db.execute('SELECT 1');
  const port = Number(process.env.PORT ?? 3000);
  const server = createApp(db).listen(port, '127.0.0.1', () => {
    console.log(`MySQL connected. Open http://localhost:${port}`);
  });
  server.on('error', async (error) => {
    console.error('Server could not start:', error.message);
    await db.end();
    process.exitCode = 1;
  });
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => server.close(async () => { await db.end(); }));
  }
} catch (error) {
  console.error('MySQL connection failed. Check .env and start MySQL:', error.code ?? error.message);
  await db.end();
  process.exitCode = 1;
}
