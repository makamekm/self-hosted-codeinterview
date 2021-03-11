import { Injectable, Inject, CACHE_MANAGER, Logger } from "@nestjs/common";
import { RedisService } from "nestjs-redis";
import { Language } from "~/dto/language.dto";
import { ResultQuestionnaireDto } from "~/dto/result.questionnaire.dto";
import { Room } from "~/models/Room";
import { applyDiff } from "~/utils/diff.util";
import { CodeRunnerService } from "./code-runner.provider";
import { EventProvider } from "./event.provider";

@Injectable()
export class RoomProvider {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly redisService: RedisService,
    private readonly codeRunnerService: CodeRunnerService,
    private readonly eventService: EventProvider
  ) {}

  private logger: Logger = new Logger("RoomService");

  rooms: {
    [id: string]: Room;
  } = {};

  sendLocalRoomExcept(
    room: Room,
    clientId: string,
    filter: {
      isManagersOnly?: boolean;
    },
    event: string,
    ...args: any
  ) {
    if (!room) return;

    for (const key of Object.keys(room.clients)) {
      if (key !== clientId && room.clients[key].socket) {
        if (!filter.isManagersOnly || room.clients[key].isManager) {
          room.clients[key].socket.emit(event, ...args);
        }
      }
    }
  }

  sendLocalRoom(
    room: Room,
    filter: {
      isManagersOnly?: boolean;
    },
    event: string,
    ...args: any
  ) {
    if (!room) return;

    for (const key of Object.keys(room.clients)) {
      if (room.clients[key].socket) {
        if (!filter.isManagersOnly || room.clients[key].isManager) {
          room.clients[key].socket.emit(event, ...args);
        }
      }
    }
  }

  storeRoom = async (room: Room) => {
    let result = await this.redisService.getClient().set(
      room.id,
      JSON.stringify({
        id: room.id,
        managerSecret: room.managerSecret,
        text: room.text,
        questionnaire: room.questionnaire,
        language: room.language,
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
        questionnaire: ResultQuestionnaireDto;
        language: Language;
      } = JSON.parse(serializedRoom);
      const room = new Room(
        roomData.id,
        roomData.managerSecret,
        this.storeRoom
      );
      room.text = roomData.text;
      room.questionnaire = roomData.questionnaire;
      room.language = roomData.language || Language.JavaScript;
      this.rooms[room.id] = room;

      this.logger.log(
        `Room has been restored from cache: ${room.id} and managerKey: ${room.managerSecret}`
      );
    }
  }

  applyQuestionnaireDiff(room: Room, { type, value }) {
    if (type === "replace") {
      room.questionnaire = value;
    } else if (type === "diff") {
      room.questionnaire = applyDiff(room.questionnaire, value);
    }
  }
}
