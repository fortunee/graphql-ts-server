import * as bcrypt from 'bcryptjs';
import { ResolverMap } from '../../types/graphql.utils';
import { User } from '../../entity/User';
import {
  confirmEmailErrorMessage,
  invalidLoginErrorMessage,
} from './errorMessages';

const errorResponse = [
  {
    path: 'email',
    message: invalidLoginErrorMessage,
  },
];

export const resolvers: ResolverMap = {
  Mutation: {
    login: async (_, { email, password }: GQL.ILoginOnMutationArguments) => {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return errorResponse;
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return errorResponse;
      }

      if (!user.confirmed) {
        return [{ path: 'email', message: confirmEmailErrorMessage }];
      }

      return null;
    },
  },
};
