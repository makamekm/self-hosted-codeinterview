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

  async create(
    questionnaireDto: QuestionnaireDto
  ): Promise<QuestionnaireDocument> {
    const createdRecord = new this.questionnaireModel(questionnaireDto);
    return await createdRecord.save();
  }

  async update(
    questionnaireDto: QuestionnaireDto
  ): Promise<QuestionnaireDocument> {
    return await this.questionnaireModel.findByIdAndUpdate(
      questionnaireDto._id,
      questionnaireDto
    );
  }

  async find(
    name: string,
    language: Language,
    limit: number,
    userId?: string,
    exceptUserId?: string,
    isPublic?: boolean
  ): Promise<QuestionnaireDocument[]> {
    // const user = userId ? await this.userService.get(userId) : null;
    // const users = username ? await this.userService.find(username, 100) : null;

    const filter = {} as FilterQuery<QuestionnaireDocument>;
    if (userId) {
      filter["user._id"] = {
        $eq: Types.ObjectId(userId),
      };
    } else if (exceptUserId) {
      filter["user._id"] = {
        $not: {
          $eq: Types.ObjectId(exceptUserId),
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

  async get(id: string, userId?: string): Promise<QuestionnaireDocument> {
    let doc: QuestionnaireDocument;
    if (userId) {
      const user = await this.userService.get(userId);
      doc = await this.questionnaireModel
        .findOne({
          _id: id,
          $or: [
            {
              user: user,
            },
            {
              isPublic: true,
            },
          ],
        })
        .populate("user")
        .exec();
    } else {
      doc = await this.questionnaireModel
        .findOne({
          _id: id,
          isPublic: true,
        })
        .populate("user")
        .exec();
    }

    delete doc?.user?.accessToken;

    return doc;
  }
}
