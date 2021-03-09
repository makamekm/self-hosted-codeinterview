import { Model } from "mongoose";
import { Injectable, Inject } from "@nestjs/common";
import { UserDto } from "~/dto/user.dto";
import { UserDocument } from "~/schemas/user.schema";

@Injectable()
export class UserService {
  constructor(
    @Inject("USER_MODEL")
    private userModel: Model<UserDocument>
  ) {}

  async create(userDto: UserDto): Promise<UserDocument> {
    const createdRecord = new this.userModel(userDto);
    return createdRecord.save();
  }

  async get(id: string): Promise<UserDocument> {
    const result = await this.userModel.findOne({ id }).exec();

    delete result?.accessToken;

    return result;
  }

  async update(userDto: UserDto): Promise<UserDocument> {
    return await this.userModel.findOneAndUpdate(
      {
        id: userDto.id,
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
