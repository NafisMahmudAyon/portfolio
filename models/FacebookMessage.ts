import mongoose, { Schema, model, models } from 'mongoose';

export interface IFacebookMessage {
  _id?: string;
  psid: string; // Facebook Page-Scoped User ID
  senderName?: string | null;
  messageType: 'text' | 'image' | 'audio' | 'unknown';
  userMessage: string;
  mediaUrl?: string | null;
  aiReply: string;
  model: string;
  status: 'sent' | 'failed' | 'skipped';
  error?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const FacebookMessageSchema = new Schema(
  {
    psid: {
      type: String,
      required: true,
      index: true,
    },
    senderName: {
      type: String,
      default: null,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'audio', 'unknown'],
      default: 'text',
    },
    userMessage: {
      type: String,
      required: true,
    },
    mediaUrl: {
      type: String,
      default: null,
    },
    aiReply: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      default: 'gemini-2.5-flash',
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'skipped'],
      default: 'sent',
    },
    error: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const FacebookMessage =
  models.FacebookMessage || model<IFacebookMessage>('FacebookMessage', FacebookMessageSchema);

export default FacebookMessage;
