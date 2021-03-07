import mongoose from "mongoose";
import { QuestionnaireDto } from "~/dto/questionnaire.dto";

export const QuestionnaireSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.ObjectId, auto: true, index: true },
    language: { type: String, index: true },
    name: { type: String, index: true },
    date: { type: Date, default: Date.now, index: true },
    isPublic: { type: Boolean, default: false, index: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sections: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId(),
        },
        name: String,
        description: String,
        questions: [
          {
            id: {
              type: mongoose.Schema.Types.ObjectId,
              default: () => new mongoose.Types.ObjectId(),
            },
            name: String,
            description: String,
            code: String,
            language: String,
          },
        ],
      },
    ],
  },
  {
    _id: false,
    // capped: 1024 // in bytes
  }
);

export interface QuestionnaireDocument
  extends mongoose.Document,
    QuestionnaireDto {
  readonly id: string;
}

// QuestionnaireSchema.virtual("id").get(function () {
//   return this._id;
// });
