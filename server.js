import express from "express";
import { Pool } from "pg";
import Redis from "ioredis";
import { config } from "dotenv";
import cors from "cors";

config();

const app = express();
app.use(cors());
const PORT = process.env.PORT;

const pgPool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB_NAME,
  ssl: { rejectUnauthorized: false },
});

async function checkConnection() {
  try {
    const client = await pgPool.connect();
    await client.query("SELECT 1");
    console.log("Connection to DB successful");
    client.release();
  } catch (err) {
    console.error("DB connection failed", err);
  }
}

checkConnection();

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

redis
  .ping()
  .then((res) => {
    console.log("Redis response:", res);
    redis.disconnect();
  })
  .catch((err) => {
    console.error("Redis connection error:", err);
  });

app.get("/", (req, res) => {
  res.send("Hello from Express on AppRunner 🚀");
});

app.get("/health", (req, res) => {
  res.send("OK");
});

app.get("/db", async (req, res) => {
  try {
    const result = await pgPool.query("SELECT NOW()");
    res.json({ time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/cache", async (req, res) => {
  try {
    await redis.set("hello", "world", "EX", 60);
    const value = await redis.get("hello");
    res.json({ hello: value });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
