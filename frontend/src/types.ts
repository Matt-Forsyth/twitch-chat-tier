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
  items: TierListItem[];
  tiers: string[];
  status: 'draft' | 'active' | 'completed';
  startTime?: string;
  endTime?: string;
  allowRealTimeUpdates: boolean;
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
