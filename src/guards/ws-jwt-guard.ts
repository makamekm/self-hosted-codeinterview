import { JWT_SECRET } from "@env/config";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import { UserDto } from "~/dto/user.dto";
import { UserProvider } from "~/providers/user.provider";

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly userService: UserProvider) {}

  async canActivate(context: ExecutionContext) {
    const client = context.switchToWs().getClient();
    const authToken = client.handshake.headers.authorization;
    if (authToken) {
      try {
        const jwtPayload = jwt.verify(authToken, JWT_SECRET) as UserDto;
        // const user: GoogleUser = await this.userService.validateUser(jwtPayload);
        // context.switchToWs().getData().user = user;
        client.user = jwtPayload;
      } catch (error) {
        console.error(error);
      }
    }
    return true;
  }
}
