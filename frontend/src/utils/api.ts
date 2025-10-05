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
    // For public/OBS access - fetch tier lists for a specific channel
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

  // Vote endpoints
  async submitVote(tierListId: string, votes: any[]) {
    const response = await this.client.post('/votes', { tierListId, votes });
    return response.data;
  }

  async getUserVote(tierListId: string) {
    const response = await this.client.get(`/votes/${tierListId}`);
    return response.data;
  }
}

export const apiClient = new ApiClient();
