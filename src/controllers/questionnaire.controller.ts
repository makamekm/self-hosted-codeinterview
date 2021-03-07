import { Controller, Get, Query } from "@nestjs/common";
import { Language } from "~/dto/language.dto";

@Controller("api/questionnaire")
export class QuestionnaireController {
  @Get()
  async findAll(
    @Query("name") name: string,
    @Query("language") language: Language,
    @Query("limit") limit: number
  ) {
    limit = limit || 10;
    limit = Math.min(limit, 10);

    return "This action returns all cats";
  }
}
