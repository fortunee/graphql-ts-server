import { createTypeormConn } from "./createTypeormConn";
import { User } from "../entity/User";

let userId = '';

beforeAll(async () => {
    await createTypeormConn();
    const user = await User.create({
        email: 'fortune@e.com',
        password: 'pass123'
    }).save();

    userId = user.id;
});