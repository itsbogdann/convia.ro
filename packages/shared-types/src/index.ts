/**
 * Convia — Shared Types
 *
 * Single import surface for shared TypeScript types across the monorepo.
 *
 * Usage:
 *   import { Agent, TeamRole, PlanId, PLANS } from "@convia/shared-types";
 */

export * from "./enums";
export * from "./team.types";
export * from "./agent.types";
export * from "./conversation.types";
export * from "./knowledge-base.types";
export * from "./billing.types";
export * from "./api.types";

// Widget — explicit named re-exports so Vite/Rollup can statically resolve
// them when the widget consumes this package's CommonJS dist build.
export {
  WIDGET_TRANSLATION_DEFAULTS,
  interpolateTranslation,
} from "./widget-translations";
export type { WidgetTranslations } from "./widget-translations";

// ─── Utility types ─────────────────────────────────────────────────────────

/** Make all fields nullable */
export type Nullable<T> = T | null;

/** Strip id and timestamp fields from an entity to get the create-DTO shape */
export type CreateDto<T> = Omit<T, "id" | "createdAt" | "updatedAt">;

/** All fields optional except id — for partial update DTOs */
export type UpdateDto<T> = Partial<Omit<T, "id" | "createdAt" | "updatedAt">>;

/** Deep partial */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** Make specific keys required */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Make specific keys optional */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
