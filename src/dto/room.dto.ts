import { Language } from "./language.dto";

export interface RoomClientDto {
  id: string;
  username: string;
  isManager: boolean;
}

export interface RoomDto {
  id: string;
  text: string;
  language: Language;
  managerSecret?: string;
  clients: {
    [id: string]: RoomClientDto;
  };
}
