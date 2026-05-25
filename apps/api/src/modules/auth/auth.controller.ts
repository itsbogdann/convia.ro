import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { AuthService, MeResponse } from './auth.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** Profile + team memberships for the signed-in user. */
  @Get('me')
  me(@CurrentUser() user: CurrentUserData): Promise<MeResponse> {
    return this.auth.getMe(user);
  }

  /** Update profile fields (name, avatar, locale, preferences). */
  @Patch('me')
  updateMe(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.auth.updateProfile(userId, dto);
  }

  /**
   * Idempotent profile sync from the JWT.
   * The signup trigger handles this normally; this is a fallback for clients
   * that want to ensure the profile exists before making other calls.
   */
  @Post('me/sync')
  sync(@CurrentUser() user: CurrentUserData) {
    return this.auth.syncProfile(user);
  }
}
