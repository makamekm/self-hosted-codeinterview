import { FilterQuery, Model, Types } from "mongoose";
import { Injectable, Inject } from "@nestjs/common";
import { QuestionnaireDto } from "~/dto/questionnaire.dto";
import { Language } from "~/dto/language.dto";
import { QuestionnaireDocument } from "~/schemas/questionnaire.schema";
import { UserService } from "./user.service";
import { UserDocument } from "~/schemas/user.schema";

@Injectable()
export class QuestionnaireService {
  constructor(
    @Inject("QUESTIONNAIRE_MODEL")
    private questionnaireModel: Model<QuestionnaireDocument>,
    @Inject("USER_MODEL")
    private userModel: Model<UserDocument>,
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
    filerUserId?: string,
    userId?: string,
    isPublic?: boolean
  ): Promise<QuestionnaireDto[]> {
    // const user = userId ? await this.userService.get(userId) : null;
    // const users = username ? await this.userService.find(username, 100) : null;

    const filter = {} as FilterQuery<QuestionnaireDocument>;
    // if (filerUserId) {
    //   filter["user._id"] = {
    //     $eq: Types.ObjectId(filerUserId),
    //   };
    // } else if (userId) {
    //   filter["user._id"] = {
    //     $not: {
    //       $eq: Types.ObjectId(userId),
    //     },
    //   };
    // }
    if (name) {
      filter["name"] = { $regex: new RegExp(name, "i") };
    }
    if (language) {
      filter["language"] = language;
    }
    if (isPublic != null) {
      filter["isPublic"] = isPublic;
    }

    const docs: QuestionnaireDto[] = await this.questionnaireModel
      .aggregate([
        {
          $lookup: {
            from: this.userModel.collection.name,
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        { $match: filter },
      ])
      .project({
        _id: 1,
        name: 1,
        user: 1,
        language: 1,
      })
      .sort({ date: -1 })
      .limit(limit)
      .exec();

    // docs.forEach((r) => delete r.user?.accessToken);

    return docs;
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
      filter["user._id"] = {
        $eq: Types.ObjectId(userId),
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
      .aggregate([
        {
          $lookup: {
            from: this.userModel.collection.name,
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        { $match: filter },
      ])
      .project({
        _id: 1,
        name: 1,
        user: 1,
        language: 1,
      })
      .sort({ date: -1 })
      .limit(limit)
      .exec();

    docs.forEach((r) => delete r.user?.accessToken);

    return docs;
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
