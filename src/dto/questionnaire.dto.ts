import { Language } from "./language.dto";

export interface QuestionnaireSectionQuestionDto {
  id: string;
  name: string;
  description: string;
  code: string;
}

export interface QuestionnaireSectionDto {
  id: string;
  name: string;
  description: string;
  questions: QuestionnaireSectionQuestionDto[];
}

export interface QuestionnaireDto {
  language: Language;
  id: string;
  name: string;
  sections: QuestionnaireSectionDto[];
}
