import mongoose, { Schema, Document } from 'mongoose';

export interface ITierListItem {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface ITierListConfig extends Document {
  channelId: string;
  channelName: string;
  title: string;
  description?: string;
  category?: string;
  tags: string[];
  items: ITierListItem[];
  tiers: string[];
  status: 'draft' | 'active' | 'completed';
  startTime?: Date;
  endTime?: Date;
  allowRealTimeUpdates: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TierListItemSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  imageUrl: { type: String },
});

const TierListConfigSchema = new Schema<ITierListConfig>(
  {
    channelId: { type: String, required: true, index: true },
    channelName: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, maxlength: 500 },
    category: { type: String },
    tags: [{ type: String }],
    items: [TierListItemSchema],
    tiers: { type: [String], default: ['S', 'A', 'B', 'C', 'D', 'F'] },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed'],
      default: 'draft',
    },
    startTime: { type: Date },
    endTime: { type: Date },
    allowRealTimeUpdates: { type: Boolean, default: true },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for querying active tier lists
TierListConfigSchema.index({ channelId: 1, status: 1 });

export default mongoose.model<ITierListConfig>('TierListConfig', TierListConfigSchema);
