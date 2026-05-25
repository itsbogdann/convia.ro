import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelStatus, ChannelType } from '@convia/shared-types';
import { Channel } from '../../entities/channel.entity';
import { Agent } from '../../entities/agent.entity';
import { CredentialVaultService } from '../../common/services/credential-vault.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

interface WhatsAppChannelInput {
  phoneNumberId?: unknown;
  businessAccountId?: unknown;
  /** Plain access token; we encrypt before persisting. */
  accessToken?: unknown;
  displayName?: unknown;
}

@Injectable()
export class ChannelsService {
  private readonly logger = new Logger(ChannelsService.name);

  constructor(
    @InjectRepository(Channel) private readonly channels: Repository<Channel>,
    @InjectRepository(Agent) private readonly agents: Repository<Agent>,
    private readonly vault: CredentialVaultService,
  ) {}

  async list(teamId: string, agentId: string): Promise<Channel[]> {
    await this.assertAgentInTeam(teamId, agentId);
    const list = await this.channels.find({
      where: { teamId, agentId },
      order: { createdAt: 'ASC' },
    });
    return list.map(this.stripSecrets);
  }

  async create(
    teamId: string,
    agentId: string,
    dto: CreateChannelDto,
  ): Promise<Channel> {
    await this.assertAgentInTeam(teamId, agentId);

    // Enforce one-per-type at the app level (DB has UNIQUE constraint as backup).
    const existing = await this.channels.findOne({
      where: { agentId, type: dto.type },
    });
    if (existing) {
      throw new ConflictException(
        `Acest bot are deja un canal de tip ${dto.type}. Actualizează-l în loc să creezi unul nou.`,
      );
    }

    const config = this.validateAndPrepareConfig(dto.type, dto.config ?? {}, teamId);

    // For web channels we set CONNECTED immediately (just config, no API handshake).
    // WhatsApp needs the Meta verification flow → starts as CONNECTING.
    const initialStatus =
      dto.type === ChannelType.WEB ? ChannelStatus.CONNECTED : ChannelStatus.CONNECTING;

    const channel = this.channels.create({
      agentId,
      teamId,
      type: dto.type,
      status: initialStatus,
      config,
    });
    const saved = await this.channels.save(channel);
    this.logger.log(
      `Channel ${saved.id} (${saved.type}) created for agent ${agentId}`,
    );
    return this.stripSecrets(saved);
  }

  async update(
    teamId: string,
    agentId: string,
    channelId: string,
    dto: UpdateChannelDto,
  ): Promise<Channel> {
    const channel = await this.channels.findOne({
      where: { id: channelId, teamId, agentId },
    });
    if (!channel) throw new NotFoundException('Channel not found');

    if (dto.status !== undefined) channel.status = dto.status;
    if (dto.config !== undefined) {
      const merged = { ...(channel.config || {}), ...dto.config };
      channel.config = this.validateAndPrepareConfig(channel.type, merged, teamId);
    }

    const saved = await this.channels.save(channel);
    return this.stripSecrets(saved);
  }

  async remove(teamId: string, agentId: string, channelId: string): Promise<void> {
    const result = await this.channels.delete({ id: channelId, teamId, agentId });
    if (result.affected === 0) throw new NotFoundException('Channel not found');
  }

  // ───────────────────────────────────────────────────────────────────────

  private async assertAgentInTeam(teamId: string, agentId: string): Promise<void> {
    const agent = await this.agents.findOne({ where: { id: agentId, teamId } });
    if (!agent) throw new NotFoundException('Bot not found');
  }

  /**
   * Per-type validation + secret encryption. Anything sensitive (WhatsApp tokens)
   * is encrypted before it touches the database.
   */
  private validateAndPrepareConfig(
    type: ChannelType,
    config: Record<string, unknown>,
    teamId: string,
  ): Record<string, unknown> {
    if (type === ChannelType.WEB) {
      const allowedDomains = Array.isArray(config.allowedDomains)
        ? (config.allowedDomains as string[]).filter((d) => typeof d === 'string')
        : [];
      return { allowedDomains };
    }

    if (type === ChannelType.WHATSAPP) {
      const wa = config as WhatsAppChannelInput;
      const phoneNumberId = String(wa.phoneNumberId || '').trim();
      const businessAccountId = String(wa.businessAccountId || '').trim();

      if (!phoneNumberId || !businessAccountId) {
        throw new BadRequestException(
          'WhatsApp channel requires phoneNumberId and businessAccountId',
        );
      }

      const prepared: Record<string, unknown> = {
        phoneNumberId,
        businessAccountId,
        displayName: wa.displayName ? String(wa.displayName) : undefined,
      };

      if (wa.accessToken) {
        prepared.encryptedToken = this.vault.encrypt(String(wa.accessToken), teamId);
      }

      return prepared;
    }

    throw new BadRequestException(`Unsupported channel type: ${type}`);
  }

  /** Never return raw encrypted secrets to clients. */
  private stripSecrets = (channel: Channel): Channel => {
    if (channel.type === ChannelType.WHATSAPP && channel.config?.encryptedToken) {
      const { encryptedToken: _omit, ...rest } = channel.config as Record<
        string,
        unknown
      >;
      return { ...channel, config: { ...rest, hasToken: true } };
    }
    return channel;
  };
}
