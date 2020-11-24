import { GraphQLServer } from 'graphql-yoga';
import { importSchema } from 'graphql-import'
import * as path from 'path';

const typeDefs = importSchema(path.join(__dirname,'./schema.graphql'));
import {resolvers} from './resolvers'; 
import { createTypeormConn } from "./utils/createTypeORMConn";

export const startServer = async () => {
    const server = new GraphQLServer({typeDefs, resolvers})
    const port = process.env.NODE_ENV === "test" ? 0 : 4000;
    await createTypeormConn();
    const app = await server.start({ port });
      console.log(`Server is running on localhost:${port}`);
    
      return app;
};