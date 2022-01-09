import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth';

const router = Router();

router.post(
  '/login',
  [
    body('email', 'Invalid email').normalizeEmail().trim().isEmail(),
    body('password', 'Invalid password').trim().isLength({ min: 5 }),
  ],
  authController.login
);

router.post(
  '/signup',
  [
    body('email', 'Invalid email').normalizeEmail().trim().isEmail(),
    body('password', 'Invalid password').trim().isLength({ min: 5 }),
    body('name', 'Invalid name').trim().not().isEmpty(),
  ],
  authController.signup
);

export default router;
