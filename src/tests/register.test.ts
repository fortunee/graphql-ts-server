import { request } from 'graphql-request';

import { host } from "./constants";
import { createConnection } from 'typeorm';
import { User } from '../entity/User';

const email = 'fortune@fortune.com';
const password = 'pass123';

const mutation = `
    mutation {
        register(email: "${email}", password: "${password}")
    }
`;

/**
 * @todo
 * Use test db
 * drop test db after test is done running or is about to start
 * test script should also start server before test starts running
 * Avoid createConnection()
 */
test('adds 1 + 2 to equal 3', async() => {
    const response = await request(host, mutation);
    expect(response).toEqual({ register: true });
    await createConnection();
    const users = await User.find({ where: { email }});
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
});
