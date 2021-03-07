import { Model } from "mongoose";
import { Condition } from "mongodb";
import { Injectable, Inject } from "@nestjs/common";
import { QuestionnaireDto } from "~/dto/questionnaire.dto";
import { Language } from "~/dto/language.dto";
import { QuestionnaireDocument } from "~/schemas/questionnaire.schema";
import { UserDto } from "~/dto/user.dto";

@Injectable()
export class QuestionnaireService {
  constructor(
    @Inject("QUESTIONNAIRE_MODEL")
    private questionnaireModel: Model<QuestionnaireDocument>
  ) {}

  async create(questionnaireDto: QuestionnaireDto): Promise<QuestionnaireDto> {
    const createdRecord = new this.questionnaireModel(questionnaireDto);
    return createdRecord.save();
  }

  async update(questionnaireDto: QuestionnaireDto): Promise<QuestionnaireDto> {
    return await this.questionnaireModel.findByIdAndUpdate(
      questionnaireDto.id,
      questionnaireDto
    );
  }

  async findAll(
    name: string,
    language: Language,
    limit: number,
    userId?: string
  ): Promise<QuestionnaireDto[]> {
    const userFilter: {
      user?: Condition<UserDto>;
    } = userId
      ? {
          user: {
            id: userId,
          },
        }
      : {};
    const result = await this.questionnaireModel
      .find(
        {
          name: { $regex: new RegExp(name, "i") },
          language: language,
          ...userFilter,
        },
        {
          id: 1,
          name: 1,
          user: 1,
          language: 1,
          sections: 0,
        }
      )
      .sort({ date: -1 })
      .limit(limit)
      .populate("user")
      .exec();

    result.forEach((r) => delete r.user?.accessToken);

    return result;
  }

  async get(id: string, userId?: string): Promise<QuestionnaireDto> {
    const userFilter: {
      user?: Condition<UserDto>;
    } = userId
      ? {
          user: {
            id: userId,
          },
        }
      : {};
    const result = await this.questionnaireModel
      .findOne({
        id,
        ...userFilter,
      })
      .populate("user")
      .exec();

    delete result?.user?.accessToken;

    return result;
  }
}
