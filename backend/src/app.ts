import path from 'path';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import express, { ErrorRequestHandler } from 'express';
import { v4 as uuid } from 'uuid';
import multer, { FileFilterCallback } from 'multer';
import helmet from 'helmet';
import compression from 'compression';

import feedRoutes from './routes/feed';
import authRoutes from './routes/auth';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, uuid() + '-' + file.originalname);
  },
});

const fileFilter = (
  req: express.Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use(bodyParser.json());

app.use('/images', express.static(path.join(__dirname, '..', '/images')));

app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(helmet());
app.use(compression());
app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);
// Error-Middleware
const errorHandler: ErrorRequestHandler = (err, _2, res, _4) => {
  const status = err.errorCode || 500;
  const message = err.message || 'Something went wrong!';
  const data = err.data || [];
  res.status(status).json({
    message,
    data,
  });
};
app.use(errorHandler);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.sh85l.mongodb.net/${process.env.MONGO_DEFAULT_DB}`
  )
  .then((result) => app.listen(process.env.PORT || 8000))
  .catch((err) => console.log(err));
