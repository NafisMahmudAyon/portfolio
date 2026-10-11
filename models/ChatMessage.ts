import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IChatMessage extends Document {
  question: string;
  answer: string;
  suggestions?: number[];
  model?: string;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    suggestions: [{ type: Number }],
    model: { type: String, default: 'gemini-3.8-flash' },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const ChatMessage = models.ChatMessage || model<IChatMessage>('ChatMessage', ChatMessageSchema);

export default ChatMessage;
