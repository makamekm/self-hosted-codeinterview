import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import moment from "moment";
import * as jwt from "jsonwebtoken";
// import { AppGateway } from "./app-gateway.service";

@Controller("api/google")
export class GoogleController {
  // constructor(private readonly appService: AppGateway) {}

  @Get()
  @UseGuards(AuthGuard("google"))
  async googleAuth(@Req() req) {}

  @Get("redirect")
  @UseGuards(AuthGuard("google"))
  googleAuthRedirect(
    @Req() req,
    @Res({ passthrough: true }) response: Response
  ) {
    response.cookie("session", jwt.sign(req.user, process.env.JWT_SECRET), {
      expires: moment(moment.now()).add(1, "month").toDate(),
      path: "/",
    });
    response.cookie(
      "user_info",
      JSON.stringify({
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        picture: req.user.picture,
      }),
      {
        expires: moment(moment.now()).add(1, "month").toDate(),
        path: "/",
      }
    );
    return response.redirect("/index");
  }
}
