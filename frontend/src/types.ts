export interface TierListItem {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface TierListConfig {
  _id: string;
  channelId: string;
  channelName: string;
  title: string;
  description?: string;
  category?: string;
  tags: string[];
  items: TierListItem[];
  tiers: string[];
  status: 'draft' | 'active' | 'completed';
  startTime?: string;
  endTime?: string;
  allowRealTimeUpdates: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ItemVote {
  itemId: string;
  tier: string;
}

export interface Vote {
  _id: string;
  tierListId: string;
  channelId: string;
  userId: string;
  username: string;
  votes: ItemVote[];
  createdAt: string;
  updatedAt: string;
}

export interface TierListResult {
  item: TierListItem;
  tierCounts: Record<string, number>;
  totalVotes: number;
  averageTier: string;
}

export interface TierListResults {
  tierList: TierListConfig;
  results: TierListResult[];
  totalVoters: number;
}

export interface TwitchAuth {
  token: string;
  userId: string;
  channelId: string;
  role: 'broadcaster' | 'moderator' | 'viewer';
}

export interface Suggestion {
  _id: string;
  tierListId: string;
  channelId: string;
  userId: string;
  username: string;
  itemName: string;
  imageUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  _id: string;
  tierListId: string;
  channelId: string;
  title: string;
  totalVotes: number;
  totalVoters: number;
  itemCount: number;
  completedAt: string;
  averageTierDistribution: Record<string, number>;
  topItems: Array<{ itemName: string; averageTier: string; voteCount: number }>;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalTierLists: number;
  totalVotes: number;
  totalVoters: number;
  averageVotesPerList: number;
  averageVotersPerList: number;
  mostPopularTier: string;
  tierDistribution: Record<string, number>;
}

export interface Template {
  _id: string;
  tierListId: string;
  channelId: string;
  channelName: string;
  title: string;
  description?: string;
  items: TierListItem[];
  tiers: string[];
  category?: string;
  tags: string[];
  isPublic: boolean;
  usageCount: number;
  averageRating: number;
  totalRatings: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateSearchParams {
  category?: string;
  tags?: string;
  search?: string;
  sort?: 'rating' | 'usage' | 'recent';
  limit?: number;
  skip?: number;
}

export interface TemplatesResponse {
  templates: Template[];
  total: number;
  hasMore: boolean;
}
