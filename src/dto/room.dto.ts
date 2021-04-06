import { Language } from "./language.dto";
import { ResultQuestionnaireDto } from "./result.questionnaire.dto";

export interface RoomClientDto {
  id: string;
  username: string;
  isManager: boolean;
  timestamp: number;
}

export interface RoomDto {
  id: string;
  text: string;
  language: Language;
  managerSecret?: string;
  clients: {
    [id: string]: RoomClientDto;
  };
  questionnaire?: ResultQuestionnaireDto
}
