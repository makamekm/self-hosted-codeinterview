import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { QuestionnaireDto } from "~/dto/questionnaire.dto";

export const QuestionnaireSchema = new mongoose.Schema(
  {
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
          type: String,
          default: () => uuidv4(),
        },
        name: String,
        description: String,
        questions: [
          {
            id: {
              type: String,
              default: () => uuidv4(),
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
    _id: true,
    // capped: 1024 // in bytes
  }
);

export interface QuestionnaireDocument
  extends mongoose.Document,
    QuestionnaireDto {}

// QuestionnaireSchema.virtual("id").get(function () {
//   return this._id;
// });
