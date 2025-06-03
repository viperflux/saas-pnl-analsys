import { FinancialData } from '@/types';

export interface ConfigurationData {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  config: FinancialData;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl = '/api';

  async fetchConfigurations(sessionId?: string): Promise<{
    configurations: ConfigurationData[];
    sessionId: string;
    currentConfig: ConfigurationData;
  }> {
    const url = sessionId 
      ? `${this.baseUrl}/configurations?sessionId=${sessionId}`
      : `${this.baseUrl}/configurations`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch configurations');
    }
    
    return response.json();
  }

  async createConfiguration(data: {
    name: string;
    description?: string;
    config: FinancialData;
    isDefault?: boolean;
  }): Promise<ConfigurationData> {
    const response = await fetch(`${this.baseUrl}/configurations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create configuration');
    }
    
    return response.json();
  }

  async getConfiguration(id: string): Promise<ConfigurationData> {
    const response = await fetch(`${this.baseUrl}/configurations/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch configuration');
    }
    
    return response.json();
  }

  async updateConfiguration(id: string, data: {
    name?: string;
    description?: string;
    config?: FinancialData;
    isDefault?: boolean;
  }): Promise<ConfigurationData> {
    const response = await fetch(`${this.baseUrl}/configurations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update configuration');
    }
    
    return response.json();
  }

  async deleteConfiguration(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/configurations/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete configuration');
    }
  }

  async saveConfiguration(config: FinancialData, name?: string, id?: string): Promise<ConfigurationData> {
    if (id) {
      return this.updateConfiguration(id, { config, name });
    } else {
      return this.createConfiguration({
        name: name || `Configuration ${new Date().toLocaleDateString()}`,
        config,
      });
    }
  }
}

export const apiClient = new ApiClient();

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('pnl-session-id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('pnl-session-id', sessionId);
  }
  return sessionId;
}