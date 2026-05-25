import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TeamRole } from '@convia/shared-types';
import { Roles } from '../../common/decorators/roles.decorator';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { TeamMemberGuard } from '../../common/guards/team-member.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { KnowledgeBaseService } from './knowledge-base.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateKnowledgeBaseDto } from './dto/update-kb.dto';

@ApiTags('Knowledge Base')
@ApiBearerAuth()
@Controller('teams/:teamId/agents/:agentId/knowledge-base')
@UseGuards(SupabaseAuthGuard, TeamMemberGuard)
export class KnowledgeBaseController {
  constructor(private readonly kbService: KnowledgeBaseService) {}

  /** Get the KB for this bot. Auto-creates one if it doesn't exist yet. */
  @Get()
  getOne(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('agentId', ParseUUIDPipe) agentId: string,
  ) {
    return this.kbService.getOrCreateForAgent(teamId, agentId);
  }

  @Patch()
  @UseGuards(RolesGuard)
  @Roles(TeamRole.OWNER, TeamRole.ADMIN, TeamRole.DEVELOPER)
  update(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Body() dto: UpdateKnowledgeBaseDto,
  ) {
    return this.kbService.updateKB(teamId, agentId, dto);
  }

  // ─── Documents ──────────────────────────────────────────────────────────

  @Get('documents')
  listDocuments(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('agentId', ParseUUIDPipe) agentId: string,
  ) {
    return this.kbService.listDocuments(teamId, agentId);
  }

  @Post('documents')
  @UseGuards(RolesGuard)
  @Roles(TeamRole.OWNER, TeamRole.ADMIN, TeamRole.DEVELOPER)
  addDocument(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.kbService.addDocument(teamId, agentId, dto);
  }

  @Get('documents/:documentId')
  getDocument(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
  ) {
    return this.kbService.findDocument(teamId, agentId, documentId);
  }

  @Post('documents/:documentId/reindex')
  @UseGuards(RolesGuard)
  @Roles(TeamRole.OWNER, TeamRole.ADMIN, TeamRole.DEVELOPER)
  reindexDocument(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
  ) {
    return this.kbService.reindexDocument(teamId, agentId, documentId);
  }

  @Delete('documents/:documentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles(TeamRole.OWNER, TeamRole.ADMIN, TeamRole.DEVELOPER)
  async deleteDocument(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
  ) {
    await this.kbService.deleteDocument(teamId, agentId, documentId);
  }

  // ─── Debug: similarity search (admin+ only) ─────────────────────────────

  @Get('search')
  @UseGuards(RolesGuard)
  @Roles(TeamRole.OWNER, TeamRole.ADMIN, TeamRole.DEVELOPER)
  async search(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Query('q') q: string,
    @Query('topK') topK?: string,
    @Query('threshold') threshold?: string,
  ) {
    const kb = await this.kbService.getOrCreateForAgent(teamId, agentId);
    return this.kbService.searchSimilar(kb.id, q, {
      topK: topK ? parseInt(topK, 10) : undefined,
      threshold: threshold ? parseFloat(threshold) : undefined,
    });
  }
}
