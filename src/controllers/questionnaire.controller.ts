import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags } from "@nestjs/swagger";
import { Language } from "~/dto/language.dto";
import { QuestionnaireDto } from "~/dto/questionnaire.dto";
import { JwtGuard } from "~/guards/jwt-guard";
import { JwtOptionalGuard } from "~/guards/jwt-optional-guard";
import { QuestionnaireService } from "~/providers/questionnaire.service";
import { UserService } from "~/providers/user.service";

@ApiTags("Questionnaire")
@Controller("api/questionnaire")
export class QuestionnaireController {
  constructor(
    private readonly questionnaireService: QuestionnaireService,
    private readonly userService: UserService
  ) {}

  @Get("/all")
  @UseGuards(JwtOptionalGuard)
  async findAll(
    @Req() req,
    @Query("name") name: string,
    @Query("language") language: Language,
    @Query("username") username?: string,
    @Query("limit") limit?: number
  ) {
    limit = limit || 10;
    limit = Math.min(limit, 10);

    const userId = req.user?.id;

    return this.questionnaireService.findAllExcept(
      name,
      language,
      limit,
      username,
      userId,
      true
    );
  }

  @Get("/personal")
  @UseGuards(JwtOptionalGuard)
  async findPersonal(
    @Req() req,
    @Query("name") name: string,
    @Query("language") language: Language,
    @Query("limit") limit?: number
  ) {
    limit = limit || 10;
    limit = Math.min(limit, 10);

    const userId = req.user?.id;

    return this.questionnaireService.findAll(name, language, limit, userId);
  }

  @Post()
  @UseGuards(JwtGuard)
  async update(@Req() req, @Body() questionnaire: QuestionnaireDto) {
    const userId = req.user.id;

    const questionnaireModel = await this.questionnaireService.get(
      questionnaire._id,
      userId
    );

    if (questionnaireModel == null) {
      throw new Error(
        "Questionnaire has not been found with id: " + questionnaire._id
      );
    }

    questionnaireModel.name = questionnaire.name;
    questionnaireModel.language = questionnaire.language;
    questionnaireModel.sections = questionnaire.sections;

    return await this.questionnaireService.update(questionnaireModel);
  }

  @Put()
  @UseGuards(JwtGuard)
  async create(@Req() req, @Body() questionnaire: QuestionnaireDto) {
    const userId = req.user.id;

    const userModel = await this.userService.get(userId);

    if (userModel == null) {
      throw new Error("User has not been found with id: " + userId);
    }

    questionnaire.user = userModel;

    return await this.questionnaireService.create(questionnaire);
  }

  @Get(":id")
  async get(@Req() req, @Param("id") id) {
    return await this.questionnaireService.get(id);
  }
}
