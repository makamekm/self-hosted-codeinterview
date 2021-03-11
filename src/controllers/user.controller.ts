import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtOptionalGuard } from "~/guards/jwt-optional-guard";
import { UserProvider } from "~/providers/user.provider";

@ApiTags("User")
@Controller("api/user")
export class UserController {
  constructor(private readonly userService: UserProvider) {}

  @Get("/all")
  @UseGuards(JwtOptionalGuard)
  async findAll(@Query("name") name: string, @Query("limit") limit?: number) {
    limit = limit || 10;
    limit = Math.min(limit, 10);

    return this.userService.find(name, limit);
  }
}
