import { Language } from "./language.dto";
import { UserDto } from "./user.dto";

export interface QuestionnaireSectionQuestionDto {
  id: string;
  name: string;
  description?: string;
  code?: string;
  language?: Language;
}

export interface QuestionnaireSectionDto {
  id: string;
  name: string;
  description?: string;
  questions: QuestionnaireSectionQuestionDto[];
}

export interface QuestionnaireDto {
  language: Language;
  id: string;
  name: string;
  user: UserDto;
  sections: QuestionnaireSectionDto[];
}
