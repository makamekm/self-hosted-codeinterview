import { RedisModuleOptions } from "nestjs-redis";
import * as path from "path";

export const CORS = true;
export const WEB_SERVER_PORT = process.env.PORT || 8080;
export const WEB_SERVER_HOST = process.env.HOST || "0.0.0.0";
export const PUBLIC_FOLDER = path.resolve("./public");
export const SOCKET_SERVER = "https://makame.rowanberry.xyz";
export const URI = "https://makame.rowanberry.xyz";
export const GOOGLE_AUTH_REDIRRECT =
  "https://makame.rowanberry.xyz/api/google/redirect";
export const MONGO_CONNECTION_URL = process.env.MONGO_CONNECTION_URL;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_SECRET = process.env.GOOGLE_SECRET;
export const JWT_SECRET = process.env.JWT_SECRET;

export const REDIS_CONFIG: RedisModuleOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
};
