import * as Redis from 'ioredis';
import fetch from "node-fetch";

import { User } from "../entity/User"
import { createConfirmEmailLink } from "./createConfirmEmailLink"
import { createTypeormConn } from "./createTypeORMConn"


let userId: string;

beforeAll(async () => {
   await createTypeormConn()
   const user = await User.create({
       email: "testuser@gmail.com",
       password:"testuser123"
   }).save();
   userId = user.id;
   });

test("Make sure createConfirmLink works", async() => {
    // confirm that link works
    const redis =  new Redis()
    const url = await createConfirmEmailLink(process.env.TEST_HOST as string, userId, redis);
    const response  = await fetch(url);
    const text = await response.text();
    expect(text).toEqual('ok');
    //confirm equal to true
    const user = await User.findOne({where: {id: userId}});
    expect((user as User).confirmed).toBeTruthy();
    // confirm id is removed from redis
    const chunks = url.split("/");
    const key = chunks[chunks.length -1];
    const value = await redis.get(key);
    expect(value).toBeNull
})