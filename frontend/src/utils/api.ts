import axios, { AxiosInstance } from 'axios';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  setToken(token: string) {
    this.token = token;
  }

  // Auth endpoints
  async verifyAuth() {
    const response = await this.client.get('/auth/verify');
    return response.data;
  }

  // Tier list endpoints
  async getTierLists() {
    const response = await this.client.get('/tierlists');
    return response.data;
  }

  async getTierListsByChannel(channelId: string) {
    // For public access - fetch tier lists for a specific channel
    const response = await this.client.get(`/tierlists?channelId=${channelId}`);
    return response.data;
  }

  async getTierList(id: string) {
    const response = await this.client.get(`/tierlists/${id}`);
    return response.data;
  }

  async createTierList(data: any) {
    const response = await this.client.post('/tierlists', data);
    return response.data;
  }

  async updateTierList(id: string, data: any) {
    const response = await this.client.put(`/tierlists/${id}`, data);
    return response.data;
  }

  async deleteTierList(id: string) {
    const response = await this.client.delete(`/tierlists/${id}`);
    return response.data;
  }

  async activateTierList(id: string) {
    const response = await this.client.post(`/tierlists/${id}/activate`);
    return response.data;
  }

  async completeTierList(id: string) {
    const response = await this.client.post(`/tierlists/${id}/complete`);
    return response.data;
  }

  async getTierListResults(id: string) {
    const response = await this.client.get(`/tierlists/${id}/results`);
    return response.data;
  }

  async resetTierListVotes(id: string) {
    const response = await this.client.post(`/tierlists/${id}/reset`);
    return response.data;
  }

  async addItemToTierList(tierListId: string, name: string, imageUrl?: string) {
    const response = await this.client.post(`/tierlists/${tierListId}/items`, { name, imageUrl });
    return response.data;
  }

  async updateTierListItem(tierListId: string, itemId: string, name: string, imageUrl?: string) {
    const response = await this.client.put(`/tierlists/${tierListId}/items/${itemId}`, { name, imageUrl });
    return response.data;
  }

  async removeItemFromTierList(tierListId: string, itemId: string) {
    const response = await this.client.delete(`/tierlists/${tierListId}/items/${itemId}`);
    return response.data;
  }

  // Vote endpoints
  async submitVote(tierListId: string, votes: any[]) {
    const response = await this.client.post('/votes', { tierListId, votes });
    return response.data;
  }

  async getUserVote(tierListId: string) {
    const response = await this.client.get(`/votes/${tierListId}`);
    return response.data;
  }

  // Suggestion endpoints
  async createSuggestion(tierListId: string, itemName: string, imageUrl?: string) {
    const response = await this.client.post('/suggestions', { tierListId, itemName, imageUrl });
    return response.data;
  }

  async getSuggestions(tierListId: string, status?: 'pending' | 'approved' | 'rejected') {
    const params = status ? `?status=${status}` : '';
    const response = await this.client.get(`/suggestions/tierlist/${tierListId}${params}`);
    return response.data;
  }

  async approveSuggestion(id: string) {
    const response = await this.client.post(`/suggestions/${id}/approve`);
    return response.data;
  }

  async rejectSuggestion(id: string) {
    const response = await this.client.post(`/suggestions/${id}/reject`);
    return response.data;
  }

  async deleteSuggestion(id: string) {
    const response = await this.client.delete(`/suggestions/${id}`);
    return response.data;
  }

  // Analytics endpoints
  async getAnalytics(tierListId: string) {
    const response = await this.client.get(`/analytics/tierlist/${tierListId}`);
    return response.data;
  }

  async getChannelAnalytics() {
    const response = await this.client.get('/analytics/channel');
    return response.data;
  }

  async getChannelSummary() {
    const response = await this.client.get('/analytics/channel/summary');
    return response.data;
  }

  async generateAnalytics(tierListId: string) {
    const response = await this.client.post(`/analytics/generate/${tierListId}`);
    return response.data;
  }

  // Template endpoints
  async getTemplates(params?: {
    category?: string;
    tags?: string;
    search?: string;
    sort?: 'popularity' | 'usage' | 'recent';
    limit?: number;
    skip?: number;
  }) {
    // Filter out undefined values before creating query string
    const filteredParams: any = {};
    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          filteredParams[key] = value;
        }
      });
    }
    
    const queryString = new URLSearchParams(filteredParams).toString();
    const response = await this.client.get(`/templates${queryString ? '?' + queryString : ''}`);
    return response.data;
  }

  async getTemplate(id: string) {
    const response = await this.client.get(`/templates/${id}`);
    return response.data;
  }

  async publishTierList(tierListId: string, data: {
    description?: string;
    category?: string;
    tags?: string[];
  }) {
    const response = await this.client.post(`/templates/publish/${tierListId}`, data);
    return response.data;
  }

  async unpublishTierList(tierListId: string) {
    const response = await this.client.post(`/templates/unpublish/${tierListId}`);
    return response.data;
  }

  async cloneTemplate(id: string) {
    const response = await this.client.post(`/templates/${id}/clone`);
    return response.data;
  }

  async voteTemplate(id: string, vote: 'up' | 'down') {
    const response = await this.client.post(`/templates/${id}/vote`, { vote });
    return response.data;
  }

  async getMyVote(id: string) {
    const response = await this.client.get(`/templates/${id}/myvote`);
    return response.data;
  }

  async getTemplateCategories() {
    const response = await this.client.get('/templates/meta/categories');
    return response.data;
  }

  async getTemplateTags() {
    const response = await this.client.get('/templates/meta/tags');
    return response.data;
  }
}

export const apiClient = new ApiClient();
