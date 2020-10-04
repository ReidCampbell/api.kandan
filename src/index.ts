import 'reflect-metadata';
import 'dotenv-safe/config';
import { COOKIE_NAME, __prod__ } from './constants';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './resolvers/user';
import { PostResolver } from './resolvers/post';
import { CommentResolver } from './resolvers/comment';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { MyContext } from './types';
import cors from 'cors';
import { createConnection } from 'typeorm';
import { Post } from './entities/Post';
import { User } from './entities/User';
import { Comment } from './entities/Comment';
import path from 'path';
import { Updoot } from './entities/Updoot';
import { createUserLoader } from './util/createUserLoader';
import { createUpdootLoader } from './util/createUpdootLoader';
import { createPostLoader } from './util/createPostLoader';
import { Reply } from './entities/Reply';
import { ReplyResolver } from './resolvers/reply';
import { createCommentLoader } from './util/createCommentLoader';

const main = async () => {
  const connection = await createConnection({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    logging: true,
    // synchronize: true,
    migrations: [path.join(__dirname, './migrations/*')],
    entities: [Post, User, Updoot, Comment, Reply],
    // dropSchema: true,
  });

  await connection.runMigrations();

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis(process.env.REDIS_URL);
  app.set('trust proxy', 1);
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redis, disableTouch: true }),
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: 'lax',
        secure: __prod__, // cookie only works in https
        domain: __prod__ ? '.reidcampbell.xyz' : undefined,
      },
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver, CommentResolver, ReplyResolver],
      validate: false,
    }),
    context: ({ req, res }: MyContext) => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      updootLoader: createUpdootLoader(),
      postLoader: createPostLoader(),
      commentLoader: createCommentLoader(),
    }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(parseInt(process.env.PORT), () => {
    console.log('server started');
  });
};

main().catch(err => {
  console.error(err);
});
