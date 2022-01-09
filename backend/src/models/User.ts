import mongoose, { ObjectId, Types } from 'mongoose';

interface User {
  name: string;
  email: string;
  password: string;
  status: string;
  posts: Types.DocumentArray<mongoose.Types.ObjectId>;
}

const Schema = mongoose.Schema;

const userSchema = new Schema<User>({
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

export default mongoose.model<User>('User', userSchema);
