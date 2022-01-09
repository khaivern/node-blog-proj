"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const uuid_1 = require("uuid");
const multer_1 = __importDefault(require("multer"));
const feed_1 = __importDefault(require("./routes/feed"));
const auth_1 = __importDefault(require("./routes/auth"));
const app = (0, express_1.default)();
const fileStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, (0, uuid_1.v4)() + '-' + file.originalname);
    },
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png') {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};
app.use((0, multer_1.default)({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use(body_parser_1.default.json());
app.use('/images', express_1.default.static(path_1.default.join(__dirname, '..', '/images')));
app.use((_, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.use('/feed', feed_1.default);
app.use('/auth', auth_1.default);
// Error-Middleware
const errorHandler = (err, _2, res, _4) => {
    const status = err.errorCode || 500;
    const message = err.message || 'Something went wrong!';
    const data = err.data || [];
    res.status(status).json({
        message,
        data,
    });
};
app.use(errorHandler);
mongoose_1.default
    .connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.sh85l.mongodb.net/${process.env.MONGO_DEFAULT_DB}`)
    .then((result) => app.listen(process.env.PORT || 8000))
    .catch((err) => console.log(err));
