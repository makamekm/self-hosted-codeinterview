import { NestFactory } from "@nestjs/core";
import * as path from "path";
import * as bodyParser from 'body-parser';
import { AppModule } from "./app.module";
import { SocketRedisAdapter } from "./adapters/socket.redis.adapter";
import { CORS, WEB_SERVER_PORT, WEB_SERVER_HOST } from "@env/config";
import { NextModule } from "@nestpress/next";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";

export const getNestConfig = () => ({
  dir: path.resolve(process.cwd()),
  quiet: false,
  conf: {
    webpack: (config, _options) => {
      config.resolve.plugins[0].paths["@env/*"] = [
        `./src/env/${process.env.MAIN_ENV || process.env.ENV || "prod"}/*`,
      ];
      return config;
    },
  },
});

export async function bootstrapAPI() {
  const app = await NestFactory.create(AppModule, {
    cors: CORS,
    logger: ["error", "warn", "log"],
  });
  const port = WEB_SERVER_PORT;

  app.use(bodyParser.json({ limit: '100mb' }));
  app.useGlobalPipes(new ValidationPipe());
  app.useWebSocketAdapter(new SocketRedisAdapter(app));

  const config = new DocumentBuilder()
    .setTitle("Code Interview")
    .setDescription("The Code Interview API description")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  app
    .get(NextModule)
    .prepare(getNestConfig() as any)
    .then(() => {
      app.listen(port, WEB_SERVER_HOST, () => {
        console.log("Server is listening...", port);
      });

      if ((module as any).hot) {
        (module as any).hot.accept();
        (module as any).hot.dispose(() => app.close());
      }
    });
}
