import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TeamRole } from '@convia/shared-types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { TeamMemberGuard } from '../../common/guards/team-member.guard';
import { TeamAdminGuard } from '../../common/guards/team-admin.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { TeamsService } from './teams.service';

@ApiTags('Teams')
@ApiBearerAuth()
@Controller('teams')
@UseGuards(SupabaseAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  /** Create a new workspace. The caller becomes the owner. */
  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateTeamDto) {
    return this.teamsService.create(userId, dto);
  }

  // ─── Single team ────────────────────────────────────────────────────────

  @Get(':teamId')
  @UseGuards(TeamMemberGuard)
  getOne(@Param('teamId', ParseUUIDPipe) teamId: string) {
    return this.teamsService.findOne(teamId);
  }

  @Patch(':teamId')
  @UseGuards(TeamAdminGuard)
  update(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Body() dto: UpdateTeamDto,
  ) {
    return this.teamsService.update(teamId, dto);
  }

  /** Owner-only. Permanently deletes the workspace + everything inside it. */
  @Delete(':teamId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(TeamMemberGuard, RolesGuard)
  @Roles(TeamRole.OWNER)
  async remove(@Param('teamId', ParseUUIDPipe) teamId: string) {
    await this.teamsService.remove(teamId);
  }

  // ─── Members ────────────────────────────────────────────────────────────

  @Get(':teamId/members')
  @UseGuards(TeamMemberGuard)
  listMembers(@Param('teamId', ParseUUIDPipe) teamId: string) {
    return this.teamsService.listMembers(teamId);
  }

  @Post(':teamId/members')
  @UseGuards(TeamAdminGuard)
  addMember(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @CurrentUser('id') invitedBy: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.teamsService.addMember(teamId, invitedBy, dto);
  }

  @Patch(':teamId/members/:memberId')
  @UseGuards(TeamAdminGuard)
  updateMember(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.teamsService.updateMember(teamId, memberId, dto);
  }

  /** Self-removal also routes here; admins can also remove other members. */
  @Delete(':teamId/members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(TeamMemberGuard)
  async removeMember(
    @Req() req: any,
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
  ) {
    const isSelf = req.teamMembership?.id === memberId;
    const isAdminOrOwner =
      req.teamMembership?.role === TeamRole.OWNER ||
      req.teamMembership?.role === TeamRole.ADMIN;
    if (!isSelf && !isAdminOrOwner) {
      throw new ForbiddenException('Only admins/owners can remove other members');
    }
    await this.teamsService.removeMember(teamId, memberId);
  }
}
