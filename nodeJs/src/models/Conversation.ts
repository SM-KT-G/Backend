import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface IConversation extends Document {
  userId: string;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const MessageSchema = new Schema<IMessage>({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const ConversationSchema = new Schema<IConversation>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'New Conversation'
  },
  messages: {
    type: [MessageSchema],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
ConversationSchema.index({ userId: 1, createdAt: -1 });

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
