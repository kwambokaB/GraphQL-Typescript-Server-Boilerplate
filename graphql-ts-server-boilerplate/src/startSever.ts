import { GraphQLServer } from 'graphql-yoga';
import { importSchema } from 'graphql-import'
import * as path from 'path';
import * as fs from 'fs';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLSchema } from 'graphql';


import { createTypeormConn } from "./utils/createTypeORMConn";
import { mergeSchemas } from '@graphql-tools/merge';

export const startServer = async () => {
  const schemas: GraphQLSchema[] = [];
  const folders = fs.readdirSync(path.join(__dirname, "./modules"));
  folders.forEach(folder => {
    const { resolvers } = require(`./modules/${folder}/resolvers`);
    const typeDefs = importSchema(
      path.join(__dirname, `./modules/${folder}/schema.graphql`)
    );
    schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  });
  const schema: any = mergeSchemas({ schemas });
  const server = new GraphQLServer({ schema });
    const port = process.env.NODE_ENV === "test" ? 0 : 4000;
    await createTypeormConn();
    const app = await server.start({ port });
      console.log(`Server is running on localhost:${port}`);
    
      return app;
};