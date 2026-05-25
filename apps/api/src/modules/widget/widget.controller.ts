import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { WidgetAuthGuard } from './guards/widget-auth.guard';
import { WidgetMessageDto } from './dto/widget-message.dto';
import { WidgetService } from './widget.service';

/**
 * Anonymous widget endpoints. Authenticated via the bot's per-agent
 * `api_key` (header X-API-Key). Wrapped in @Public() to bypass the global
 * Supabase JWT guard.
 */
@ApiTags('Widget')
@Public()
@Controller('widget')
@UseGuards(WidgetAuthGuard)
export class WidgetController {
  constructor(private readonly widget: WidgetService) {}

  /** Bot config (appearance, welcome message, status). */
  @Get('config')
  config(@Req() req: any) {
    return this.widget.getPublicConfig(req.agent);
  }

  /** Send a user message, get back the assistant's reply. */
  @Post('messages')
  async sendMessage(@Req() req: any, @Body() dto: WidgetMessageDto) {
    return this.widget.handleIncomingMessage(req.agent, dto);
  }

  /** Replay the message history for a session (used when the widget remounts). */
  @Get('sessions/:sessionId/messages')
  async getSessionHistory(
    @Req() req: any,
    @Param('sessionId') sessionId: string,
  ) {
    return this.widget.listMessagesForSession(req.agent, sessionId);
  }
}
