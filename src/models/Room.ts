import { debounce } from "ts-debounce";
import { RoomDto } from "~/dto/room.dto";
import { ResultQuestionnaireDto } from "~/dto/result.questionnaire.dto";
import { Language } from "~/dto/language.dto";
import { RoomClient } from "./RoomClient";

export class Room implements RoomDto {
  id: string = "";
  text: string = "";
  managerSecret: string = "";
  language: Language = Language.JavaScript;
  questionnaire: ResultQuestionnaireDto;
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

  serialize(): RoomDto {
    return {
      id: this.id,
      text: this.text,
      clients: Object.keys(this.clients).reduce((acc, key) => {
        acc[key] = this.clients[key].serialize();
        return acc;
      }, {}),
      language: this.language,
    };
  }
}
