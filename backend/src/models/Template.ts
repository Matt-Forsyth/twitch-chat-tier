import mongoose, { Document, Schema } from 'mongoose';

export interface ITemplate extends Document {
  tierListId: string;
  channelId: string;
  channelName: string;
  title: string;
  description?: string;
  items: Array<{
    id: string;
    name: string;
    imageUrl?: string;
  }>;
  tiers: string[];
  category?: string;
  tags: string[];
  isPublic: boolean;
  usageCount: number;
  votes: Array<{
    userId: string;
    username: string;
    vote: 'up' | 'down'; // thumbs up or down
    createdAt: Date;
  }>;
  upvotes: number;
  downvotes: number;
  voteScore: number; // upvotes - downvotes for sorting
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema({
  tierListId: {
    type: String,
    required: true,
    index: true,
  },
  channelId: {
    type: String,
    required: true,
    index: true,
  },
  channelName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  items: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    imageUrl: String,
  }],
  tiers: [{
    type: String,
    required: true,
  }],
  category: {
    type: String,
    index: true,
  },
  tags: [{
    type: String,
    index: true,
  }],
  isPublic: {
    type: Boolean,
    default: false,
    index: true,
  },
  usageCount: {
    type: Number,
    default: 0,
    index: true,
  },
  votes: [{
    userId: { type: String, required: true },
    username: { type: String, required: true },
    vote: { 
      type: String, 
      required: true,
      enum: ['up', 'down'],
    },
    createdAt: { type: Date, default: Date.now },
  }],
  upvotes: {
    type: Number,
    default: 0,
    index: true,
  },
  downvotes: {
    type: Number,
    default: 0,
  },
  voteScore: {
    type: Number,
    default: 0,
    index: true,
  },
}, {
  timestamps: true,
});

// Index for searching and sorting
TemplateSchema.index({ isPublic: 1, voteScore: -1, usageCount: -1 });
TemplateSchema.index({ isPublic: 1, createdAt: -1 });
TemplateSchema.index({ category: 1, isPublic: 1 });
TemplateSchema.index({ tags: 1, isPublic: 1 });

// Method to calculate vote scores
TemplateSchema.methods.updateVoteScore = function() {
  const upvotes = this.votes.filter((v: any) => v.vote === 'up').length;
  const downvotes = this.votes.filter((v: any) => v.vote === 'down').length;
  this.upvotes = upvotes;
  this.downvotes = downvotes;
  this.voteScore = upvotes - downvotes;
};

export default mongoose.model<ITemplate>('Template', TemplateSchema);
