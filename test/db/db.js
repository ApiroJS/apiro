import { SecureStore } from '../../db/index.js';

const db = new SecureStore({
  file: "./data.db"
});

await db.add("users.1.balance", 50);