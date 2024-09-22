// global.d.ts

import { Mongoose } from 'mongoose';

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  namespace NodeJS {
    interface Global {
      mongoose: MongooseConnection;
    }
  }
}

export {}; // This ensures the file is treated as a module
