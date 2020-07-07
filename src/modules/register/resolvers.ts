import * as bcrypt from 'bcryptjs';
import * as yup from 'yup';
import { ResolverMap } from '../../types/graphql.utils';
import { User } from '../../entity/User';
import { formatYupError } from '../../utils/formatYupError';
import {
  duplicateEmail,
  emailTooShort,
  invalidEmail,
  invalidPassword,
} from './errorMessages';
import { createConfirmEmailLink } from '../../utils/CreateConfirmEmailLink';
import { sendEmail } from '../../utils/sendEmail';

const validationSchema = yup.object().shape({
  email: yup.string().min(3, emailTooShort).max(255).email(invalidEmail),
  password: yup.string().min(3, invalidPassword).max(255),
});

export const resolvers: ResolverMap = {
  Mutation: {
    register: async (
      _,
      args: GQL.IRegisterOnMutationArguments,
      { redis, url }
    ) => {
      try {
        await validationSchema.validate(args, { abortEarly: false });
      } catch (error) {
        return formatYupError(error);
      }
      const { email, password } = args;
      const isExistingUser = await User.findOne({
        where: { email },
        select: ['id'],
      });

      if (isExistingUser) {
        return [
          {
            path: 'email',
            message: duplicateEmail,
          },
        ];
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create({
        email,
        password: hashedPassword,
      });

      await user.save();

      await sendEmail(email, await createConfirmEmailLink(url, user.id, redis));
      return null;
    },
  },
};
