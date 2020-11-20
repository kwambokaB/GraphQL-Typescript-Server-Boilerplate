import { request} from 'graphql-request';
import { User } from '../entity/User';
import { createTypeormConn } from '../utils/createTypeORMConn';

beforeAll(async () => {
    await createTypeormConn();
});

const email = "testuser";
const password = "testuser123";

const mutation = `
mutation{
    register(email: "${email}", password: "${password}")
}`

  test('Register User', async () => {
    const response = await request("http://localhost:4000", mutation);
    expect(response).toEqual({register: true});
    const users = await User.find({where : {email}});
    expect (users).toHaveLength(1);
    const user = users[0]
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
  });