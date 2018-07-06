import * as Redis from 'ioredis';
import fetch from 'node-fetch';

import { createTypeormConn } from "./createTypeormConn";
import { User } from "../entity/User";
import { createConfirmEmailLink } from "./CreateConfirmEmailLink";

let userId = '';
let link: string;

describe('Email Confirmation Link', () => {
    const redis = new Redis();
    beforeAll(async () => {
        await createTypeormConn();
        const user = await User.create({
            email: 'fortune@e.com',
            password: 'pass123'
        }).save();
    
        userId = user.id;
        link = await createConfirmEmailLink(
            process.env.TEST_HOST as string,
            userId,
            redis
        );
    });

    it('Ensures a user is confirmed when they click the link', async () => {
        const response = await fetch(link);
        const text = await response.text();
        expect(text).toEqual('User confirmed');
    });

    it('Ensures user confirmed value is set to true', async() => {
        const user = await User.findOne({ where: { id: userId } });
        expect((user as User).confirmed).toBeTruthy();
    })

})
