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
exports.signup = exports.login = void 0;
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const HttpError_1 = __importDefault(require("../models/HttpError"));
const User_1 = __importDefault(require("../models/User"));
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const error = new HttpError_1.default('Validation Failed', 422, errors.array());
        return next(error);
    }
    const { email, password } = req.body;
    try {
        const user = yield User_1.default.findOne({ email: email });
        if (!user) {
            const error = new HttpError_1.default('User not found', 422);
            return next(error);
        }
        const doMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!doMatch) {
            const error = new HttpError_1.default('Password does not match', 422);
            return next(error);
        }
        const token = jsonwebtoken_1.default.sign({
            email: user.email,
            userId: user.id,
        }, 'secretprivatekey', { expiresIn: '1h' });
        res.status(200).json({
            message: 'Logged In',
            userId: user.id,
            token,
        });
    }
    catch (err) {
        return next(err);
    }
});
exports.login = login;
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const error = new HttpError_1.default('Validation Failed', 401, errors.array());
        return next(error);
    }
    const { email, name, password } = req.body;
    try {
        const existingUser = yield User_1.default.findOne({ email: email });
        if (existingUser) {
            const error = new HttpError_1.default('Email exists in database', 422);
            return next(error);
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 12);
        const user = new User_1.default({
            name,
            email,
            password: hashedPassword,
        });
        yield user.save();
        return res.status(201).json({
            message: 'Sign Up Success',
        });
    }
    catch (err) {
        return next(err);
    }
});
exports.signup = signup;
