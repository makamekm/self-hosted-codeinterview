import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { CACHE_MANAGER, Inject, Logger, UseGuards } from "@nestjs/common";
import { Socket, Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import rug from "random-username-generator";
import { Cache } from "cache-manager";
import { RedisService } from "nestjs-redis";
import { debounce } from "ts-debounce";
import { CodeRunnerService } from "./code-runner.provider";
import { WsJwtGuard } from "./ws-jwt-guard";
import { UserDto } from "./dto/user.dto";
import { RoomClientDto, RoomDto } from "./dto/room.dto";
import { ErrorDto } from "./dto/error.dto";

class RoomClient implements RoomClientDto {
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

  serialize(): RoomClientDto {
    return {
      id: this.id,
      isManager: this.isManager,
      username: this.username,
    };
  }
}

class Room implements RoomDto {
  id: string = "";
  text: string = "";
  managerSecret: string = "";
  clients: {
    [id: string]: RoomClient;
  } = {};

  storeDebounceFn: () => void;

  constructor(
    id: string,
    managerSecret: string,
    storeFn: (room: Room) => Promise<void>
  ) {
    this.id = id;
    this.managerSecret = managerSecret;
    this.storeDebounceFn = debounce(() => storeFn(this), 1000);
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

  serialize(): RoomDto {
    return {
      id: this.id,
      text: this.text,
      clients: Object.keys(this.clients).reduce((acc, key) => {
        acc[key] = this.clients[key].serialize();
        return acc;
      }, {}),
    };
  }
}

@WebSocketGateway({
  handlePreflightRequest: (req, res) => {
    const headers = {
      "Access-Control-Allow-Headers": "Content-Type, authorization, x-token",
      "Access-Control-Allow-Origin": req.headers.origin,
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Max-Age": "1728000",
      "Content-Length": "0",
    };
    res.writeHead(200, headers);
    res.end();
  },
} as any)
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly redisService: RedisService,
    private codeRunnerService: CodeRunnerService
  ) {}

  private logger: Logger = new Logger("AppGateway");

  rooms: {
    [id: string]: Room;
  } = {};

  storeRoom = async (room: Room) => {
    let result = await this.redisService.getClient().set(
      room.id,
      JSON.stringify({
        id: room.id,
        managerSecret: room.managerSecret,
        text: room.text,
      })
    );
    if (result) {
      this.logger.log(
        `Room has been cached: ${room.id} and managerKey: ${room.managerSecret}`
      );
    }
  };

  async restoreRoom(roomId: string) {
    const serializedRoom = await this.redisService.getClient().get(roomId);
    if (serializedRoom) {
      const roomData: {
        id: string;
        managerSecret: string;
        text: string;
      } = JSON.parse(serializedRoom);
      const room = new Room(
        roomData.id,
        roomData.managerSecret,
        this.storeRoom
      );
      room.text = roomData.text;
      this.rooms[room.id] = room;

      this.logger.log(
        `Room has been restored from cache: ${room.id} and managerKey: ${room.managerSecret}`
      );
    }
  }

  @SubscribeMessage("create-room")
  async makeRoom(client: Socket): Promise<RoomDto | ErrorDto> {
    const id = uuidv4();
    const managerSecret = uuidv4();

    let room = new Room(id, managerSecret, this.storeRoom);

    this.rooms[room.id] = room;

    this.logger.log(
      `Room has been created: ${id} and managerKey: ${managerSecret} by ${client.id}`
    );

    await this.storeRoom(room);

    // TODO: serialize
    return {
      ...room.serialize(),
      managerSecret: managerSecret,
    };
  }

  @SubscribeMessage("change-client")
  async changeClient(
    client: Socket,
    [roomId, data]: [
      roomId: string,
      data: {
        username: string;
      }
    ]
  ): Promise<RoomClientDto | ErrorDto> {
    if (!this.rooms[roomId]) {
      await this.restoreRoom(roomId);
    }

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

    roomClient.username = data.username;

    let clientData = {
      id: roomClient.id,
      username: roomClient.username,
      isManager: roomClient.isManager,
    };

    room.sendExcept(roomClient, "room-change-client", clientData);

    return {
      id: roomClient.id,
      username: roomClient.username,
      isManager: roomClient.isManager,
    };
  }

  @SubscribeMessage("execute-room")
  async executeRoom(
    client: Socket,
    roomId: string
  ): Promise<
    | {
        data: string;
        err: string;
      }
    | ErrorDto
  > {
    if (!this.rooms[roomId]) {
      await this.restoreRoom(roomId);
    }

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

    room.send(
      "room-start-code",
      `Code is being executed by ${roomClient.username}`
    );

    this.logger.log(`Code is being executed: ${roomId} by ${client.id}`);

    try {
      let result = await this.codeRunnerService.execute(room.text);

      room.send(
        "room-end-code",
        `Code has been executed by ${roomClient.username} within ${
          result.time / 1000
        }s with exit code ${result.code}`
      );

      if (result.data) {
        room.send("room-end-code-data", `Output:\n${result.data}`);
      }

      if (result.err) {
        room.send("room-end-code-err", `Error Output:\n${result.err}`);
      }

      this.logger.log(
        `Code has been executed: ${roomId} within ${result.time} by ${client.id}`
      );

      return result;
    } catch (error) {
      room.send("room-end-code-err", `Execution has failed die to:\n${error}`);

      this.logger.log(`Code execution has failed: ${roomId} by ${client.id}`);
      this.logger.log(error);

      return {
        error: error.message,
      };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage("connect-room")
  async connectRoom(
    client: Socket & { user: UserDto },
    [roomId, managerSecret]: [roomId: string, managerSecret: string]
  ): Promise<
    | {
        room: RoomDto;
        client: RoomClientDto;
      }
    | ErrorDto
  > {
    const username =
      (client.user && client.user.firstName + " " + client.user.lastName) ||
      rug.generate();

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

    room.sendExcept(roomClient, "room-add-client", {
      id: roomClient.id,
      username: roomClient.username,
      isManager: roomClient.isManager,
    });

    return {
      client: roomClient.serialize(),
      room: room.serialize(),
    };
  }

  @SubscribeMessage("editor")
  async handleEditor(
    client: Socket,
    [roomId, ...args]: any[]
  ): Promise<void | ErrorDto> {
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

  @SubscribeMessage("editor-selection")
  async handleEditorSalection(
    client: Socket,
    [roomId, ...args]: any[]
  ): Promise<void | ErrorDto> {
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

    room.sendExcept(roomClient, "editor-selection", client.id, ...args);
  }

  @SubscribeMessage("editor-state")
  async handleEditorState(
    client: Socket,
    [roomId, text]: any[]
  ): Promise<void | ErrorDto> {
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

    room.text = text;
    room.storeDebounceFn();
  }

  afterInit(server: Server) {
    this.logger.log("Init");
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    for (const key of Object.keys(this.rooms)) {
      const room = this.rooms[key];
      if (room.clients[client.id]) {
        const roomClient = room.clients[client.id];
        delete room.clients[client.id];
        room.sendExcept(roomClient, "room-remove-client", {
          id: roomClient.id,
          username: roomClient.username,
          isManager: roomClient.isManager,
        });
      }
    }
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }
}
