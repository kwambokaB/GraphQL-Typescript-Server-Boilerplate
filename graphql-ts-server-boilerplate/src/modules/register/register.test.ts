import { request} from 'graphql-request';
import { AddressInfo } from 'net';
import { getConnection } from 'typeorm';
import { User } from '../../entity/User';
import { startServer } from '../../startSever';


let getHost = () => "";

beforeAll(async () => {
  const app = await startServer();
  const { port } = app.address() as AddressInfo;
  getHost = () => `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  await getConnection().close();
});

const email = "testuser@email.com";
const password = "testuser123";

const mutation = `
mutation {
  register(email: "${email}", password: "${password}"){
    path
    message
  }
}
`;

test("Register user", async () => {
  const response = await request(getHost(), mutation);
  expect(response).toEqual({ register: null });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);

  const response2 = await request(getHost(), mutation);
  expect(response2.register).toHaveLength(1);
  expect(response2.register[0].path).toEqual("email");
});