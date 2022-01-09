import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import HttpError from '../models/HttpError';
import User from '../models/User';

export const login: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError('Validation Failed', 422, errors.array());
    return next(error);
  }

  const { email, password } = req.body as { email: string; password: string };
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new HttpError('User not found', 422);
      return next(error);
    }
    const doMatch = await bcrypt.compare(password, user.password);
    if (!doMatch) {
      const error = new HttpError('Password does not match', 422);
      return next(error);
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user.id,
      },
      'secretprivatekey',
      { expiresIn: '1h' }
    );
    res.status(200).json({
      message: 'Logged In',
      userId: user.id,
      token,
    });
  } catch (err) {
    return next(err);
  }
};

export const signup: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError('Validation Failed', 401, errors.array());
    return next(error);
  }

  const { email, name, password } = req.body as {
    email: string;
    password: string;
    name: string;
  };
  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      const error = new HttpError('Email exists in database', 422);
      return next(error);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();

    return res.status(201).json({
      message: 'Sign Up Success',
    });
  } catch (err) {
    return next(err);
  }
};
