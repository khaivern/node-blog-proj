"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpError extends Error {
    constructor(message, errorCode, data) {
        super(message); // Add a message property
        this.errorCode = errorCode;
        this.data = data;
    }
}
exports.default = HttpError;
