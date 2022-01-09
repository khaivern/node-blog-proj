"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const HttpError_1 = __importDefault(require("../models/HttpError"));
const isAuth = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const error = new HttpError_1.default('Not Authorized', 401);
        return next(error);
    }
    const token = authHeader.split(' ')[1];
    const decodedToken = jsonwebtoken_1.default.verify(token, 'secretprivatekey');
    if (!decodedToken) {
        const error = new HttpError_1.default('Failed to decode token', 500);
        return next(error);
    }
    if (typeof decodedToken === 'string') {
        const error = new HttpError_1.default('Token does not have correct structure', 500);
        return next(error);
    }
    else {
        req.userId = decodedToken.userId;
    }
    next();
};
exports.default = isAuth;
