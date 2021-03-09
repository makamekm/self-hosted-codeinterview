import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import moment from "moment";
import * as jwt from "jsonwebtoken";
import cookie from "cookie";
import { UserService } from "~/providers/user.service";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Google Auth")
@Controller("api/google")
export class GoogleController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard("google"))
  async googleAuth(@Req() req) {}

  @Get("redirect")
  @UseGuards(AuthGuard("google"))
  async googleAuthRedirect(
    @Req() req,
    @Res({ passthrough: true }) response: Response
  ) {
    let userModel = await this.userService.get(req.user.id);
    if (!userModel) {
      userModel = await this.userService.create(req.user);
    } else {
      Object.assign(userModel, req.user);
      userModel = await this.userService.update(userModel);
    }

    const user = {
      _id: userModel._id,
      id: userModel.id,
      username: userModel.username,
      email: userModel.email,
      firstName: userModel.firstName,
      lastName: userModel.lastName,
      picture: userModel.picture,
    };
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const redirectTo =
      cookies["redirect_to"] || req.query["redirect_to"] || "/";
    response.cookie("redirect_to", "", {
      expires: moment(moment.now()).subtract(1, "month").toDate(),
      path: "/",
    });
    response.cookie("session", jwt.sign(user, process.env.JWT_SECRET), {
      expires: moment(moment.now()).add(1, "month").toDate(),
      path: "/",
    });
    response.cookie("user_info", JSON.stringify(user), {
      expires: moment(moment.now()).add(1, "month").toDate(),
      path: "/",
    });

    return response.redirect(redirectTo);
  }
}
