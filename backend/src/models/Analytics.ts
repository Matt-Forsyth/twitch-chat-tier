import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  tierListId: string;
  channelId: string;
  title: string;
  totalVotes: number;
  totalVoters: number;
  itemCount: number;
  completedAt: Date;
  averageTierDistribution: Record<string, number>;
  topItems: Array<{ itemName: string; averageTier: string; voteCount: number }>;
  createdAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    tierListId: { type: String, required: true, unique: true },
    channelId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    totalVotes: { type: Number, required: true },
    totalVoters: { type: Number, required: true },
    itemCount: { type: Number, required: true },
    completedAt: { type: Date, required: true },
    averageTierDistribution: { type: Map, of: Number },
    topItems: [
      {
        itemName: String,
        averageTier: String,
        voteCount: Number,
      },
    ],
  },
  { timestamps: true }
);

// Index for querying analytics by channel
AnalyticsSchema.index({ channelId: 1, completedAt: -1 });

export default mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
