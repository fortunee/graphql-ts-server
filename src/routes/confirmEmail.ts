import { Request, Response } from 'express';
import { User } from "../entity/User";
import { redis } from '../redis';

export const confirmEmail = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = await redis.get(id);
  if (userId) {
    await User.update({ id: userId }, { confirmed: true });
    await redis.del(id);
    res.status(200).send('User confirmed');
  } else {
    res.status(400).send('Invalid confrimation link');
  }
}
