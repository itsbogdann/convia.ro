import { IsEnum } from 'class-validator';
import { BillingCycle, PlanId } from '@convia/shared-types';

export class CreateCheckoutDto {
  @IsEnum(PlanId)
  plan!: PlanId;

  @IsEnum(BillingCycle)
  cycle!: BillingCycle;
}
