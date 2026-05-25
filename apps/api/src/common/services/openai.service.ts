import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  ChatCompletionMessageParam,
  ChatCompletionTool,
  ChatCompletionMessageToolCall,
} from 'openai/resources/chat/completions';

export interface ChatOptions {
  messages: ChatCompletionMessageParam[];
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string; // User's key or platform key
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON Schema
}

export interface ToolExecutor {
  (name: string, args: Record<string, unknown>): Promise<unknown>;
}

export interface ToolTraceEntry {
  name: string;
  args: Record<string, unknown>;
  result: unknown;
  durationMs: number;
  error?: string;
}

export interface ToolCallResult {
  content: string;
  toolTrace: ToolTraceEntry[];
}

export interface IntentClassification {
  intent: string;
  confidence: number;
}

@Injectable()
export class OpenAIService {
  private platformClient: OpenAI;
  private readonly logger = new Logger(OpenAIService.name);
  private readonly defaultModel: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('openai.apiKey');

    if (apiKey) {
      this.platformClient = new OpenAI({ apiKey });
    } else {
      this.logger.warn('OpenAI API key not configured');
    }

    this.defaultModel =
      this.configService.get<string>('openai.defaultModel') || 'gpt-5-mini';
  }

  private getClient(apiKey?: string): OpenAI {
    if (apiKey) {
      return new OpenAI({ apiKey });
    }
    if (!this.platformClient) {
      throw new Error('OpenAI not configured and no API key provided');
    }
    return this.platformClient;
  }

  /**
   * Send both max_tokens and max_completion_tokens so the API uses
   * whichever one the model supports and ignores the other.
   */
  private getTokenParam(_model: string, maxTokens: number): Record<string, number> {
    return { max_tokens: maxTokens, max_completion_tokens: maxTokens };
  }

  /**
   * O-series reasoning models only support temperature=1.
   */
  private getSafeTemperature(model: string, temperature: number): number | undefined {
    if (model.startsWith('o1') || model.startsWith('o3') || model.startsWith('o4')) {
      return undefined;
    }
    return temperature;
  }

  async generateResponse(options: ChatOptions): Promise<string> {
    const {
      messages,
      systemPrompt,
      model = this.defaultModel,
      // temperature = 0.7,
      maxTokens = 1000,
      apiKey,
    } = options;

    const client = this.getClient(apiKey);

    const allMessages: ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
      allMessages.push({ role: 'system', content: systemPrompt });
    }

    allMessages.push(...messages);

    try {
      const response = await client.chat.completions.create({
        model,
        messages: allMessages,
        // temperature: this.getSafeTemperature(model, temperature),
        // ...this.getTokenParam(model, maxTokens),
      } as any);

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      this.logger.error(`OpenAI error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate a multi-part AI response.
   * The AI splits its response into natural message segments using a delimiter.
   * Returns an array of strings (message parts).
   */
  async generateMultiPartResponse(options: ChatOptions): Promise<string[]> {
    const {
      messages,
      systemPrompt,
      model = this.defaultModel,
      temperature = 0.7,
      maxTokens = 1000,
      apiKey,
    } = options;

    const client = this.getClient(apiKey);

    const multiPartInstruction = `\n\nIMPORTANT: Split your response into 2-3 short separate messages as if you were texting in a chat. Separate each message with "---" on its own line. Rules for splitting:
- Each message must be a complete thought.
- NEVER split a numbered list or bullet list across messages. The ENTIRE list (all items) must stay in ONE message.
- If your response contains a list, put the intro text AND the full list in the same message.
- Never use em dashes or long dashes. Use commas, periods, or hyphens instead.`;

    const allMessages: ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
      allMessages.push({
        role: 'system',
        content: systemPrompt + multiPartInstruction,
      });
    } else {
      allMessages.push({
        role: 'system',
        content: 'You are a helpful AI assistant.' + multiPartInstruction,
      });
    }

    allMessages.push(...messages);

    try {
      const response = await client.chat.completions.create({
        model,
        messages: allMessages,
        // temperature: this.getSafeTemperature(model, temperature),
        // ...this.getTokenParam(model, maxTokens),
      } as any);

      const choice = response.choices?.[0];
      const rawContent = choice?.message?.content || (choice as any)?.text || '';

      this.logger.debug(
        `OpenAI multi-part response: model=${model}, finish=${choice?.finish_reason}, length=${rawContent.length}`,
      );

      if (!rawContent) {
        this.logger.warn(
          `OpenAI returned empty content. Full response: ${JSON.stringify(response.choices?.[0]).slice(0, 500)}`,
        );
        return ['I apologize, but I was unable to generate a response. Please try again.'];
      }

      // Split by --- delimiter
      const rawParts = rawContent
        .split(/\n---\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      if (rawParts.length <= 1) return rawParts.length > 0 ? rawParts : [rawContent];

      // Merge parts that have broken lists — if a part ends with a number+period
      // or the next part starts with a number+period or continuation, merge them.
      const merged: string[] = [];
      for (const part of rawParts) {
        const prev = merged[merged.length - 1];
        const isContinuation =
          prev &&
          (/\d+\.\s*$/.test(prev) || // prev ends with "1." (orphan number)
           /^\*\*?[A-Z]/.test(part) || // next starts with bold text (list item continuation)
           /^\d+[\.\)]/.test(part)); // next starts with a number (continuing a list)

        if (isContinuation) {
          merged[merged.length - 1] = prev + '\n' + part;
        } else {
          merged.push(part);
        }
      }

      return merged.length > 0 ? merged : [rawContent];
    } catch (error) {
      this.logger.error(`OpenAI multi-part error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Stream a chat completion response token-by-token.
   * Returns an async iterable of content deltas (strings).
   */
  async *generateStreamingResponse(options: ChatOptions): AsyncGenerator<string> {
    const {
      messages,
      systemPrompt,
      model = this.defaultModel,
      temperature = 0.7,
      maxTokens = 1000,
      apiKey,
    } = options;

    const client = this.getClient(apiKey);

    const allMessages: ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
      allMessages.push({ role: 'system', content: systemPrompt });
    }

    allMessages.push(...messages);

    const stream = await client.chat.completions.create({
      model,
      messages: allMessages,
      // temperature: this.getSafeTemperature(model, temperature),
      stream: true,
      // ...this.getTokenParam(model, maxTokens),
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        yield delta;
      }
    }
  }

  async classifyIntent(
    message: string,
    intents: { name: string; description: string }[],
    apiKey?: string,
  ): Promise<IntentClassification> {
    const client = this.getClient(apiKey);

    const intentList = intents
      .map((i) => `- ${i.name}: ${i.description}`)
      .join('\n');

    const prompt = `Classify the following user message into one of these intents:

${intentList}
- other: None of the above intents match

User message: "${message}"

Respond with ONLY the intent name, nothing else.`;

    try {
      const response = await client.chat.completions.create({
        model: this.defaultModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      } as any);

      const intent =
        response.choices[0]?.message?.content?.trim().toLowerCase() || 'other';

      return { intent, confidence: 0.9 };
    } catch (error) {
      this.logger.error(`Intent classification error: ${error.message}`);
      return { intent: 'other', confidence: 0 };
    }
  }

  /**
   * Run a tool-calling loop: LLM may call zero or more tools, we execute
   * them, feed the results back, and iterate until the LLM produces a final
   * text message (or we hit the max iteration cap).
   *
   * The caller supplies a list of tools + an executor that knows how to run
   * each one (typically wired to IntegrationToolService with the teamId baked in).
   *
   * Why not leak tool execution into OpenAIService? Because tools need
   * per-team context (credentials, agent ID, conversation ID) that this
   * service has no business knowing about.
   */
  async generateResponseWithTools(
    options: ChatOptions & {
      tools: ToolDefinition[];
      executeTool: ToolExecutor;
      maxIterations?: number;
    },
  ): Promise<ToolCallResult> {
    const {
      messages,
      systemPrompt,
      model = this.defaultModel,
      maxTokens = 1000,
      apiKey,
      tools,
      executeTool,
      maxIterations = 5,
    } = options;

    const client = this.getClient(apiKey);

    const allMessages: ChatCompletionMessageParam[] = [];
    if (systemPrompt) {
      allMessages.push({ role: 'system', content: systemPrompt });
    }
    allMessages.push(...messages);

    const openaiTools: ChatCompletionTool[] = tools.map((t) => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));

    const toolTrace: ToolTraceEntry[] = [];

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      const response = await client.chat.completions.create({
        model,
        messages: allMessages,
        tools: openaiTools.length > 0 ? openaiTools : undefined,
        tool_choice: openaiTools.length > 0 ? 'auto' : undefined,
      } as any);

      const choice = response.choices[0];
      const assistantMessage = choice?.message;
      if (!assistantMessage) {
        return { content: '', toolTrace };
      }

      // Model produced a final text response, no more tool calls — done.
      if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
        return { content: assistantMessage.content || '', toolTrace };
      }

      // Model wants to call tools — echo the assistant message back into history
      // (OpenAI requires this so subsequent tool messages have something to reference).
      allMessages.push({
        role: 'assistant',
        content: assistantMessage.content,
        tool_calls: assistantMessage.tool_calls,
      } as ChatCompletionMessageParam);

      // Execute each tool call in parallel. Failures become tool-result content
      // so the LLM can recover gracefully ("I couldn't find that — want me to try X?").
      const toolResults = await Promise.all(
        assistantMessage.tool_calls.map(async (tc: ChatCompletionMessageToolCall) => {
          const name = tc.function.name;
          let args: Record<string, unknown> = {};
          try {
            args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
          } catch (err: any) {
            return {
              tool_call_id: tc.id,
              content: JSON.stringify({ error: `Invalid JSON arguments: ${err.message}` }),
              trace: { name, args: {}, result: null, durationMs: 0, error: err.message },
            };
          }

          const startTime = Date.now();
          try {
            const result = await executeTool(name, args);
            const durationMs = Date.now() - startTime;
            return {
              tool_call_id: tc.id,
              content: JSON.stringify(result ?? null),
              trace: { name, args, result, durationMs },
            };
          } catch (err: any) {
            const durationMs = Date.now() - startTime;
            this.logger.warn(`Tool ${name} threw: ${err.message}`);
            return {
              tool_call_id: tc.id,
              content: JSON.stringify({ error: err.message || 'Tool execution failed' }),
              trace: { name, args, result: null, durationMs, error: err.message },
            };
          }
        }),
      );

      for (const tr of toolResults) {
        allMessages.push({
          role: 'tool',
          tool_call_id: tr.tool_call_id,
          content: tr.content,
        } as ChatCompletionMessageParam);
        toolTrace.push(tr.trace);
      }
    }

    // Ran out of iterations — ask the LLM for a final answer based on what we have.
    this.logger.warn(`Tool-calling loop hit max iterations (${maxIterations})`);
    try {
      const finalResponse = await client.chat.completions.create({
        model,
        messages: [
          ...allMessages,
          {
            role: 'system',
            content:
              'Provide a final response to the user based on the information gathered so far. Do not call any more tools.',
          },
        ],
      } as any);
      return {
        content: finalResponse.choices[0]?.message?.content || '',
        toolTrace,
      };
    } catch (err: any) {
      this.logger.error(`Final response after max iterations failed: ${err.message}`);
      return { content: '', toolTrace };
    }
  }

  async generateEmbedding(text: string, apiKey?: string): Promise<number[]> {
    const client = this.getClient(apiKey);

    try {
      const response = await client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      this.logger.error(`Embedding error: ${error.message}`);
      throw error;
    }
  }

  async generateEmbeddings(texts: string[], apiKey?: string): Promise<number[][]> {
    const client = this.getClient(apiKey);

    try {
      const response = await client.embeddings.create({
        model: 'text-embedding-3-small',
        input: texts,
      });

      return response.data.map((d) => d.embedding);
    } catch (error) {
      this.logger.error(`Batch embedding error: ${error.message}`);
      throw error;
    }
  }
}
