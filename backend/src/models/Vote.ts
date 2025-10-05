import mongoose, { Schema, Document } from 'mongoose';

export interface IItemVote {
  itemId: string;
  tier: string;
}

export interface IVote extends Document {
  tierListId: string;
  channelId: string;
  userId: string;
  username: string;
  votes: IItemVote[];
  createdAt: Date;
  updatedAt: Date;
}

const ItemVoteSchema = new Schema({
  itemId: { type: String, required: true },
  tier: { type: String, required: true },
});

const VoteSchema = new Schema<IVote>(
  {
    tierListId: { type: String, required: true, index: true },
    channelId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    username: { type: String, required: true },
    votes: [ItemVoteSchema],
  },
  { timestamps: true }
);

// Compound index to ensure one vote per user per tier list
VoteSchema.index({ tierListId: 1, userId: 1 }, { unique: true });

// Index for aggregation queries
VoteSchema.index({ tierListId: 1, channelId: 1 });

export default mongoose.model<IVote>('Vote', VoteSchema);
