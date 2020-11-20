import { createConnection, getConnectionOptions } from "typeorm";

export const createTypeormConn = async () => {
  const connOptions =  await getConnectionOptions(process.env.NODE_ENV);
  return createConnection({...connOptions, name: "default"});
}