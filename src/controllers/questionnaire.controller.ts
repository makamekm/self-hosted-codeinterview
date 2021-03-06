import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { Language } from "~/dto/language.dto";
import { QuestionnaireDto } from "~/dto/questionnaire.dto";
import { JwtGuard } from "~/guards/jwt-guard";
import { JwtOptionalGuard } from "~/guards/jwt-optional-guard";
import { QuestionnaireProvider } from "~/providers/questionnaire.provider";
import { UserProvider } from "~/providers/user.provider";

@ApiTags("Questionnaire")
@Controller("api/questionnaire")
export class QuestionnaireController {
  constructor(
    private readonly questionnaireService: QuestionnaireProvider,
    private readonly userService: UserProvider
  ) {}

  @Get("/all")
  @UseGuards(JwtOptionalGuard)
  @ApiQuery({ name: "language", enum: Language })
  @ApiQuery({ name: "userId", required: false })
  @ApiQuery({ name: "limit", required: false })
  async findAll(
    @Req() req,
    @Query("name") name: string,
    @Query("language") language: Language,
    @Query("userId") userId?: string,
    @Query("limit") limit?: number
  ) {
    limit = limit || 10;
    limit = Math.min(limit, 10);

    return this.questionnaireService.find(
      name,
      language,
      limit,
      userId,
      req.user?._id,
      true
    );
  }

  @Get("/personal")
  @UseGuards(JwtOptionalGuard)
  @ApiQuery({ name: "language", enum: Language })
  @ApiQuery({ name: "limit", required: false })
  async findPersonal(
    @Req() req,
    @Query("name") name: string,
    @Query("language") language: Language,
    @Query("limit") limit?: number
  ) {
    limit = limit || 10;
    limit = Math.min(limit, 10);

    return this.questionnaireService.find(
      name,
      language,
      limit,
      req.user?._id,
      undefined,
      !!req.user?._id ? undefined : true
    );
  }

  @Post()
  @UseGuards(JwtGuard)
  async update(@Req() req, @Body() questionnaire: QuestionnaireDto) {
    const questionnaireModel = await this.questionnaireService.get(
      questionnaire._id,
      req.user._id
    );

    if (questionnaireModel == null) {
      throw new Error(
        "Questionnaire has not been found with id: " + questionnaire._id
      );
    }

    questionnaireModel.name = questionnaire.name;
    questionnaireModel.language = questionnaire.language;
    questionnaireModel.sections = questionnaire.sections;
    questionnaireModel.isPublic = questionnaire.isPublic;

    return await this.questionnaireService.update(
      questionnaireModel,
      req.user._id
    );
  }

  @Put()
  @UseGuards(JwtGuard)
  async create(@Req() req, @Body() questionnaire: QuestionnaireDto) {
    const userModel = await this.userService.get(req.user._id);

    if (userModel == null) {
      throw new Error("User has not been found with id: " + req.user._id);
    }

    delete questionnaire._id;
    questionnaire.sections.forEach((section) => {
      delete section["_id"];
      section.questions.forEach((question) => {
        delete question["_id"];
      });
    });

    questionnaire.user = userModel;

    return await this.questionnaireService.create(questionnaire);
  }

  @Get("/:id")
  @UseGuards(JwtOptionalGuard)
  async get(@Req() req, @Param("id") id) {
    return await this.questionnaireService.get(id, req.user?._id);
  }

  @Delete("/:id")
  @UseGuards(JwtGuard)
  async delete(@Req() req, @Param("id") id) {
    return await this.questionnaireService.delete(id, req.user._id);
  }
}
