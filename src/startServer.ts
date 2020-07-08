import 'dotenv/config';
import { GraphQLServer } from 'graphql-yoga';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';

import { createTypeormConn } from './utils/createTypeormConn';
import { redis } from './redis';
import { confirmEmail } from './routes/confirmEmail';
import { genSchema } from './utils/generateSchema';

const RedisStore = connectRedis(session);

export const startServer = async () => {
  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request }) => ({
      redis,
      session: request.session,
      url: `${request.protocol}://${request.get('host')}`,
    }),
  });

  server.express.use(
    session({
      store: new RedisStore({
        client: redis as any
      }),
      name: 'qid',
      secret: process.env.SESSION_SECRET as string,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7, // for 7 days
      },
    })
  );

  const cors = {
    credentials: true,
    origin: process.env.CLIENT_URL as string,
  };

  server.express.get('/confirm/:id', confirmEmail);

  await createTypeormConn();
  const app = await server.start({
    cors,
    port: process.env.NODE_ENV === 'test' ? 0 : 3001,
  });
  console.log('Server is running on http://localhost:3001');

  return app;
};
