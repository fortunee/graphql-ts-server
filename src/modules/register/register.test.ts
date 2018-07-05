import { request } from 'graphql-request';
import { User } from '../../entity/User';
import { startServer } from '../../startServer';
import { duplicateEmail, emailTooShort, invalidEmail, invalidPassword } from './errorMessages';

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

describe('Register user', async() => {
    it('Ensures a user is registered', async() => {
        const response = await request(getHost(), mutation(email, password));
        expect(response).toEqual({ register: null });
        const users = await User.find({ where: { email }});
        expect(users).toHaveLength(1);
        const user = users[0];
        expect(user.email).toEqual(email);
        expect(user.password).not.toEqual(password);
    })

    it('Ensures duplicate emails should fail', async() => {
        const response2: any = await request(getHost(), mutation(email, password));
        expect(response2.register).toHaveLength(1);
        expect(response2.register[0]).toEqual({
            path: 'email',
            message: duplicateEmail
        });
    })

    it('Ensures invalid or short emails should fail', async() => {
        const response3: any = await request(getHost(), mutation("f", password));
        expect(response3).toEqual({
            register: [
                {
                    path: 'email',
                    message: emailTooShort,
                },
                {
                    path: 'email',
                    message: invalidEmail,
                }
            ]
        });
    })

    it('Ensures invalid password should fail', async() => {
        const response4: any = await request(getHost(), mutation(email, "fo"));
        expect(response4).toEqual({
            register: [
                {
                    path: 'password',
                    message: invalidPassword,
                }
            ]
        });
    })

    it('Ensures short and invalid email with invalid password should fail', async() => {
        const response5: any = await request(getHost(), mutation("f", "fo"));
        expect(response5).toEqual({
            register: [
                {
                    path: 'email',
                    message: emailTooShort,
                },
                {
                    path: 'email',
                    message: invalidEmail,
                },
                {
                    path: 'password',
                    message: invalidPassword,
                }
            ]
        });
    })

});
