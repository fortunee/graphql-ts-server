import { importSchema } from 'graphql-import';
import * as path from 'path';
import * as fs from 'fs';
import { makeExecutableSchema, mergeSchemas } from 'graphql-tools';
import { GraphQLSchema } from 'graphql';

export const genSchema = (): GraphQLSchema => {
  const schemas = fs.readdirSync(path.join(__dirname, '../modules')).map((folder) => {
    const { resolvers } = require(`../modules/${folder}/resolvers`);
    const typeDefs = importSchema(
      path.join(__dirname, `../modules/${folder}/schema.graphql`)
    );
    return makeExecutableSchema({ resolvers, typeDefs });
  });


  return mergeSchemas({ schemas })
}
