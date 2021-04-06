import { Injectable, Inject, CACHE_MANAGER, Logger } from "@nestjs/common";
import { RedisService } from "nestjs-redis";
import { Cache } from "cache-manager";
import { applyDiff } from "~/utils/diff.util";
import { EventProvider } from "./event.provider";
import { RoomDto } from "~/dto/room.dto";
import { Cron } from "@nestjs/schedule";
import { CLIENT_UPDATE_CRON } from "@env/config";
import { EventMessage } from "~/dto/event-message.dto";
import { RoomMessage } from "~/dto/room-message.dto";
import { Socket } from "socket.io";
import { UserDto } from "~/dto/user.dto";

@Injectable()
export class RoomProvider {
  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private readonly redisService: RedisService,
    private readonly eventProvider: EventProvider
  ) { }

  private logger: Logger = new Logger("RoomProvider");

  clients: {
    [id: string]: {
      [id: string]: Socket & { user: UserDto }
    };
  } = {};

  async sendLocalRoomExcept(
    roomId: string,
    exceptClientId: string,
    filter: {
      isManagersOnly?: boolean;
    },
    event: string,
    ...args: any
  ) {
    if (!this.clients[roomId]) return;

    const room = await this.getRoom(roomId);

    if (!room) return;

    for (const clientId of Object.keys(this.clients[roomId])) {
      if (clientId !== exceptClientId && this.clients[roomId][clientId]) {
        if (!filter.isManagersOnly || room.clients[clientId].isManager) {
          this.clients[roomId][clientId].emit(event, ...args);
        }
      }
    }
  }

  async sendLocalRoom(
    roomId: string,
    filter: {
      isManagersOnly?: boolean;
    },
    event: string,
    ...args: any
  ) {
    if (!this.clients[roomId]) return;

    const room = await this.getRoom(roomId);

    if (!room) return;

    for (const clientId of Object.keys(this.clients[roomId])) {
      if (this.clients[roomId][clientId]) {
        if (!filter.isManagersOnly || room.clients[clientId].isManager) {
          this.clients[roomId][clientId].emit(event, ...args);
        }
      }
    }
  }

  async saveRoom(room: RoomDto) {
    const result = await this.redisService.getClient().set(
      room.id,
      JSON.stringify(room)
    );
    if (result) {
      // this.logger.log(
      //   `Room has been cached: ${room.id} and managerKey: ${room.managerSecret}`
      // );
    }
  };

  async getRoom(roomId: string) {
    const serializedRoom = await this.redisService.getClient().get(roomId);
    if (serializedRoom) {
      const room: RoomDto = JSON.parse(serializedRoom);
      // this.logger.log(
      //   `Room has been restored from cache: ${room.id} and managerKey: ${room.managerSecret}`
      // );
      return room;
    }
    return null;
  }

  applyQuestionnaireDiff(room: RoomDto, { type, value }) {
    if (type === "replace") {
      room.questionnaire = value;
    } else if (type === "diff") {
      room.questionnaire = applyDiff(room.questionnaire, value);
    }
  }

  @Cron(CLIENT_UPDATE_CRON)
  async handleCron() {
    const roomIds = Object.keys(this.clients);
    for (const roomId of roomIds) {
      const clientIds = Object.keys(this.clients[roomId]);
      if (clientIds.length > 0) {
        const room = await this.getRoom(roomId);

        if (!room) {
          continue;
        }

        for (const clientId of clientIds) {
          if (room.clients[clientId]) {
            room.clients[clientId].timestamp = +new Date();
          }
        }

        await this.saveRoom(room);

        this.eventProvider.emit(
          EventMessage.RoomSendClient,
          room.id,
          {},
          RoomMessage.RoomUpdateClients,
          room.clients
        );
      }
    }
  }
}
