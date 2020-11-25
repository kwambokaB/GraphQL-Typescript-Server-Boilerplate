import { request} from 'graphql-request';
import { User } from '../../entity/User';
import { createTypeormConn } from '../../utils/createTypeORMConn';
import {  duplicatEmail, emailNotLongEnough, invalidEmail, passwordNotLongEnough } from './errorMessages';


beforeAll(async () => {
 await createTypeormConn()
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
  const response = await request(process.env.TEST_HOST as string, mutation(email, password));
  expect(response).toEqual({ register: null });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);
  })

  // check if email already exists
  it("should not register a duplicate user", async () => {
  const response = await request(process.env.TEST_HOST as string, mutation(email, password));
  expect(response.register).toHaveLength(1);
  expect(response.register[0]).toEqual({
  path: "email",
  message: duplicatEmail
  });
  });

  // check if email length is badly formated
  it("should not register a user with an short email", async () => {
  const response: any = await request(process.env.TEST_HOST as string, mutation("em", password));
  expect(response.register).toHaveLength(2);
  expect(response.register).toEqual([{
    "message": emailNotLongEnough,
    "path": "email"
  }, {
    "message": invalidEmail,
    "path": "email"
  }]
)
  })

  // check if email is badly formated
  it("should not register a user with an invalid email", async () => {
  const response = await request(process.env.TEST_HOST as string, mutation("email123", password));
  expect(response.register).toHaveLength(1);
  expect(response.register).toEqual([{
    "message": invalidEmail,
    "path": "email"
  }],
);
  })

  //check if password is badly formated
  it("should not register a user with an invalid password", async () => {
    const response: any = await request(process.env.TEST_HOST as string, mutation(email, "a"));
    expect(response.register).toHaveLength(1);
    expect(response.register).toEqual([{
        "message": passwordNotLongEnough,
        "path": "password"
      }]
    )
  });

  // check if both email and password are badly formated
  it("should not register a user with an invalid password and invalid email", async () => {
    const response: any = await request(process.env.TEST_HOST as string, mutation("a", "a"));
    expect(response.register).toHaveLength(3);
    expect(response.register).toEqual([{
        "message": emailNotLongEnough,
        "path": "email"
      }, {
        "message": invalidEmail,
        "path": "email"
      }, {
        "message": passwordNotLongEnough,
        "path": "password"
      },]
    )
  });

});