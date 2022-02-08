import UserModel from '../../../models/user/UserModel';
import { validateLogin } from './validators';
import config from '../../../config';
import jwt from 'jsonwebtoken';
import BaseWorkflow from '../../BaseWorkflow';

export default class LoginWorkflow extends BaseWorkflow {
  format = (rawInput) => ({
    email: rawInput.email,
    password: rawInput.password,
  });

  validate = async (input) => {
    const { email, password } = input;

    await validateLogin({ email, password });
  };

  process = async (input) => {
    const { email, password } = input;
    const { jwtSecret } = config;

    const user = await UserModel.findOne({ 'profile.email': email });

    const jwtConfig = { algorithm: 'HS256', expiresIn: '30m' };
    const jwtPayload = {
      user: {
        id: user.id,
        email,
        password,
        permission: {
          role: user.profile.permission.role,
          level: user.profile.permission.level,
        },
      },
    };

    const token = jwt.sign(jwtPayload, jwtSecret, jwtConfig);

    return {
      token,
    };
  };
}
