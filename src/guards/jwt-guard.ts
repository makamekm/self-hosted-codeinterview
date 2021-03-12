import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";
import cookie from "cookie";
import * as jwt from "jsonwebtoken";
import { UserDto } from "~/dto/user.dto";
import { UserProvider } from "~/providers/user.provider";
import { JWT_SECRET } from "@env/config";

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly userService: UserProvider) {}

  async canActivate(context: ExecutionContext) {
    const req: Request = context.switchToHttp().getRequest();
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const authToken = cookies["session"];
    if (authToken) {
      try {
        const jwtPayload = jwt.verify(authToken, JWT_SECRET) as UserDto;
        // const user: GoogleUser = await this.userService.validateUser(jwtPayload);
        req.user = jwtPayload;
        return !!jwtPayload;
      } catch (error) {
        console.error(error);
      }
      return false;
    }
    return false;
  }
}
