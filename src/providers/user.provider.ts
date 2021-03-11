import { Model, Types } from "mongoose";
import { Injectable, Inject } from "@nestjs/common";
import { UserDto } from "~/dto/user.dto";
import { UserDocument } from "~/schemas/user.schema";

@Injectable()
export class UserProvider {
  constructor(
    @Inject("USER_MODEL")
    private userModel: Model<UserDocument>
  ) {}

  async create(userDto: UserDto): Promise<UserDocument> {
    const createdRecord = new this.userModel(userDto);
    return createdRecord.save();
  }

  async getByIdAndProvider(
    id: string,
    provider: string
  ): Promise<UserDocument> {
    const result = await this.userModel
      .findOne({
        id: id,
        provider: provider,
      })
      .exec();

    delete result?.accessToken;

    return result;
  }

  async get(id: string): Promise<UserDocument> {
    const result = await this.userModel
      .findOne({
        _id: Types.ObjectId(id),
      })
      .exec();

    delete result?.accessToken;

    return result;
  }

  async update(userDto: UserDto): Promise<UserDocument> {
    return await this.userModel.findOneAndUpdate(
      {
        _id: Types.ObjectId(userDto._id),
      },
      userDto
    );
  }

  async find(username: string, limit: number): Promise<UserDocument[]> {
    const result = await this.userModel
      .find(
        {
          username: { $regex: new RegExp(username, "i") },
        },
        {
          accessToken: 0,
        }
      )
      .sort({ username: 1 })
      .limit(limit)
      .exec();

    return result;
  }
}
