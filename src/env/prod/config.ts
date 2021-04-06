import { RedisModuleOptions } from "nestjs-redis";
import * as path from "path";
import os from "os";

export const CORS = true;
export const WEB_SERVER_PORT = process.env.PORT || 8080;
export const WEB_SERVER_HOST = process.env.HOST || "0.0.0.0";
export const PUBLIC_FOLDER = path.resolve("./public");
export const URI = process.env.NEXT_PUBLIC_SELF_URL;
export const WS = process.env.NEXT_PUBLIC_SELF_WS;
export const GOOGLE_AUTH_REDIRRECT = `${URI}/api/google/redirect`;
export const MONGO_CONNECTION_URL = process.env.MONGO_CONNECTION_URL;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_SECRET = process.env.GOOGLE_SECRET;
export const JWT_SECRET = process.env.JWT_SECRET;

export const REDIS_CONFIG: RedisModuleOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
};

export const ARCH = os.arch();

export const CLIENT_TTL = 20000;
export const CLIENT_UPDATE_CRON = "*/10 * * * * *";