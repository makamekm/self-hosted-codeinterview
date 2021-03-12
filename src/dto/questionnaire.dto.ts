import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  Length,
  MaxLength,
} from "class-validator";
import { Language } from "./language.dto";
import { UserDto } from "./user.dto";

export class QuestionnaireSectionQuestionDto {
  id?: string;

  @Length(3, 150)
  @IsNotEmpty()
  name: string;

  @MaxLength(2000)
  @IsOptional()
  description?: string;

  @MaxLength(5000)
  @IsOptional()
  code?: string;

  @MaxLength(15)
  @IsOptional()
  language?: Language;
}

export class QuestionnaireSectionDto {
  id?: string;

  @Length(3, 150)
  @IsNotEmpty()
  name: string;

  @MaxLength(5000)
  @IsOptional()
  description?: string;

  @ArrayMaxSize(100)
  @IsArray()
  questions: QuestionnaireSectionQuestionDto[];
}

export class QuestionnaireDto {
  _id?: any;

  @IsNotEmpty()
  language: Language;

  @IsBoolean()
  isPublic: boolean;

  @Length(3, 150)
  @IsNotEmpty()
  name: string;

  @IsOptional()
  user?: UserDto;

  @ArrayMaxSize(50)
  @IsArray()
  sections: QuestionnaireSectionDto[];
}
