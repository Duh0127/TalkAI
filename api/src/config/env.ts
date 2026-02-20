import dotenv from "dotenv";

dotenv.config();

export const env = {
    database: process.env.DATABASE_NAME || "",
    username: process.env.DATABASE_USER || "",
    password: process.env.DATABASE_PASS || "",
    host: process.env.DATABASE_HOST || "localhost",
    dialect: process.env.DATABASE_DIALECT as any,
    port: Number(process.env.PORT) || 3000,
    prefix: process.env.DATABASE_PREFIX || "",
    corsOrigins: process.env.CORS_ORIGINS || null,
};