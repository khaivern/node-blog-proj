import { Router } from 'express';
import { body } from 'express-validator';

import * as feedController from '../controllers/feed';
import isAuth from '../middlewares/is-auth';

const router = Router();

router.use(isAuth);

router.get('/posts', feedController.getPosts);

router.post(
  '/post',
  [
    body('title', 'Validating title failed').trim().isLength({ min: 5 }),
    body('content', 'Validating content failed').trim().isLength({ min: 5 }),
  ],
  feedController.createPost
);

router.get('/post/:pId', feedController.getPost);

router.put(
  '/post/:pId',
  [
    body('title', 'Validating title failed').trim().isLength({ min: 5 }),
    body('content', 'Validating content failed').trim().isLength({ min: 5 }),
  ],
  feedController.updatePost
);

router.delete('/post/:pId', feedController.deletePost);

router.get('/status', feedController.getStatus);

router.put('/status', feedController.updateStatus);

export default router;
