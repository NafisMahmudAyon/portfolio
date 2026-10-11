import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface ISocialPost extends Document {
  blogPostId?: mongoose.Types.ObjectId;
  platform: 'facebook' | 'twitter' | 'linkedin';
  status: 'success' | 'failed' | 'pending';
  caption: string;
  externalPostId?: string;
  externalUrl?: string;
  comments?: string[];
  errorMessage?: string;
  postedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SocialPostSchema = new Schema<ISocialPost>(
  {
    blogPostId: { type: Schema.Types.ObjectId, ref: 'BlogPost' },
    platform: { type: String, default: 'facebook', enum: ['facebook', 'twitter', 'linkedin'] },
    status: { type: String, default: 'pending', enum: ['success', 'failed', 'pending'] },
    caption: { type: String, required: true },
    externalPostId: { type: String, default: '' },
    externalUrl: { type: String, default: '' },
    comments: [{ type: String }],
    errorMessage: { type: String, default: '' },
    postedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const SocialPost = models.SocialPost || model<ISocialPost>('SocialPost', SocialPostSchema);

export default SocialPost;
