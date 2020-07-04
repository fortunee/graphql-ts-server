import { GraphQLServer } from 'graphql-yoga';
import { importSchema } from 'graphql-import';
import * as path from 'path';
import * as fs from 'fs';
import { makeExecutableSchema, mergeSchemas } from 'graphql-tools';
import { GraphQLSchema } from 'graphql';
import * as Redis from 'ioredis';

import { createTypeormConn } from './utils/createTypeormConn';
import { User } from './entity/User';

const getSchemas = (): GraphQLSchema[] => {
  const folders = fs.readdirSync(path.join(__dirname, './modules'));
  return folders.map((folder) => {
    const { resolvers } = require(`./modules/${folder}/resolvers`);
    const typeDefs = importSchema(
      path.join(__dirname, `./modules/${folder}/schema.graphql`)
    );
    return makeExecutableSchema({ resolvers, typeDefs });
  });
};

export const startServer = async () => {
  const schemas = getSchemas();
  const redis = new Redis();
  const server = new GraphQLServer({
    schema: mergeSchemas({ schemas }),
    context: ({ request }) => ({
      redis,
      url: `${request.protocol}://${request.get('host')}`,
    }),
  });

  server.express.get('/confirm/:id', async (req, res) => {
    const { id } = req.params;
    const userId = await redis.get(id);
    if (userId) {
      await User.update({ id: userId }, { confirmed: true });
      await redis.del(id);
      res.status(200).send('User confirmed');
    } else {
      res.status(400).send('Invalid confrimation link');
    }
  });

  await createTypeormConn();
  const app = await server.start({
    port: process.env.NODE_ENV === 'test' ? 0 : 3001,
  });
  console.log('Server is running on http://localhost:3001');

  return app;
};
