import dotenv from 'dotenv';
import { createApp } from './app';
import { initializeDatabase } from './config/database';

dotenv.config();

const port = Number(process.env.PORT || 3001);
const app = createApp();

initializeDatabase()
  .catch((error) => {
    console.warn(`Database initialization skipped: ${error.message}`);
  })
  .finally(() => {
    app.listen(port, () => {
      console.log(`MediScribe backend running on ${port}`);
    });
  });
