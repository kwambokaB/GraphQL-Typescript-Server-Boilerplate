import { request} from 'graphql-request';
import { AddressInfo } from 'net';
import { User } from '../../entity/User';
import { startServer } from '../../startSever';
import { duplicatEmail, emailNotLongEnough, invalidEmail, passwordNotLongEnough } from './errorMessages';


let getHost = () => "";

beforeAll(async () => {
  const app = await startServer();
  const { port } = app.address() as AddressInfo;
  getHost = () => `http://127.0.0.1:${port}`;
});


const email = "testuser@email.com";
const password = "testuser123";

const mutation = (e: string, p:string) => 
`
mutation {
  register(email: "${e}", password: "${p}"){
    path
    message
  }
}
`;


describe("A register mutation",  () => {
  // check if we can register a user
  it("should register a valid user", async () => {

  const response = await request(getHost(), mutation(email, password));
  expect(response).toEqual({ register: null });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);

  })
  // check if email already exists
  it("should not register a duplicate user", async () => {

  const response2 = await request(getHost(), mutation(email, password));
  expect(response2.register).toHaveLength(1);
  expect(response2.register[0].path).toEqual({
    path: "email",
    message: duplicatEmail
  });

  })

  // check if email length is badly formated
  it("should not register a user with an short email", async () => {
  const response3 = await request(getHost(), mutation("em", password));
  expect(response3.register).toHaveLength(1);
  expect(response3.register[0].path).toEqual({
    register: [
      {
    path: "email",
    message: emailNotLongEnough
  },
      {
    path: "email",
    message: invalidEmail
  },
]});
  })

  // check if email is badly formated
  it("should not register a user with an invalid email", async () => {
  const response4 = await request(getHost(), mutation("email123", password));
  expect(response4.register).toHaveLength(1);
  expect(response4.register[0].path).toEqual({
    path: "email",
    message: invalidEmail
  },
);
  })

  //check if password is badly formated
  it("should not register a user with an invalid password", async () => {
  const response5 = await request(getHost(), mutation(email, "ab"));
  expect(response5.register).toHaveLength(1);
  expect(response5.register[0].path).toEqual({
    path: "password",
    message: passwordNotLongEnough
  });
  })

  // check if both email and password are badly formated
  it("should not register a user with an invalid password and invalid email", async () => {
  const response6 = await request(getHost(), mutation("ab", "ab"));
  expect(response6.register).toHaveLength(1);
  expect(response6.register[0].path).toEqual({
    register: [
      {
    path: "email",
    message: emailNotLongEnough
      },
      {
    path: "email",
    message: invalidEmail
      },
      {
    path: "password",
    message: passwordNotLongEnough
      },
]});
  })

});