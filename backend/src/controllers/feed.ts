import fs from 'fs';
import path from 'path';
import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import HttpError from '../models/HttpError';
import Post from '../models/Post';
import User from '../models/User';

export const getPosts: RequestHandler = async (req, res, next) => {
  const page = req.query.page || 1;
  const currentPage = +page;
  const perPage = 2;
  let totalItems: number = 0;
  try {
    await Post.find()
      .countDocuments()
      .then((count) => (totalItems = count));
    const posts = await Post.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .populate({ path: 'creator', select: 'name' });
    if (!posts || posts.length === 0) {
      const error = new HttpError('No posts found', 404);
      return next(error);
    }

    return res.status(200).json({
      message: 'Posts fetched',
      posts,
      totalItems,
    });
  } catch (err) {
    return next(err);
  }
};

export const createPost: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError('Validation Failed', 422, errors.array());
    return next(error);
  }

  if (!req.file) {
    const error = new HttpError('Image File not set', 422);
    return next(error);
  }

  const imageURL = req.file.path.replace('\\', '/');

  const { title, content } = req.body as { title: string; content: string };

  const post = new Post({
    title,
    content,
    creator: req.userId,
    imageURL,
  });

  try {
    const postResult = await post.save();
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new HttpError('User not found', 404);
      throw error;
    }
    user.posts.push(post);
    await user.save();

    return res.status(201).json({
      message: 'Post Created',
      post: postResult,
      creator: { _id: user.id, name: user.name },
    });
  } catch (err) {
    return next(err);
  }
};

export const getPost: RequestHandler = async (req, res, next) => {
  const pId = req.params.pId;

  try {
    const post = await Post.findById(pId);
    if (!post) {
      const error = new HttpError('Could not find post', 422);
      return next(error);
    }
    return res.status(200).json({
      message: 'Single post fetched',
      post,
    });
  } catch (err) {
    return next(err);
  }
};

export const updatePost: RequestHandler = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError('Validation failed', 422, errors.array());
    return next(error);
  }

  const pId = req.params.pId;
  const { title, content } = req.body as { title: string; content: string };
  try {
    const post = await Post.findById(pId);
    if (!post) {
      const error = new HttpError('Post not found', 404);
      return next(error);
    }
    if (req.userId !== post.creator.toString()) {
      const error = new HttpError('UnAuthorized', 401);
      return next(error);
    }
    post.title = title;
    post.content = content;
    if (req.file) {
      const imageURL = req.file.path.replace('\\', '/');
      if (imageURL !== post.imageURL) {
        clearImage(post.imageURL);
        post.imageURL = imageURL;
      }
    }

    const postResult = await post.save();
    return res.status(200).json({
      message: 'Post Updated',
      post: postResult,
    });
  } catch (err) {
    return next(err);
  }
};

export const deletePost: RequestHandler = async (req, res, next) => {
  const pId = req.params.pId;
  try {
    const post = await Post.findById(pId);
    if (!post) {
      const error = new HttpError('Post not found', 404);
      return next(error);
    }
    if (req.userId !== post.creator.toString()) {
      const error = new HttpError('UnAuthorized', 401);
      return next(error);
    }
    await post.delete();
    const user = await User.findById(req.userId);
    if (!user) {
      return next(new HttpError('User not found', 404));
    }
    user.posts.pull(post);
    await user.save();
    clearImage(post.imageURL);
    return res.status(200).json({
      message: 'Post Deleted',
    });
  } catch (err) {
    return next(err);
  }
};

export const getStatus: RequestHandler = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return next(new HttpError('User not found', 404));
    }
    res.status(200).json({
      message: 'Status fetched',
      status: user.status,
    });
  } catch (err) {
    return next(err);
  }
};

export const updateStatus: RequestHandler = async (req, res, next) => {
  const { status } = req.body as { status: string };
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return next(new HttpError('User not found', 404));
    }
    user.status = status;
    await user.save();
    res.status(200).json({
      message: 'Status updated',
    });
  } catch (err) {
    return next(err);
  }
};

const clearImage = (filePath: string) => {
  filePath = path.join(__dirname, '..', '..', filePath);

  fs.unlink(filePath, (err) => console.log(err));
};
