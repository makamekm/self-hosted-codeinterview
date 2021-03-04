import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import { UserDto } from "~/dto/user.dto";

@Injectable()
export class WsJwtGuard implements CanActivate {
  // constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const client = context.switchToWs().getClient();
    const authToken = client.handshake.headers.authorization;
    if (!!authToken) {
      try {
        const jwtPayload = jwt.verify(
          authToken,
          process.env.JWT_SECRET
        ) as UserDto;
        // const user: GoogleUser = await this.authService.validateUser(jwtPayload);
        // context.switchToWs().getData().user = user;
        client.user = jwtPayload;
      } catch (error) {
        console.error(error);
      }
    }
    return true;
  }
}
