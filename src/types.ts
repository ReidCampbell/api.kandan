import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import { createUpdootLoader } from './util/createUpdootLoader';
import { createUserLoader } from './util/createUserLoader';

export type MyContext = {
  req: Request & { session: Express.Session };
  res: Response;
  redis: Redis;
  userLoader: ReturnType<typeof createUserLoader>;
  updootLoader: ReturnType<typeof createUpdootLoader>;
};
