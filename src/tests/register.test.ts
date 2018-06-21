import { request } from 'graphql-request';

 import { User } from '../entity/User';
import { startServer } from '../startServer';

let getHost = () => '';

beforeAll(async () => {
    const app = await startServer();
    const { port } = app.address();
    getHost = () => `http://127.0.0.1:${port}`;
})

const email = 'fortune@fortune.com';
const password = 'pass123';

const mutation = `
    mutation {
        register(email: "${email}", password: "${password}")
    }
`;

test('Ensures a user is registered', async() => {
    const response = await request(getHost(), mutation);
    expect(response).toEqual({ register: true });
    const users = await User.find({ where: { email }});
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);
});
