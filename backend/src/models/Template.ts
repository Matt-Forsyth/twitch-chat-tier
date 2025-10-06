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
  ratings: Array<{
    userId: string;
    username: string;
    rating: number; // 1-5
    createdAt: Date;
  }>;
  averageRating: number;
  totalRatings: number;
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
  ratings: [{
    userId: { type: String, required: true },
    username: { type: String, required: true },
    rating: { 
      type: Number, 
      required: true,
      min: 1,
      max: 5,
    },
    createdAt: { type: Date, default: Date.now },
  }],
  averageRating: {
    type: Number,
    default: 0,
    index: true,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for searching and sorting
TemplateSchema.index({ isPublic: 1, averageRating: -1, usageCount: -1 });
TemplateSchema.index({ isPublic: 1, createdAt: -1 });
TemplateSchema.index({ category: 1, isPublic: 1 });
TemplateSchema.index({ tags: 1, isPublic: 1 });

// Method to calculate average rating
TemplateSchema.methods.updateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
  } else {
    const sum = this.ratings.reduce((acc: number, r: any) => acc + r.rating, 0);
    this.averageRating = sum / this.ratings.length;
    this.totalRatings = this.ratings.length;
  }
};

export default mongoose.model<ITemplate>('Template', TemplateSchema);
