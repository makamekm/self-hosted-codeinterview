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
import { NextController } from "./next.controller";
import { FrontendMiddleware } from "./frontend.middleware";
import { ScheduleModule } from "@nestjs/schedule";
import { RedisModule } from "nestjs-redis";
import { AppController } from "./app.controller";
import { AppGateway } from "./app-gateway.service";

@Module({
  imports: [
    // CacheModule.register(),
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
  controllers: [NextController, AppController],
  providers: [AppGateway],
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
