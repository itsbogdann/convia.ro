import { createClient } from "@/lib/supabase/client";
import type {
  Agent,
  Channel,
  Conversation,
  CurrentUsage,
  KnowledgeBase,
  Message,
  Profile,
  Subscription,
  Team,
  TeamMember,
  KnowledgeDocument,
} from "@convia/shared-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9002/api";

class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  body?: unknown;
  headers?: Record<string, string>;
  /** Search params appended to the URL */
  query?: Record<string, string | number | boolean | undefined>;
}

/**
 * Fetch wrapper that auto-injects the current Supabase JWT.
 *
 * Usage:
 *   const { data: agents } = await api.agents.list(teamId);
 *
 * Every Convia API response is wrapped in { success: true, data: T } by the
 * NestJS TransformInterceptor. This helper unwraps that envelope.
 */
async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const url = new URL(`${API_URL}${path}`);
  if (opts.query) {
    for (const [key, value] of Object.entries(opts.query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...opts.headers,
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url.toString(), {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: "include",
  });

  if (res.status === 204) return undefined as T;

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorPayload =
      (json as {
        error?: {
          message?: string;
          code?: string;
          details?: Record<string, unknown>;
        };
      })?.error ?? {};
    throw new ApiError(
      errorPayload.message || `Request failed (${res.status})`,
      res.status,
      errorPayload.code,
      errorPayload.details,
    );
  }

  return (json as { data: T }).data;
}

// ─── Domain-grouped helpers ───────────────────────────────────────────

interface MeResponse {
  profile: Profile;
  teams: Array<{
    team: Team;
    role: string;
    memberId: string;
    isOwner: boolean;
  }>;
}

