import { request } from 'graphql-request';
import { invalidLoginErrorMessage, confirmEmailErrorMessage } from './errorMessages';
import { createTypeormConn } from '../../utils/createTypeormConn';
import { User } from '../../entity/User';

const loginMutation = (e: string, p: string) => `
    mutation {
        login(email: "${e}", password: "${p}") {
            path
            message
        }
    }
`;

const registerMutation = (e: string, p: string) => `
    mutation {
        register(email: "${e}", password: "${p}") {
            path
            message
        }
    }
`;

const loginExpect = async (e: string, p: string, errMsg: string) => {
  const res = await request(
    process.env.TEST_HOST as string,
    loginMutation(e, p)
  );

  expect(res).toEqual({
    login: [
      {
        path: 'email',
        message: errMsg,
      },
    ],
  });
};

describe('Login', () => {
  const email = 'sample@email.com';
  const password = 'samplepass';

  beforeAll(async () => {
    await createTypeormConn();
    await request(
      process.env.TEST_HOST as string,
      registerMutation(email, password)
    );
  });

  it('should fail to login an invalid user', async () => {
    await loginExpect(
      'invaliduser@email.com',
      'password',
      invalidLoginErrorMessage
    );
  });

  it('should return a confirm email info', async () => {
    await loginExpect(email, password, confirmEmailErrorMessage);
  });

  it('should fail to login a user with a wrong password', async () => {
    await loginExpect(email, 'wrongpass', invalidLoginErrorMessage)
  })

  it('should login succesfully login a valid user', async () => {
    await User.update({ email }, { confirmed: true });
    const res = await request(
      process.env.TEST_HOST as string,
      loginMutation(email, password)
    );
  
    expect(res).toEqual({ login: null })
  });
});
