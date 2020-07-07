import { GraphQLServer } from 'graphql-yoga';
import { importSchema } from 'graphql-import';
import * as path from 'path';
import * as fs from 'fs';
import { makeExecutableSchema, mergeSchemas } from 'graphql-tools';
import { GraphQLSchema } from 'graphql';

import { createTypeormConn } from './utils/createTypeormConn';
import { redis } from './redis';
import { confirmEmail } from './routes/confirmEmail';

const stitchSchemas = (): GraphQLSchema[] =>
  fs.readdirSync(path.join(__dirname, './modules')).map((folder) => {
    const { resolvers } = require(`./modules/${folder}/resolvers`);
    const typeDefs = importSchema(
      path.join(__dirname, `./modules/${folder}/schema.graphql`)
    );
    return makeExecutableSchema({ resolvers, typeDefs });
  });

export const startServer = async () => {
  const schemas = stitchSchemas();
  const server = new GraphQLServer({
    schema: mergeSchemas({ schemas }),
    context: ({ request }) => ({
      redis,
      url: `${request.protocol}://${request.get('host')}`,
    }),
  });

  server.express.get('/confirm/:id', confirmEmail);

  await createTypeormConn();
  const app = await server.start({
    port: process.env.NODE_ENV === 'test' ? 0 : 3001,
  });
  console.log('Server is running on http://localhost:3001');

  return app;
};
