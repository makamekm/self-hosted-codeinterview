import {
  QuestionnaireDto,
  QuestionnaireSectionDto,
  QuestionnaireSectionQuestionDto,
} from "./questionnaire.dto";

export enum ValueDto {
  Unknown,
  T1,
  T2,
  T3,
}

export interface ResultQuestionnaireSectionQuestionDto
  extends QuestionnaireSectionQuestionDto {
  value: ValueDto;
  comments: string;
}

export interface ResultQuestionnaireSectionDto extends QuestionnaireSectionDto {
  questions: ResultQuestionnaireSectionQuestionDto[];
}

export interface ResultQuestionnaireDto extends QuestionnaireDto {
  recommendedValue: ValueDto;
  sections: ResultQuestionnaireSectionDto[];
}