export const api = {
  auth: {
    me: () => request<MeResponse>("/auth/me"),
    updateProfile: (input: Partial<Profile>) =>
      request<Profile>("/auth/me", { method: "PATCH", body: input }),
    sync: () => request<Profile>("/auth/me/sync", { method: "POST" }),
  },

  teams: {
    create: (input: { name: string; settings?: Team["settings"] }) =>
      request<Team>("/teams", { method: "POST", body: input }),
    get: (teamId: string) => request<Team>(`/teams/${teamId}`),
    update: (teamId: string, input: Partial<Pick<Team, "name" | "settings">>) =>
      request<Team>(`/teams/${teamId}`, { method: "PATCH", body: input }),
    remove: (teamId: string) =>
      request<void>(`/teams/${teamId}`, { method: "DELETE" }),
    members: {
      list: (teamId: string) =>
        request<TeamMember[]>(`/teams/${teamId}/members`),
      add: (teamId: string, input: { email: string; role: string; assignedAgentIds?: string[] }) =>
        request<TeamMember>(`/teams/${teamId}/members`, {
          method: "POST",
          body: input,
        }),
      update: (
        teamId: string,
        memberId: string,
        input: { role?: string; assignedAgentIds?: string[] },
      ) =>
        request<TeamMember>(`/teams/${teamId}/members/${memberId}`, {
          method: "PATCH",
          body: input,
        }),
      remove: (teamId: string, memberId: string) =>
        request<void>(`/teams/${teamId}/members/${memberId}`, {
          method: "DELETE",
        }),
    },
  },

  agents: {
    list: (teamId: string) =>
      request<Agent[]>(`/teams/${teamId}/agents`),
    create: (teamId: string, input: Partial<Agent>) =>
      request<Agent>(`/teams/${teamId}/agents`, { method: "POST", body: input }),
    get: (teamId: string, agentId: string) =>
      request<Agent>(`/teams/${teamId}/agents/${agentId}`),
    update: (teamId: string, agentId: string, input: Partial<Agent>) =>
      request<Agent>(`/teams/${teamId}/agents/${agentId}`, {
        method: "PATCH",
        body: input,
      }),
    remove: (teamId: string, agentId: string) =>
      request<void>(`/teams/${teamId}/agents/${agentId}`, { method: "DELETE" }),
    publish: (teamId: string, agentId: string) =>
      request<Agent>(`/teams/${teamId}/agents/${agentId}/publish`, {
        method: "POST",
      }),
    regenerateKey: (teamId: string, agentId: string) =>
      request<Agent>(`/teams/${teamId}/agents/${agentId}/regenerate-key`, {
        method: "POST",
      }),
  },

  channels: {
    list: (teamId: string, agentId: string) =>
      request<Channel[]>(`/teams/${teamId}/agents/${agentId}/channels`),
    create: (
      teamId: string,
      agentId: string,
      input: { type: string; config?: Record<string, unknown> },
    ) =>
      request<Channel>(`/teams/${teamId}/agents/${agentId}/channels`, {
        method: "POST",
        body: input,
      }),
    update: (
      teamId: string,
      agentId: string,
      channelId: string,
      input: { status?: string; config?: Record<string, unknown> },
    ) =>
      request<Channel>(
        `/teams/${teamId}/agents/${agentId}/channels/${channelId}`,
        { method: "PATCH", body: input },
      ),
    remove: (teamId: string, agentId: string, channelId: string) =>
      request<void>(
        `/teams/${teamId}/agents/${agentId}/channels/${channelId}`,
        { method: "DELETE" },
      ),
  },

  knowledgeBase: {
    get: (teamId: string, agentId: string) =>
      request<KnowledgeBase>(`/teams/${teamId}/agents/${agentId}/knowledge-base`),
    update: (
      teamId: string,
      agentId: string,
      input: Partial<Pick<KnowledgeBase, "name" | "description" | "chunkSize" | "chunkOverlap">>,
    ) =>
      request<KnowledgeBase>(
        `/teams/${teamId}/agents/${agentId}/knowledge-base`,
        { method: "PATCH", body: input },
      ),
    documents: {
      list: (teamId: string, agentId: string) =>
        request<KnowledgeDocument[]>(
          `/teams/${teamId}/agents/${agentId}/knowledge-base/documents`,
        ),
      create: (
        teamId: string,
        agentId: string,
        input: {
          name: string;
          sourceType: string;
          sourceUrl?: string;
          content?: string;
        },
      ) =>
        request<KnowledgeDocument>(
          `/teams/${teamId}/agents/${agentId}/knowledge-base/documents`,
          { method: "POST", body: input },
        ),
      get: (teamId: string, agentId: string, documentId: string) =>
        request<KnowledgeDocument>(
          `/teams/${teamId}/agents/${agentId}/knowledge-base/documents/${documentId}`,
        ),
      reindex: (teamId: string, agentId: string, documentId: string) =>
        request<KnowledgeDocument>(
          `/teams/${teamId}/agents/${agentId}/knowledge-base/documents/${documentId}/reindex`,
          { method: "POST" },
        ),
      remove: (teamId: string, agentId: string, documentId: string) =>
        request<void>(
          `/teams/${teamId}/agents/${agentId}/knowledge-base/documents/${documentId}`,
          { method: "DELETE" },
        ),
    },
  },

  conversations: {
    list: (
      teamId: string,
      agentId: string,
      opts: { status?: string; page?: number; pageSize?: number } = {},
    ) =>
      request<{ items: Conversation[]; total: number; page: number; pageSize: number }>(
        `/teams/${teamId}/agents/${agentId}/conversations`,
        { query: opts },
      ),
    get: (teamId: string, agentId: string, conversationId: string) =>
      request<{ conversation: Conversation; messages: Message[] }>(
        `/teams/${teamId}/agents/${agentId}/conversations/${conversationId}`,
      ),
    sendMessage: (
      teamId: string,
      agentId: string,
      conversationId: string,
      content: string,
    ) =>
      request<Message>(
        `/teams/${teamId}/agents/${agentId}/conversations/${conversationId}/messages`,
        { method: "POST", body: { content } },
      ),
    takeOver: (teamId: string, agentId: string, conversationId: string) =>
      request<Conversation>(
        `/teams/${teamId}/agents/${agentId}/conversations/${conversationId}/takeover`,
        { method: "POST" },
      ),
    release: (teamId: string, agentId: string, conversationId: string) =>
      request<Conversation>(
        `/teams/${teamId}/agents/${agentId}/conversations/${conversationId}/release`,
        { method: "POST" },
      ),
  },

  billing: {
    getSubscription: (teamId: string) =>
      request<Subscription>(`/teams/${teamId}/billing/subscription`),
    getUsage: (teamId: string) =>
      request<CurrentUsage>(`/teams/${teamId}/billing/usage`),
    createCheckout: (teamId: string, input: { plan: string; cycle: string }) =>
      request<{ url: string }>(`/teams/${teamId}/billing/checkout`, {
        method: "POST",
        body: input,
      }),
    createPortal: (teamId: string) =>
      request<{ url: string }>(`/teams/${teamId}/billing/portal`, {
        method: "POST",
      }),
  },
};

export { ApiError };
