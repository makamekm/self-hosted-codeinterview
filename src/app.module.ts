import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  CacheModule,
} from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { PUBLIC_FOLDER, REDIS_CONFIG } from "@env/config";
import { NextMiddleware, NextModule } from "@nestpress/next";
import * as redisStore from "cache-manager-redis-store";
import { NextController } from "./controllers/next.controller";
import { FrontendMiddleware } from "./middlewares/frontend.middleware";
import { ScheduleModule } from "@nestjs/schedule";
import { RedisModule } from "nestjs-redis";
import { RoomSocketGateway } from "./gateways/room-socket.gateway";
import { CodeRunnerService } from "./providers/code-runner.provider";
import { GoogleStrategy } from "./strategies/google.strategy";
import { GoogleController } from "./controllers/google.controller";
import { EventServiceModule } from "./providers/event.provider";
import { databaseProviders } from "./config/database.providers";
import { dataProviders } from "./config/data.providers";
import { QuestionnaireProvider } from "./providers/questionnaire.provider";
import { UserProvider } from "./providers/user.provider";
import { QuestionnaireController } from "./controllers/questionnaire.controller";
import { UserController } from "./controllers/user.controller";
import { RoomProvider } from "./providers/room.provider";
import { ClusterProvider } from "./providers/cluster.provider";
// import { AskServiceModule } from "./providers/ask.provider";

@Module({
  imports: [
    // CacheModule.register(),
    EventServiceModule,
    // AskServiceModule,
    RedisModule.register(REDIS_CONFIG),
    CacheModule.register({
      ttl: 5,
      store: redisStore,
      ...REDIS_CONFIG,
    }),
    NextModule,
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_FOLDER,
      serveRoot: "/asset/",
      // renderPath: "/",
      // exclude: ["/api/*"],
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [
    NextController,
    GoogleController,
    QuestionnaireController,
    UserController,
  ],
  providers: [
    ClusterProvider,
    ...databaseProviders,
    ...dataProviders,
    UserProvider,
    QuestionnaireProvider,
    RoomProvider,
    RoomSocketGateway,
    CodeRunnerService,
    GoogleStrategy,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // handle scripts
    consumer.apply(NextMiddleware).forRoutes({
      path: "_next*",
      method: RequestMethod.GET,
    });

    // handle other assets
    consumer.apply(NextMiddleware).forRoutes({
      path: "images/*",
      method: RequestMethod.GET,
    });

    consumer.apply(NextMiddleware).forRoutes({
      path: "favicon.ico",
      method: RequestMethod.GET,
    });

    consumer
      .apply(FrontendMiddleware)
      .exclude("api/(.*)", "asset/(.*)", "socket.io/(.*)")
      .forRoutes({
        path: "*",
        method: RequestMethod.GET,
      });
  }
}
