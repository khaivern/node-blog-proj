import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export interface Post {
  title: string;
  content: string;
  imageURL: string;
  creator: mongoose.Types.ObjectId;
  createdAt: number;
}

const postSchema = new Schema<Post>(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    imageURL: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<Post>('Post', postSchema);
