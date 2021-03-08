import { Model } from "mongoose";
import { Condition } from "mongodb";
import { Injectable, Inject } from "@nestjs/common";
import { QuestionnaireDto } from "~/dto/questionnaire.dto";
import { Language } from "~/dto/language.dto";
import { QuestionnaireDocument } from "~/schemas/questionnaire.schema";
import { UserDto } from "~/dto/user.dto";
import { UserService } from "./user.service";

@Injectable()
export class QuestionnaireService {
  constructor(
    @Inject("QUESTIONNAIRE_MODEL")
    private questionnaireModel: Model<QuestionnaireDocument>,
    private readonly userService: UserService
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

  async findAllExcept(
    name: string,
    language: Language,
    limit: number,
    username?: string,
    userId?: string
  ): Promise<QuestionnaireDto[]> {
    // const user = userId ? await this.userService.get(userId) : null;
    // const users = username ? await this.userService.find(username, 100) : null;
    const filter = {} as any;
    if (username) {
      filter["user.username"] = { $regex: new RegExp(username, "i") };
    }
    if (userId) {
      filter["user.id"] = {
        $not: {
          $eq: userId,
        },
      };
    }

    const result = await this.questionnaireModel
      .find(
        {
          name: { $regex: new RegExp(name, "i") },
          language: language,
          ...filter,
        },
        {
          id: 1,
          name: 1,
          user: 1,
          language: 1,
        }
      )
      .sort({ date: -1 })
      .limit(limit)
      .populate("user")
      .exec();

    result.forEach((r) => delete r.user?.accessToken);

    return result;
  }

  async findAll(
    name: string,
    language: Language,
    limit: number,
    userId?: string
  ): Promise<QuestionnaireDto[]> {
    const user = userId ? await this.userService.get(userId) : null;
    const result = await this.questionnaireModel
      .find(
        {
          name: { $regex: new RegExp(name, "i") },
          language: language,
          user: user,
        },
        {
          id: 1,
          name: 1,
          user: 1,
          language: 1,
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
    const user = await this.userService.get(userId);
    const result = await this.questionnaireModel
      .findOne({
        id,
        user: user,
      })
      .populate("user")
      .exec();

    delete result?.user?.accessToken;

    return result;
  }
}
