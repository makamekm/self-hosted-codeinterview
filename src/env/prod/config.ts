import { RedisModuleOptions } from "nestjs-redis";
import * as path from "path";

export const CORS = false;
export const WEB_SERVER_PORT = process.env.PORT || 8080;
export const WEB_SERVER_HOST = process.env.HOST || "0.0.0.0";
// export const PUBLIC_FOLDER = path.resolve(__dirname, "../../../", "./public");
export const PUBLIC_FOLDER = path.resolve("./public");
export const SOCKET_SERVER = "http://localhost:5000";
export const GOOGLE_AUTH_REDIRRECT =
  "https://makame.rowanberry.xyz/api/google/redirect";
export const MONGO_CONNECTION_URL =
  "mongodb://nest:password@localhost:27017/nest";

export const REDIS_CONFIG: RedisModuleOptions = {
  host: "localhost",
  port: 6379,
};
