import * as Redis from 'ioredis';
import { createTypeormConn } from "./createTypeormConn";
import { User } from "../entity/User";
import { createConfirmEmailLink } from "./CreateConfirmEmailLink";

let userId = '';

describe('Email Confirmation Link', () => {
    beforeAll(async () => {
        await createTypeormConn();
        const user = await User.create({
            email: 'fortune@e.com',
            password: 'pass123'
        }).save();
    
        userId = user.id;
    });

    it('Ensures createConfirmationLink works', () => {
        const link = createConfirmEmailLink(
            process.env.TEST_HOST as string,
            userId,
            new Redis()
        )
    });
})

