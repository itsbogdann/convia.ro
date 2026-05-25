import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentStatus } from '@convia/shared-types';
import { Agent } from '../../../entities/agent.entity';

/**
 * Widget Auth Guard
 *
 * Authenticates requests from the embedded widget via the bot's per-agent
 * `api_key` (prefixed `cv_...`). Also enforces:
 *   - bot is ACTIVE (drafts and paused bots reject anonymous requests)
 *   - request Origin is in `allowed_domains` (or list is empty in dev)
 *
 * The resolved Agent is attached to `req.agent` for downstream handlers.
 */
@Injectable()
export class WidgetAuthGuard implements CanActivate {
  private readonly logger = new Logger(WidgetAuthGuard.name);

  constructor(
    @InjectRepository(Agent) private readonly agents: Repository<Agent>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const apiKey = this.extractApiKey(req);
    if (!apiKey) {
      throw new UnauthorizedException('Missing widget API key');
    }

    const agent = await this.agents.findOne({ where: { apiKey } });
    if (!agent) {
      throw new UnauthorizedException('Invalid widget API key');
    }

    if (agent.status !== AgentStatus.ACTIVE) {
      throw new ForbiddenException('Bot is not currently active');
    }

    const origin = this.normalizeOrigin(req.headers.origin || req.headers.referer);
    if (
      agent.allowedDomains.length > 0 &&
      origin &&
      !this.isOriginAllowed(origin, agent.allowedDomains)
    ) {
      this.logger.warn(`Widget request blocked from ${origin} for agent ${agent.id}`);
      throw new ForbiddenException(
        `Origin ${origin} is not in this bot's allowed domains`,
      );
    }

    req.agent = agent;
    return true;
  }

  private extractApiKey(req: any): string | null {
    const headerKey = req.headers['x-api-key'] || req.headers['x-convia-key'];
    if (typeof headerKey === 'string' && headerKey.length > 0) {
      return headerKey;
    }
    const query = req.query?.apiKey;
    if (typeof query === 'string' && query.length > 0) return query;
    return null;
  }

  private normalizeOrigin(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    try {
      const url = new URL(value);
      return url.hostname.toLowerCase();
    } catch {
      return null;
    }
  }

  private isOriginAllowed(originHost: string, allowed: string[]): boolean {
    for (const entry of allowed) {
      const e = entry.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      if (originHost === e) return true;
      if (e.startsWith('*.') && originHost.endsWith(e.slice(1))) return true;
    }
    return false;
  }
}
