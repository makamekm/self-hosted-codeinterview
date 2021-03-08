import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  CacheModule,
} from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { PUBLIC_FOLDER } from "@env/config";
import { NextMiddleware, NextModule } from "@nestpress/next";
import * as redisStore from "cache-manager-redis-store";
import { NextController } from "./controllers/next.controller";
import { FrontendMiddleware } from "./middlewares/frontend.middleware";
import { ScheduleModule } from "@nestjs/schedule";
import { RedisModule } from "nestjs-redis";
import { AppGateway } from "./providers/app-gateway.service";
import { CodeRunnerService } from "./providers/code-runner.provider";
import { GoogleStrategy } from "./strategies/google.strategy";
import { GoogleController } from "./controllers/google.controller";
import { EventServiceModule } from "./providers/event.service";
import { databaseProviders } from "./providers/database.providers";
import { dataProviders } from "./providers/data.providers";
import { QuestionnaireService } from "./providers/questionnaire.service";
import { UserService } from "./providers/user.service";
import { QuestionnaireController } from "./controllers/questionnaire.controller";
import { UserController } from "./controllers/user.controller";

@Module({
  imports: [
    // CacheModule.register(),
    EventServiceModule,
    RedisModule.register({
      host: "localhost",
      port: 6379,
    }),
    CacheModule.register({
      ttl: 5,
      store: redisStore,
      host: "localhost",
      port: 6379,
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
    ...databaseProviders,
    ...dataProviders,
    UserService,
    QuestionnaireService,
    AppGateway,
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
