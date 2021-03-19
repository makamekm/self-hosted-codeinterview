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
import { CodeRunnerService } from "../providers/code-runner.provider";
import { WsJwtGuard } from "~/guards/ws-jwt-guard";
import { UserDto } from "~/dto/user.dto";
import { RoomClientDto, RoomDto } from "~/dto/room.dto";
import { ErrorDto } from "~/dto/error.dto";
import { ResultQuestionnaireDto } from "~/dto/result.questionnaire.dto";
import {
  EventProvider,
  EventSubscribe as SubscribeEvent,
} from "../providers/event.provider";
import { Language } from "~/dto/language.dto";
import { Room } from "~/models/Room";
import { RoomClient } from "~/models/RoomClient";
import { webSocketGatewayConfig } from "~/config/web-socket-gateway-config";
import { RoomProvider } from "~/providers/room.provider";
import { RoomMessage } from "~/dto/room-message.dto";
import { EventMessage } from "~/dto/event-message.dto";
import { AskProvider } from "~/providers/ask.provider";

@WebSocketGateway(webSocketGatewayConfig)
export class RoomSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly redisService: RedisService,
    private readonly codeRunnerService: CodeRunnerService,
    private readonly eventService: EventProvider,
    // private readonly askService: AskProvider,
    private readonly roomService: RoomProvider
  ) { }

  private logger: Logger = new Logger("RoomSocketGateway");

  @SubscribeEvent(EventMessage.RoomSendClientExcept)
  onSubRoomSendClientExcept(roomId, clientId, filter, event, ...args) {
    this.roomService.sendLocalRoomExcept(
      this.roomService.rooms[roomId],
      clientId,
      filter,
      event,
      ...args
    );
  }

  @SubscribeEvent(EventMessage.RoomSendClient)
  onSubRoomSendClient(roomId, filter, event, ...args) {
    this.roomService.sendLocalRoom(
      this.roomService.rooms[roomId],
      filter,
      event,
      ...args
    );
  }

  @SubscribeEvent(EventMessage.RoomChangeLanguage)
  onSubRoomChangeLanguage(roomId, language) {
    const room = this.roomService.rooms[roomId];

    if (room) {
      room.language = language;
    }
  }

  @SubscribeEvent(EventMessage.RoomChangeText)
  onSubRoomChangeText(roomId, text) {
    const room = this.roomService.rooms[roomId];

    if (room) {
      room.text = text;
    }
  }

  @SubscribeMessage(RoomMessage.CreateRoom)
  async makeRoom(client: Socket): Promise<RoomDto | ErrorDto> {
    const id = uuidv4();
    const managerSecret = uuidv4();

    let room = new Room(id, managerSecret);

    this.roomService.rooms[room.id] = room;

    this.logger.log(
      `Room has been created: ${id} and managerKey: ${managerSecret} by ${client.id}`
    );

    await this.roomService.storeRoom(room);

    // TODO: serialize
    return {
      ...room.serialize(),
      managerSecret: managerSecret,
    };
  }

  @SubscribeMessage(RoomMessage.ChangeClient)
  async changeClient(
    client: Socket,
    [roomId, data]: [
      roomId: string,
      data: {
        username: string;
      }
    ]
  ): Promise<RoomClientDto | ErrorDto> {
    if (!this.roomService.rooms[roomId]) {
      await this.roomService.restoreRoom(roomId);
    }

    const room = this.roomService.rooms[roomId];

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

    this.eventService.emit(
      EventMessage.RoomSendClientExcept,
      room.id,
      roomClient.id,
      {},
      RoomMessage.RoomChangeClient,
      clientData
    );

    return {
      id: roomClient.id,
      username: roomClient.username,
      isManager: roomClient.isManager,
    };
  }

  @SubscribeMessage(RoomMessage.ExecuteRoom)
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
    if (!this.roomService.rooms[roomId]) {
      await this.roomService.restoreRoom(roomId);
    }

    const room = this.roomService.rooms[roomId];

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

    this.eventService.emit(
      EventMessage.RoomSendClient,
      room.id,
      {},
      RoomMessage.RoomStartCode,
      `Code is being executed by ${roomClient.username}`
    );

    this.logger.log(`Code is being executed: ${roomId} by ${client.id}`);

    try {
      let result = await this.codeRunnerService.execute(
        room.text,
        room.language || Language.JavaScript
      );

      this.eventService.emit(
        EventMessage.RoomSendClient,
        room.id,
        {},
        RoomMessage.RoomEndCode,
        `Code has been executed by ${roomClient.username} within ${result.time / 1000
        }s with exit code ${result.code}`
      );

      if (result.data) {
        this.eventService.emit(
          EventMessage.RoomSendClient,
          room.id,
          {},
          RoomMessage.RoomEndCodeData,
          `Output:\n${result.data}`
        );
      }

      if (result.err) {
        this.eventService.emit(
          EventMessage.RoomSendClient,
          room.id,
          {},
          RoomMessage.RoomEndCodeErr,
          `Error Output:\n${result.err}`
        );
      }

      this.logger.log(
        `Code has been executed: ${roomId} within ${result.time} by ${client.id}`
      );

      return result;
    } catch (error) {
      this.eventService.emit(
        EventMessage.RoomSendClient,
        room.id,
        {},
        RoomMessage.RoomEndCodeErr,
        `Execution has failed die to:\n${error}`
      );

      this.logger.log(`Code execution has failed: ${roomId} by ${client.id}`);
      this.logger.log(error);

      return {
        error: error.message,
      };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage(RoomMessage.ConnectRoom)
  async connectRoom(
    client: Socket & { user: UserDto },
    [roomId, managerSecret]: [roomId: string, managerSecret: string]
  ): Promise<
    | {
      room: RoomDto;
      client: RoomClientDto;
      questionnaire: ResultQuestionnaireDto;
    }
    | ErrorDto
  > {
    const username = (client.user && client.user.username) || rug.generate();

    if (!this.roomService.rooms[roomId]) {
      await this.roomService.restoreRoom(roomId);
    }

    const room = this.roomService.rooms[roomId];

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

    this.eventService.emit(
      EventMessage.RoomSendClientExcept,
      room.id,
      roomClient.id,
      {},
      RoomMessage.RoomAddClient,
      {
        id: roomClient.id,
        username: roomClient.username,
        isManager: roomClient.isManager,
      }
    );

    return {
      client: roomClient.serialize(),
      room: room.serialize(),
      questionnaire: roomClient.isManager ? room.questionnaire : null,
    };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage(RoomMessage.RoomQuestionnaire)
  async roomQuestionnaire(
    client: Socket & { user: UserDto },
    [roomId, diffs]: [
      roomId: string,
      diffs: any // TODO: add diff dto
    ]
  ): Promise<void | ErrorDto> {
    const room = this.roomService.rooms[roomId];

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

    this.eventService.emit(
      EventMessage.RoomSendClientExcept,
      room.id,
      roomClient.id,
      {
        isManagersOnly: true,
      },
      RoomMessage.RoomQuestionnaire,
      diffs
    );

    this.roomService.applyQuestionnaireDiff(room, diffs);
    this.roomService.storeRoom(room);
  }

  @SubscribeMessage(RoomMessage.Editor)
  async handleEditor(
    client: Socket,
    [roomId, ...args]: any[]
  ): Promise<void | ErrorDto> {
    const room = this.roomService.rooms[roomId];

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

    this.eventService.emit(
      EventMessage.RoomSendClientExcept,
      room.id,
      roomClient.id,
      {},
      RoomMessage.Editor,
      ...args
    );
  }

  @SubscribeMessage(RoomMessage.RoomChangeLanguage)
  async handleLanguage(
    client: Socket,
    [roomId, language]: [roomId: string, language: Language]
  ): Promise<void | ErrorDto> {
    const room = this.roomService.rooms[roomId];

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

    room.language = language;
    this.roomService.storeRoom(room);

    this.eventService.emit(
      EventMessage.RoomSendClientExcept,
      room.id,
      roomClient.id,
      {},
      RoomMessage.RoomChangeLanguage,
      language
    );

    this.eventService.emit(EventMessage.RoomChangeLanguage, room.id, language);
  }

  @SubscribeMessage(RoomMessage.EditorSelection)
  async handleEditorSalection(
    client: Socket,
    [roomId, ...args]: any[]
  ): Promise<void | ErrorDto> {
    const room = this.roomService.rooms[roomId];

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

    this.eventService.emit(
      EventMessage.RoomSendClientExcept,
      room.id,
      roomClient.id,
      {},
      RoomMessage.EditorSelection,
      client.id,
      ...args
    );
  }

  @SubscribeMessage(RoomMessage.EditorState)
  async handleEditorState(
    client: Socket,
    [roomId, text]: any[]
  ): Promise<void | ErrorDto> {
    const room = this.roomService.rooms[roomId];

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
    this.roomService.storeRoom(room);

    this.eventService.emit(EventMessage.RoomChangeText, room.id, text);
  }

  afterInit(server: Server) {
    this.logger.log("Room Socket Gateway has been inited!");
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    for (const key of Object.keys(this.roomService.rooms)) {
      const room = this.roomService.rooms[key];
      if (room.clients[client.id]) {
        const roomClient = room.clients[client.id];
        delete room.clients[client.id];
        this.eventService.emit(
          EventMessage.RoomSendClientExcept,
          room.id,
          roomClient.id,
          {},
          RoomMessage.RoomRemoveClient,
          {
            id: roomClient.id,
            username: roomClient.username,
            isManager: roomClient.isManager,
          }
        );
      }
    }
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }
}
