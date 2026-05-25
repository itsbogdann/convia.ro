import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TeamRole } from '@convia/shared-types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { TeamMemberGuard } from '../../common/guards/team-member.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { BillingService } from './billing.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@ApiTags('Billing')
@Controller()
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  // ─── Team-scoped endpoints (authenticated) ──────────────────────────────

  @Get('teams/:teamId/billing/subscription')
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, TeamMemberGuard, RolesGuard)
  @Roles(TeamRole.OWNER, TeamRole.ADMIN)
  getSubscription(@Param('teamId', ParseUUIDPipe) teamId: string) {
    return this.billing.getSubscription(teamId);
  }

  @Get('teams/:teamId/billing/usage')
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, TeamMemberGuard)
  getCurrentUsage(@Param('teamId', ParseUUIDPipe) teamId: string) {
    return this.billing.getCurrentUsage(teamId);
  }

  /** Create a Stripe Checkout session for upgrading. Owner-only. */
  @Post('teams/:teamId/billing/checkout')
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, TeamMemberGuard, RolesGuard)
  @Roles(TeamRole.OWNER)
  createCheckout(
    @Param('teamId', ParseUUIDPipe) teamId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.billing.createCheckout(teamId, userId, dto.plan, dto.cycle);
  }

  /** Open the Stripe Customer Portal for managing billing. Owner-only. */
  @Post('teams/:teamId/billing/portal')
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard, TeamMemberGuard, RolesGuard)
  @Roles(TeamRole.OWNER)
  createPortal(@Param('teamId', ParseUUIDPipe) teamId: string) {
    return this.billing.createPortalSession(teamId);
  }

  // ─── Stripe webhook (public, signature-verified) ────────────────────────

  @Public()
  @Post('billing/webhooks/stripe')
  @HttpCode(HttpStatus.OK)
  async stripeWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string,
  ) {
    // We rely on `rawBody: true` on the NestFactory.create() call in main.ts
    // so req.rawBody is the verbatim payload Stripe signed.
    const rawBody: Buffer = req.rawBody;
    await this.billing.handleWebhook(rawBody, signature);
    return { received: true };
  }
}
