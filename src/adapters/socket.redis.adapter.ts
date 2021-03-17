import { IoAdapter } from "@nestjs/platform-socket.io";
import { RedisClient } from "redis";
import { createAdapter } from "socket.io-redis";
import { setupWorker } from "@socket.io/sticky";
import { REDIS_CONFIG } from "@env/config";

export class SocketRedisAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    const pubClient = new RedisClient(REDIS_CONFIG);
    const subClient = pubClient.duplicate();
    const redisAdapter = createAdapter({ pubClient, subClient });
    server.adapter(redisAdapter);
    setupWorker(server);
    return server;
  }
}