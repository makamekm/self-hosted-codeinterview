import {
  QuestionnaireDto,
  QuestionnaireSectionDto,
  QuestionnaireSectionQuestionDto,
} from "./questionnaire.dto";

export enum GradeDto {
  NotAssesed = "NotAssesed",
  NoKnowledge = "NoKnowledge",
  T1 = "T1",
  T2 = "T2",
  T3 = "T3",
}

export const GradeNameDto = {
  [GradeDto.NotAssesed]: "Not Assesed",
  [GradeDto.NoKnowledge]: "No Knowledge",
  [GradeDto.T1]: "T1",
  [GradeDto.T2]: "T2",
  [GradeDto.T3]: "T3",
};

export interface ResultQuestionnaireSectionQuestionDto
  extends QuestionnaireSectionQuestionDto {
  grade: GradeDto | null;
  comments: string;
}

export interface ResultQuestionnaireSectionDto extends QuestionnaireSectionDto {
  questions: ResultQuestionnaireSectionQuestionDto[];
}

export interface ResultQuestionnaireDto extends QuestionnaireDto {
  recommendedGrade: GradeDto;
  sections: ResultQuestionnaireSectionDto[];
}
