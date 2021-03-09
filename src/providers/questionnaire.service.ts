import { Model } from "mongoose";
import { Injectable, Inject } from "@nestjs/common";
import { QuestionnaireDto } from "~/dto/questionnaire.dto";
import { Language } from "~/dto/language.dto";
import { QuestionnaireDocument } from "~/schemas/questionnaire.schema";
import { UserService } from "./user.service";
import { FilterQuery } from "typeorm";

@Injectable()
export class QuestionnaireService {
  constructor(
    @Inject("QUESTIONNAIRE_MODEL")
    private questionnaireModel: Model<QuestionnaireDocument>,
    private readonly userService: UserService
  ) {}

  async create(questionnaireDto: QuestionnaireDto): Promise<QuestionnaireDto> {
    const createdRecord = new this.questionnaireModel(questionnaireDto);
    const doc = await createdRecord.save();
    return doc.toJSON();
  }

  async update(questionnaireDto: QuestionnaireDto): Promise<QuestionnaireDto> {
    const doc = await this.questionnaireModel.findByIdAndUpdate(
      questionnaireDto._id,
      questionnaireDto
    );
    return doc.toJSON();
  }

  async findAllExcept(
    name: string,
    language: Language,
    limit: number,
    username?: string,
    userId?: string,
    isPublic?: boolean
  ): Promise<QuestionnaireDto[]> {
    // const user = userId ? await this.userService.get(userId) : null;
    // const users = username ? await this.userService.find(username, 100) : null;
    const filter = {} as FilterQuery<QuestionnaireDocument>;
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
    if (name) {
      filter["name"] = { $regex: new RegExp(name, "i") };
    }
    if (language) {
      filter["language"] = language;
    }
    if (isPublic != null) {
      filter["isPublic"] = isPublic;
    }

    const docs = await this.questionnaireModel
      .find(filter as any, {
        _id: 1,
        name: 1,
        user: 1,
        language: 1,
      })
      .sort({ date: -1 })
      .limit(limit)
      .populate("user")
      .exec();

    const result = await Promise.all(docs.map((doc) => doc.toJSON()));

    result.forEach((r) => delete r.user?.accessToken);

    return result;
  }

  async findAll(
    name: string,
    language: Language,
    limit: number,
    userId?: string,
    isPublic?: boolean
  ): Promise<QuestionnaireDto[]> {
    const filter = {} as FilterQuery<QuestionnaireDocument>;
    if (userId) {
      const user = userId ? await this.userService.get(userId) : null;
      filter["user"] = user;
    }
    if (name) {
      filter["name"] = { $regex: new RegExp(name, "i") };
    }
    if (language) {
      filter["language"] = language;
    }
    if (isPublic != null) {
      filter["isPublic"] = isPublic;
    }
    const docs = await this.questionnaireModel
      .find(filter as any, {
        id: 1,
        name: 1,
        user: 1,
        language: 1,
      })
      .sort({ date: -1 })
      .limit(limit)
      .populate("user")
      .exec();

    const result = await Promise.all(docs.map((doc) => doc.toJSON()));

    result.forEach((r) => delete r.user?.accessToken);

    return result;
  }

  async get(id: string, userId?: string): Promise<QuestionnaireDto> {
    const user = await this.userService.get(userId);
    const doc = await this.questionnaireModel
      .findOne({
        _id: id,
        user: user,
      })
      .populate("user")
      .exec();

    const result = await doc.toJSON();

    delete result?.user?.accessToken;

    return result;
  }
}
