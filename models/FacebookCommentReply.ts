import mongoose, { Schema, model, models } from 'mongoose';

export interface IFacebookCommentReply {
  _id?: string;
  commentId: string;
  postId: string;
  blogPostId?: mongoose.Types.ObjectId | null;
  blogPostSlug?: string | null;
  blogPostTitle?: string | null;
  senderId?: string;
  senderName?: string;
  userComment: string;
  postContext?: string;
  aiPublicReply?: string;
  replyCommentId?: string;
  aiPrivateReply?: string;
  privateReplyMessageId?: string;
  privateReplyStatus: 'not_sent' | 'success' | 'failed' | 'skipped';
  privateReplyError?: string | null;
  status: 'success' | 'failed' | 'skipped';
  error?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const FacebookCommentReplySchema = new Schema(
  {
    commentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    postId: {
      type: String,
      required: true,
      index: true,
    },
    blogPostId: {
      type: Schema.Types.ObjectId,
      ref: 'BlogPost',
      index: true,
      default: null,
    },
    blogPostSlug: {
      type: String,
      default: null,
    },
    blogPostTitle: {
      type: String,
      default: null,
    },
    senderId: {
      type: String,
      default: null,
    },
    senderName: {
      type: String,
      default: null,
    },
    userComment: {
      type: String,
      required: true,
    },
    postContext: {
      type: String,
      default: null,
    },
    aiPublicReply: {
      type: String,
      default: null,
    },
    replyCommentId: {
      type: String,
      default: null,
    },
    aiPrivateReply: {
      type: String,
      default: null,
    },
    privateReplyMessageId: {
      type: String,
      default: null,
    },
    privateReplyStatus: {
      type: String,
      enum: ['not_sent', 'success', 'failed', 'skipped'],
      default: 'not_sent',
    },
    privateReplyError: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'skipped'],
      default: 'success',
    },
    error: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const FacebookCommentReply =
  models.FacebookCommentReply ||
  model('FacebookCommentReply', FacebookCommentReplySchema);

export default FacebookCommentReply;
