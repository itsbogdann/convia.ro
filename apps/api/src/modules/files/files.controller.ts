import { Body, Controller, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TeamRole } from '@convia/shared-types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { TeamMemberGuard } from '../../common/guards/team-member.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { FilesService } from './files.service';
import { SignUploadDto } from './dto/sign-upload.dto';

@ApiTags('Files')
@ApiBearerAuth()
@Controller('teams/:teamId/files')
@UseGuards(SupabaseAuthGuard, TeamMemberGuard)
export class FilesController {
  constructor(private readonly files: FilesService) {}

  /**
   * Get a pre-signed URL the browser can PUT directly to. After the upload
   * succeeds the client passes the returned path back to the KB or agents
   * endpoint to register the file.
   */
  @Post('sign-upload')
  @UseGuards(RolesGuard)
  @Roles(TeamRole.OWNER, TeamRole.ADMIN, TeamRole.DEVELOPER)
  signUpload(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SignUploadDto,
  ) {
    return this.files.createSignedUpload(teamId, userId, dto);
  }
}
