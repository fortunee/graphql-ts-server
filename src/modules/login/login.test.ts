import { request } from 'graphql-request';
import { invalidLoginErrorMessage } from './errorMessages';

const loginMutation = (e: string, p: string) => `
    mutation {
        login(email: "${e}", password: "${p}") {
            path
            message
        }
    }
`;

describe('Login', () => {
  it('should fail to login an invalid user', async () => {
    const res = await request(
      process.env.TEST_HOST as string,
      loginMutation('invaliduser@email.com', 'password')
    );

    expect(res).toEqual({
      login: [
        {
          path: 'email',
          message: invalidLoginErrorMessage
        }
      ]
    })
  });
});
