import { Model } from "mongoose";
import { Injectable, Inject } from "@nestjs/common";
import { QuestionnaireDto } from "~/dto/questionnaire.dto";
import { Language } from "~/dto/language.dto";
import { QuestionnaireDocument } from "~/schemas/questionnaire.schema";

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

  async findAll(
    name: string,
    language: Language,
    limit: number
  ): Promise<QuestionnaireDto[]> {
    const result = await this.questionnaireModel
      .find({ name: { $regex: new RegExp(name, "i") }, language: language })
      .sort({ date: -1 })
      .limit(limit)
      .populate("user")
      .exec();

    result.forEach((r) => delete r.user?.accessToken);

    return result;
  }
}
