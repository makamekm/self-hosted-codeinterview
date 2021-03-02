import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { CACHE_MANAGER, Inject, Logger } from "@nestjs/common";
import { Socket, Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import rug from "random-username-generator";
import { Cache } from "cache-manager";
import { RedisService } from "nestjs-redis";

class RoomClient {
  id: string = "";
  socket: Socket;
  username: string;
  isManager: boolean = false;

  constructor(
    id: string,
    socket: Socket,
    username: string,
    isManager: boolean = false
  ) {
    this.id = id;
    this.socket = socket;
    this.username = username;
    this.isManager = isManager;
  }
}

class Room {
  id: string = "";
  managerSecret: string = "";
  clients: {
    [id: string]: RoomClient;
  } = {};

  constructor(id: string, managerSecret: string) {
    this.id = id;
    this.managerSecret = managerSecret;
  }

  sendExcept(client: RoomClient, event: string, ...args: any) {
    for (const key of Object.keys(this.clients)) {
      if (this.clients[key] !== client) {
        this.clients[key].socket.emit(event, ...args);
      }
    }
  }

  send(event: string, ...args: any) {
    for (const key of Object.keys(this.clients)) {
      this.clients[key].socket.emit(event, ...args);
    }
  }
}

@WebSocketGateway()
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly redisService: RedisService
  ) {}

  private logger: Logger = new Logger("AppGateway");

  rooms: {
    [id: string]: Room;
  } = {};

  async storeRoom(room: Room) {
    let result = await this.redisService.getClient().set(
      room.id,
      JSON.stringify({
        id: room.id,
        managerSecret: room.managerSecret,
      })
    );
    if (result) {
      this.logger.log(
        `Room has been cached: ${room.id} and managerKey: ${room.managerSecret}`
      );
    }
  }

  async restoreRoom(roomId: string) {
    const serializedRoom = await this.redisService.getClient().get(roomId);
    if (serializedRoom) {
      const roomData: {
        id: string;
        managerSecret: string;
      } = JSON.parse(serializedRoom);
      const room = new Room(roomData.id, roomData.managerSecret);
      this.rooms[room.id] = room;

      this.logger.log(
        `Room has been restored from cache: ${room.id} and managerKey: ${room.managerSecret}`
      );
    }
  }

  @SubscribeMessage("create-room")
  async makeRoom(
    client: Socket
  ): Promise<
    | {
        id: string;
        managerSecret: string;
      }
    | {
        error: string;
      }
  > {
    const id = uuidv4();
    const managerSecret = uuidv4();

    let room = new Room(id, managerSecret);

    this.rooms[room.id] = room;

    this.logger.log(
      `Room has been created: ${id} and managerKey: ${managerSecret} by ${client.id}`
    );

    await this.storeRoom(room);

    return {
      id: room.id,
      managerSecret: managerSecret,
    };
  }

  @SubscribeMessage("connect-room")
  async connectRoom(
    client: Socket,
    [roomId, username, managerSecret]: [
      roomId: string,
      username: string,
      managerSecret: string
    ]
  ): Promise<
    | {
        id: string;
        roomId: string;
        username: string;
        isManager: boolean;
      }
    | {
        error: string;
      }
  > {
    username = username || rug.generate();

    if (!this.rooms[roomId]) {
      await this.restoreRoom(roomId);
    }

    const room = this.rooms[roomId];

    if (!room) {
      return {
        error: "The room has not been found!",
      };
    }

    if (managerSecret && room.managerSecret !== managerSecret) {
      return {
        error: "Your manager secret key is wrong!",
      };
    }

    const roomClient = new RoomClient(
      client.id,
      client,
      username,
      room.managerSecret === managerSecret
    );

    room.clients[roomClient.id] = roomClient;

    this.logger.log(
      `Client Room has been created: ${roomId} and isManager: ${roomClient.isManager} by ${client.id} username: {username}`
    );

    return {
      id: client.id,
      username,
      roomId,
      isManager: roomClient.isManager,
    };
  }

  @SubscribeMessage("editor")
  async handleMessage(
    client: Socket,
    [roomId, ...args]: any[]
  ): Promise<void | {
    error: string;
  }> {
    const room = this.rooms[roomId];

    if (!room) {
      return {
        error: "The room has not been found!",
      };
    }

    const roomClient = room.clients[client.id];

    if (!roomClient) {
      return {
        error: "The room client has not been found!",
      };
    }

    room.sendExcept(roomClient, "editor", ...args);
  }

  afterInit(server: Server) {
    this.logger.log("Init");
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    for (const key of Object.keys(this.rooms)) {
      if (this.rooms[key].clients[client.id]) {
        delete this.rooms[key].clients[client.id];
      }
    }
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }
}
