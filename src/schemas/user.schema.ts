import mongoose from "mongoose";
import { UserDto } from "~/dto/user.dto";

export const UserSchema = new mongoose.Schema({
  // innerId: { type: String, default: new mongoose.Types.ObjectId() },
  id: { type: String, index: true },
  username: String,
  email: String,
  firstName: String,
  lastName: String,
  picture: String,
  accessToken: String,
});

export interface UserDocument extends mongoose.Document, UserDto {
  readonly id: string;
}

// UserSchema.virtual('id').get(function() {
//   return this._id;
// });
