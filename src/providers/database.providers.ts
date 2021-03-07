import mongoose from "mongoose";

export const databaseProviders = [
  {
    provide: "DATABASE_CONNECTION",
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect("mongodb://nest:password@localhost:27017/nest"), // TODO: extract to env
  },
];
