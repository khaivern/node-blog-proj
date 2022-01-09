"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatus = exports.getStatus = exports.deletePost = exports.updatePost = exports.getPost = exports.createPost = exports.getPosts = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const express_validator_1 = require("express-validator");
const HttpError_1 = __importDefault(require("../models/HttpError"));
const Post_1 = __importDefault(require("../models/Post"));
const User_1 = __importDefault(require("../models/User"));
const getPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const page = req.query.page || 1;
    const currentPage = +page;
    const perPage = 2;
    let totalItems = 0;
    try {
        yield Post_1.default.find()
            .countDocuments()
            .then((count) => (totalItems = count));
        const posts = yield Post_1.default.find()
            .skip((currentPage - 1) * perPage)
            .limit(perPage)
            .populate({ path: 'creator', select: 'name' });
        if (!posts || posts.length === 0) {
            const error = new HttpError_1.default('No posts found', 404);
            return next(error);
        }
        return res.status(200).json({
            message: 'Posts fetched',
            posts,
            totalItems,
        });
    }
    catch (err) {
        return next(err);
    }
});
exports.getPosts = getPosts;
const createPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const error = new HttpError_1.default('Validation Failed', 422, errors.array());
        return next(error);
    }
    if (!req.file) {
        const error = new HttpError_1.default('Image File not set', 422);
        return next(error);
    }
    const imageURL = req.file.path.replace('\\', '/');
    const { title, content } = req.body;
    const post = new Post_1.default({
        title,
        content,
        creator: req.userId,
        imageURL,
    });
    try {
        const postResult = yield post.save();
        const user = yield User_1.default.findById(req.userId);
        if (!user) {
            const error = new HttpError_1.default('User not found', 404);
            throw error;
        }
        user.posts.push(post);
        yield user.save();
        return res.status(201).json({
            message: 'Post Created',
            post: postResult,
            creator: { _id: user.id, name: user.name },
        });
    }
    catch (err) {
        return next(err);
    }
});
exports.createPost = createPost;
const getPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pId = req.params.pId;
    try {
        const post = yield Post_1.default.findById(pId);
        if (!post) {
            const error = new HttpError_1.default('Could not find post', 422);
            return next(error);
        }
        return res.status(200).json({
            message: 'Single post fetched',
            post,
        });
    }
    catch (err) {
        return next(err);
    }
});
exports.getPost = getPost;
const updatePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const error = new HttpError_1.default('Validation failed', 422, errors.array());
        return next(error);
    }
    const pId = req.params.pId;
    const { title, content } = req.body;
    try {
        const post = yield Post_1.default.findById(pId);
        if (!post) {
            const error = new HttpError_1.default('Post not found', 404);
            return next(error);
        }
        if (req.userId !== post.creator.toString()) {
            const error = new HttpError_1.default('UnAuthorized', 401);
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
        const postResult = yield post.save();
        return res.status(200).json({
            message: 'Post Updated',
            post: postResult,
        });
    }
    catch (err) {
        return next(err);
    }
});
exports.updatePost = updatePost;
const deletePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const pId = req.params.pId;
    try {
        const post = yield Post_1.default.findById(pId);
        if (!post) {
            const error = new HttpError_1.default('Post not found', 404);
            return next(error);
        }
        if (req.userId !== post.creator.toString()) {
            const error = new HttpError_1.default('UnAuthorized', 401);
            return next(error);
        }
        yield post.delete();
        const user = yield User_1.default.findById(req.userId);
        if (!user) {
            return next(new HttpError_1.default('User not found', 404));
        }
        user.posts.pull(post);
        yield user.save();
        clearImage(post.imageURL);
        return res.status(200).json({
            message: 'Post Deleted',
        });
    }
    catch (err) {
        return next(err);
    }
});
exports.deletePost = deletePost;
const getStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.userId);
        if (!user) {
            return next(new HttpError_1.default('User not found', 404));
        }
        res.status(200).json({
            message: 'Status fetched',
            status: user.status,
        });
    }
    catch (err) {
        return next(err);
    }
});
exports.getStatus = getStatus;
const updateStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { status } = req.body;
    try {
        const user = yield User_1.default.findById(req.userId);
        if (!user) {
            return next(new HttpError_1.default('User not found', 404));
        }
        user.status = status;
        yield user.save();
        res.status(200).json({
            message: 'Status updated',
        });
    }
    catch (err) {
        return next(err);
    }
});
exports.updateStatus = updateStatus;
const clearImage = (filePath) => {
    filePath = path_1.default.join(__dirname, '..', '..', filePath);
    fs_1.default.unlink(filePath, (err) => console.log(err));
};
