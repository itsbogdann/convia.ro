import type { AgentConfig, WidgetResponse, UserFields, ConversationListItem, KBSearchResult, UpdateEntry, FaqEntry } from './types';

const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9002/api';

class WidgetAPI {
  private apiUrl: string;
  private apiKey: string;
  private previewAgentId: string | null = null;

  constructor(apiUrl?: string, apiKey?: string) {
    this.apiUrl = apiUrl || DEFAULT_API_URL;
    this.apiKey = apiKey || '';
  }

  setApiUrl(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  setPreviewAgentId(agentId: string | null) {
    this.previewAgentId = agentId;
  }

  isPreviewMode(): boolean {
    return this.previewAgentId !== null;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.apiKey ? { 'X-API-Key': this.apiKey } : {}),
      ...options.headers,
    };

    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      const err = new Error(error.message || `HTTP ${response.status}`);
      (err as any).status = response.status;
      throw err;
    }

    // API wraps responses in { success: true, data: <response> }
    const result = await response.json();
    return result.data ?? result;
  }

  async getConfig(preview = false): Promise<AgentConfig> {
    return this.fetch<AgentConfig>(`/widget/config?preview=${preview}`);
  }

  async getPreviewConfig(agentId: string): Promise<AgentConfig> {
    return this.fetch<AgentConfig>(`/widget/preview/${agentId}`);
  }

  async startConversation(
    sessionId?: string,
    params?: {
      userFields?: UserFields | null;
      customFields?: Record<string, string | number | boolean>;
      visitorId?: string;
    }
  ): Promise<WidgetResponse> {
    // Use preview endpoint if in preview mode
    const endpoint = this.previewAgentId
      ? `/widget/preview/${this.previewAgentId}/conversations`
      : '/widget/conversations';

    return this.fetch<WidgetResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        visitorId: params?.visitorId || undefined,
        userFields: params?.userFields || undefined,
        customFields: params?.customFields || undefined,
        metadata: {
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          landingPage: window.location.href,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      }),
    });
  }

  async sendMessage(
    conversationId: string,
    content: string,
    displayContent?: string,
  ): Promise<WidgetResponse> {
    // Use preview endpoint if in preview mode
    const endpoint = this.previewAgentId
      ? `/widget/preview/${this.previewAgentId}/conversations/${conversationId}/messages`
      : `/widget/conversations/${conversationId}/messages`;

    return this.fetch<WidgetResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        content,
        // displayContent is shown in chat history, content is used for workflow matching
        displayContent: displayContent || content,
      }),
    });
  }

  async sendMessageStreaming(
    conversationId: string,
    content: string,
    displayContent?: string,
    onToken?: (data: { token: string; done: boolean; messageId?: string; error?: string; messages?: Array<{ id: string; content: string; sender: string; contentType?: string; uiComponent?: any; citations?: any }>; cart?: { cartId: string; checkoutUrl: string; totalQuantity?: number; currency?: string; totalAmount?: number } | null }) => void,
  ): Promise<void> {
    const endpoint = this.previewAgentId
      ? `/widget/preview/${this.previewAgentId}/conversations/${conversationId}/stream`
      : `/widget/conversations/${conversationId}/stream`;

    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey ? { 'X-API-Key': this.apiKey } : {}),
      },
      body: JSON.stringify({ content, displayContent: displayContent || content }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Stream failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            onToken?.(data);
          } catch {
            // Skip malformed JSON
          }
        }
      }
    }
  }

  async getConversation(conversationId: string): Promise<WidgetResponse> {
    // Use preview endpoint if in preview mode
    const endpoint = this.previewAgentId
      ? `/widget/preview/${this.previewAgentId}/conversations/${conversationId}`
      : `/widget/conversations/${conversationId}`;

    return this.fetch<WidgetResponse>(endpoint);
  }

  async endConversation(conversationId: string): Promise<void> {
    // Preview mode skips API key — use preview endpoint
    if (this.previewAgentId) return;
    await this.fetch(`/widget/conversations/${conversationId}/end`, {
      method: 'POST',
    });
  }

  async heartbeat(conversationId: string): Promise<void> {
    // Preview mode skips API key — use preview endpoint
    if (this.previewAgentId) return;
    await this.fetch(`/widget/conversations/${conversationId}/heartbeat`, {
      method: 'POST',
    });
  }
  async validatePlaygroundToken(agentId: string, token: string): Promise<{ valid: boolean }> {
    return this.fetch<{ valid: boolean }>('/widget/validate-playground-token', {
      method: 'POST',
      body: JSON.stringify({ agentId, token }),
    });
  }

  // ============================================
  // FEEDBACK SUBMISSION
  // ============================================

  async submitFeedback(data: {
    rating: number;
    comment?: string;
    visitorId?: string;
    sessionId?: string;
    conversationId?: string;
  }): Promise<{ id: string }> {
    const endpoint = this.previewAgentId
      ? `/widget/preview/${this.previewAgentId}/feedback`
      : '/widget/feedback';

    return this.fetch<{ id: string }>(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        visitorMetadata: {
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      }),
    });
  }

  // ============================================
  // FORM SUBMISSION
  // ============================================

  async submitForm(
    conversationId: string,
    formData: Record<string, string>,
    nodeId: string,
  ): Promise<WidgetResponse> {
    const endpoint = this.previewAgentId
      ? `/widget/preview/${this.previewAgentId}/conversations/${conversationId}/form-submit`
      : `/widget/conversations/${conversationId}/form-submit`;

    return this.fetch<WidgetResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ formData, nodeId }),
    });
  }

  // ============================================
  // PORTAL MODE ENDPOINTS
  // ============================================

  async listConversations(visitorId: string, limit = 20): Promise<{ conversations: ConversationListItem[] }> {
    const endpoint = this.previewAgentId
      ? `/widget/preview/${this.previewAgentId}/conversations/history?visitorId=${encodeURIComponent(visitorId)}&limit=${limit}`
      : `/widget/conversations/history?visitorId=${encodeURIComponent(visitorId)}&limit=${limit}`;
    return this.fetch(endpoint);
  }

  async searchKnowledge(query: string, limit = 5): Promise<KBSearchResult[]> {
    const endpoint = this.previewAgentId
      ? `/widget/preview/${this.previewAgentId}/knowledge/search`
      : '/widget/knowledge/search';
    return this.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({ query, limit }),
    });
  }

  async getUpdates(limit = 20): Promise<UpdateEntry[]> {
    const endpoint = this.previewAgentId
      ? `/widget/preview/${this.previewAgentId}/updates?limit=${limit}`
      : `/widget/updates?limit=${limit}`;
    return this.fetch(endpoint);
  }

  async getFaqs(limit = 50): Promise<FaqEntry[]> {
    const endpoint = this.previewAgentId
      ? `/widget/preview/${this.previewAgentId}/faqs?limit=${limit}`
      : `/widget/faqs?limit=${limit}`;
    return this.fetch(endpoint);
  }

  // ============================================
  // FILE UPLOAD
  // ============================================

  async uploadFile(
    conversationId: string,
    file: File,
  ): Promise<{ fileId: string; fileName: string; fileUrl: string; fileSize: number }> {
    const endpoint = this.previewAgentId
      ? `/widget/preview/${this.previewAgentId}/conversations/${conversationId}/upload`
      : `/widget/conversations/${conversationId}/upload`;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        // Only include API key header — do NOT set Content-Type; browser sets multipart boundary automatically
        ...(this.apiKey ? { 'X-API-Key': this.apiKey } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    return result.data ?? result;
  }
}

export const api = new WidgetAPI();
export default api;
