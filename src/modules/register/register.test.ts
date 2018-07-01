import { request } from 'graphql-request';
import { User } from '../../entity/User';
import { startServer } from '../../startServer';
import { duplicateEmail } from './errorMessages';

let getHost = () => '';

beforeAll(async () => {
    const app = await startServer();
    const { port } = app.address();
    getHost = () => `http://127.0.0.1:${port}`;
})

const email = 'fortune@fortune.com';
const password = 'pass123';

const mutation = (e: string, p: string) => `
    mutation {
        register(email: "${e}", password: "${p}") {
            path
            message
        }
    }
`;

test('Ensures a user is registered', async() => {
    // Ensures a user is registered
    const response = await request(getHost(), mutation(email, password));
    expect(response).toEqual({ register: null });
    const users = await User.find({ where: { email }});
    expect(users).toHaveLength(1);
    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);

    // Ensures duplicate emails should fail
    const response2: any = await request(getHost(), mutation(email, password));
    expect(response2.register).toHaveLength(1);
    expect(response2.register[0]).toEqual({
        path: 'email',
        message: duplicateEmail
    });

    // Ensures invalid or short emails should fail
    const response3: any = await request(getHost(), mutation("f", password));
    expect(response3.register).toHaveLength(1);
    expect(response3.register[0].path).toEqual('email');

});
