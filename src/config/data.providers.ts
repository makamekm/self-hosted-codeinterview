import { Connection } from "mongoose";
import { QuestionnaireSchema } from "~/schemas/questionnaire.schema";
import { UserSchema } from "~/schemas/user.schema";

export const dataProviders = [
  {
    provide: "USER_MODEL",
    useFactory: (connection: Connection) =>
      connection.model("User", UserSchema),
    inject: ["DATABASE_CONNECTION"],
  },
  {
    provide: "QUESTIONNAIRE_MODEL",
    useFactory: (connection: Connection) =>
      connection.model("Questionnaire", QuestionnaireSchema),
    inject: ["DATABASE_CONNECTION"],
  },
];
