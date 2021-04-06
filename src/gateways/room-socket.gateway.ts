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
import { CodeRunnerProvider } from "../providers/code-runner.provider";
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
import { webSocketGatewayConfig } from "~/config/web-socket-gateway-config";
import { RoomProvider } from "~/providers/room.provider";
import { RoomMessage } from "~/dto/room-message.dto";
import { EventMessage } from "~/dto/event-message.dto";
// import { AskProvider } from "~/providers/ask.provider";

@WebSocketGateway(webSocketGatewayConfig)
export class RoomSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private readonly redisService: RedisService,
    private readonly codeRunnerProvider: CodeRunnerProvider,
    private readonly eventProvider: EventProvider,
    // private readonly askService: AskProvider,
    private readonly roomProvider: RoomProvider
  ) { }

  private logger: Logger = new Logger("RoomSocketGateway");

  @SubscribeEvent(EventMessage.RoomSendClientExcept)
  onSubRoomSendClientExcept(roomId, clientId, filter, event, ...args) {
    this.roomProvider.sendLocalRoomExcept(
      roomId,
      clientId,
      filter,
      event,
      ...args
    );
  }

  @SubscribeEvent(EventMessage.RoomSendClient)
  onSubRoomSendClient(roomId, filter, event, ...args) {
    this.roomProvider.sendLocalRoom(
      roomId,
      filter,
      event,
      ...args
    );
  }

  @SubscribeMessage(RoomMessage.CreateRoom)
  async makeRoom(client: Socket): Promise<RoomDto | ErrorDto> {
    const id = uuidv4();
    const managerSecret = uuidv4();

    let room: RoomDto = {
      id,
      managerSecret,
      clients: {},
      language: null,
      text: '',
      questionnaire: null,
    };

    await this.roomProvider.saveRoom(room);

    this.logger.log(
      `Room has been created: ${id} and managerKey: ${managerSecret} by ${client.id}`
    );

    return room;
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
    const room = await this.roomProvider.getRoom(roomId);

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

    this.eventProvider.emit(
      EventMessage.RoomSendClientExcept,
      room.id,
      roomClient.id,
      {},
      RoomMessage.RoomChangeClient,
      roomClient
    );

    return roomClient;
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
    const room = await this.roomProvider.getRoom(roomId);

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

    this.eventProvider.emit(
      EventMessage.RoomSendClient,
      room.id,
      {},
      RoomMessage.RoomStartCode,
      `Code is being executed by ${roomClient.username}`
    );

    this.logger.log(`Code is being executed: ${roomId} by ${client.id}`);

    try {
      let result = await this.codeRunnerProvider.execute(
        room.text,
        room.language || Language.JavaScript
      );

      this.eventProvider.emit(
        EventMessage.RoomSendClient,
        room.id,
        {},
        RoomMessage.RoomEndCode,
        `Code has been executed by ${roomClient.username} within ${result.time / 1000
        }s with exit code ${result.code}`
      );

      if (result.data) {
        this.eventProvider.emit(
          EventMessage.RoomSendClient,
          room.id,
          {},
          RoomMessage.RoomEndCodeData,
          `Output:\n${result.data}`
        );
      }

      if (result.err) {
        this.eventProvider.emit(
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
      this.eventProvider.emit(
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

    const room = await this.roomProvider.getRoom(roomId);

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

    const roomClient: RoomClientDto = {
      id: client.id,
      isManager: room.managerSecret === managerSecret,
      timestamp: +new Date(),
      username,
    };

    room.clients[roomClient.id] = roomClient;

    this.logger.log(
      `Client Room has been created: ${roomId} and isManager: ${roomClient.isManager} by ${client.id} username: ${username}`
    );

    if (room) {
      room.clients[client.id] = roomClient;
      await this.roomProvider.saveRoom(room);

      if (!this.roomProvider.clients[room.id]) {
        this.roomProvider.clients[room.id] = {};
      }

      this.roomProvider.clients[room.id][client.id] = client;
    }

    this.eventProvider.emit(
      EventMessage.RoomSendClientExcept,
      room.id,
      roomClient.id,
      {},
      RoomMessage.RoomAddClient,
      roomClient
    );

    delete room.questionnaire;

    return {
      client: roomClient,
      room,
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
    const room = await this.roomProvider.getRoom(roomId);

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

    this.eventProvider.emit(
      EventMessage.RoomSendClientExcept,
      room.id,
      roomClient.id,
      {
        isManagersOnly: true,
      },
      RoomMessage.RoomQuestionnaire,
      diffs
    );

    this.roomProvider.applyQuestionnaireDiff(room, diffs);
    this.roomProvider.saveRoom(room);
  }

  @SubscribeMessage(RoomMessage.Editor)
  async handleEditor(
    client: Socket,
    [roomId, ...args]: any[]
  ): Promise<void | ErrorDto> {
    const room = await this.roomProvider.getRoom(roomId);

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

    this.eventProvider.emit(
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
    const room = await this.roomProvider.getRoom(roomId);

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
    this.roomProvider.saveRoom(room);

    this.eventProvider.emit(
      EventMessage.RoomSendClientExcept,
      room.id,
      roomClient.id,
      {},
      RoomMessage.RoomChangeLanguage,
      language
    );
  }

  @SubscribeMessage(RoomMessage.EditorSelection)
  async handleEditorSalection(
    client: Socket,
    [roomId, ...args]: any[]
  ): Promise<void | ErrorDto> {
    const room = await this.roomProvider.getRoom(roomId);

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

    this.eventProvider.emit(
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
    const room = await this.roomProvider.getRoom(roomId);

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
    this.roomProvider.saveRoom(room);
  }

  afterInit(server: Server) {
    this.logger.log("Room Socket Gateway has been inited!");
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    for (const roomId of Object.keys(this.roomProvider.clients)) {
      const roomClients = this.roomProvider.clients[roomId];

      if (roomClients[client.id]) {
        delete roomClients[client.id];

        const room = await this.roomProvider.getRoom(roomId);

        if (room) {
          const roomClientDto = room.clients[client.id];
          delete room.clients[client.id];
          await this.roomProvider.saveRoom(room);

          this.eventProvider.emit(
            EventMessage.RoomSendClientExcept,
            roomId,
            roomClientDto.id,
            {},
            RoomMessage.RoomRemoveClient,
            roomClientDto
          );
        }
      }
    }
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }
}
