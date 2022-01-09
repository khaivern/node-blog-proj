"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: 'New coomer',
        required: true,
    },
    posts: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Post',
                required: true,
            },
        ],
    },
});
exports.default = mongoose_1.default.model('User', userSchema);
