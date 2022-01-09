import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import HttpError from '../models/HttpError';

const isAuth: RequestHandler = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new HttpError('Not Authorized', 401);
    return next(error);
  }

  const token = authHeader.split(' ')[1];
  const decodedToken = jwt.verify(token, 'secretprivatekey');
  if (!decodedToken) {
    const error = new HttpError('Failed to decode token', 500);
    return next(error);
  }
  if (typeof decodedToken === 'string') {
    const error = new HttpError('Token does not have correct structure', 500);
    return next(error);
  } else {
    req.userId = decodedToken.userId;
  }
  next();
};

export default isAuth;
