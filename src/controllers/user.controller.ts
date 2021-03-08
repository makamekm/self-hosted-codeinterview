import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtOptionalGuard } from "~/guards/jwt-optional-guard";
import { UserService } from "~/providers/user.service";

@ApiTags("User")
@Controller("api/user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/all")
  @UseGuards(JwtOptionalGuard)
  async findAll(@Query("name") name: string, @Query("limit") limit?: number) {
    limit = limit || 10;
    limit = Math.min(limit, 10);

    return this.userService.find(name, limit);
  }
}
