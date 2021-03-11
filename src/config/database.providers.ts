import mongoose from "mongoose";
import { MONGO_CONNECTION_URL } from "@env/config";

export const databaseProviders = [
  {
    provide: "DATABASE_CONNECTION",
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect(MONGO_CONNECTION_URL),
  },
];
