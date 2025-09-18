import express from "express";
import { Pool } from "pg";
import Redis from "ioredis";
import { config } from "dotenv";
import cors from "cors";

config();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 8080;

const pgPool = new Pool({
  host: process.env.POSTGRES_HOST || "localhost",
  port: process.env.POSTGRES_PORT || 5432,
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "password",
  database: process.env.POSTGRES_DB_NAME || "testdb",
});

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
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
    await redis.set("hello", "world", "EX", 60); // TTL 60 сек
    const value = await redis.get("hello");
    res.json({ hello: value });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});
