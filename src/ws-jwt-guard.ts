import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import * as jwt from "jsonwebtoken";

export interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  // constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const client = context.switchToWs().getClient();
    const authToken = client.handshake.headers.authorization;
    if (authToken) {
      const jwtPayload = jwt.verify(
        authToken,
        process.env.JWT_SECRET
      ) as GoogleUser;
      // const user: GoogleUser = await this.authService.validateUser(jwtPayload);
      // context.switchToWs().getData().user = user;
      client.user = jwtPayload;
    }
    return true;
  }
}
