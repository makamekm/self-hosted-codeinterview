import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";
import cookie from "cookie";
import * as jwt from "jsonwebtoken";
import { UserDto } from "~/dto/user.dto";
import { UserService } from "~/providers/user.service";

@Injectable()
export class JwtOptionalGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext) {
    const req: Request = context.switchToHttp().getRequest();
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const authToken = cookies["session"];
    if (authToken) {
      try {
        const jwtPayload = jwt.verify(
          authToken,
          process.env.JWT_SECRET
        ) as UserDto;
        // const user: GoogleUser = await this.authService.validateUser(jwtPayload);
        req.user = jwtPayload;
      } catch (error) {
        console.error(error);
      }
      return true;
    }
    return true;
  }
}
