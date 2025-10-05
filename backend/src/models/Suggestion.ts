import mongoose, { Schema, Document } from 'mongoose';

export interface ISuggestion extends Document {
  tierListId: string;
  channelId: string;
  userId: string;
  username: string;
  itemName: string;
  imageUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const SuggestionSchema = new Schema<ISuggestion>(
  {
    tierListId: { type: String, required: true, index: true },
    channelId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    username: { type: String, required: true },
    itemName: { type: String, required: true },
    imageUrl: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate suggestions from same user
SuggestionSchema.index({ tierListId: 1, userId: 1, itemName: 1 }, { unique: true });

export default mongoose.model<ISuggestion>('Suggestion', SuggestionSchema);
