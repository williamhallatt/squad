/**
 * Squad SDK — Public API barrel export.
 * This module has ZERO side effects. Safe to import as a library.
 * CLI entry point lives in src/cli-entry.ts.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('../package.json');
export const VERSION: string = pkg.version;

// Export public API
export { resolveSquad, resolveSquadPaths, resolveGlobalSquadPath, ensureSquadPath, ensureSquadPathDual, ensureSquadPathResolved, loadDirConfig, isConsultMode } from './resolution.js';
export type { ResolvedSquadPaths, SquadDirConfig } from './resolution.js';
export { MODELS, TIMEOUTS, AGENT_ROLES } from './runtime/constants.js';
export * from './config/index.js';
export * from './agents/onboarding.js';
export * from './casting/index.js';
export * from './skills/index.js';
export { selectResponseTier, getTier } from './coordinator/response-tiers.js';
export type { ResponseTier, TierName, TierContext, ModelTierSuggestion } from './coordinator/response-tiers.js';
export { loadConfig, loadConfigSync } from './runtime/config.js';
export type { ConfigLoadResult, ConfigValidationError } from './runtime/config.js';
export * from './runtime/streaming.js';
export * from './runtime/cost-tracker.js';
export * from './runtime/telemetry.js';
export * from './runtime/offline.js';
export * from './runtime/i18n.js';
export * from './runtime/benchmarks.js';
export * from './runtime/otel.js';
export { createOTelTransport, bridgeEventBusToOTel } from './runtime/otel-bridge.js';
export * from './runtime/otel-metrics.js';
export { initSquadTelemetry, initAgentModeTelemetry } from './runtime/otel-init.js';
export type { SquadTelemetryOptions, SquadTelemetryHandle } from './runtime/otel-init.js';
export { EventBus as RuntimeEventBus } from './runtime/event-bus.js';
export type { SquadEvent as RuntimeSquadEvent, SquadEventType as RuntimeSquadEventType } from './runtime/event-bus.js';
export { SquadObserver, classifyFile } from './runtime/squad-observer.js';
export type { SquadFileChange, SquadFileCategory, SquadObserverConfig } from './runtime/squad-observer.js';

export { safeTimestamp } from './utils/safe-timestamp.js';
export * from './marketplace/index.js';
export * from './build/index.js';
export * from './sharing/index.js';
export * from './upstream/index.js';

// Multi-squad resolution, config, and migration (#652)
export {
  getSquadRoot,
  resolveSquadPath,
  listSquads,
  createSquad,
  deleteSquad,
  switchSquad,
  migrateIfNeeded,
} from './multi-squad.js';
export type { SquadEntry, MultiSquadConfig, SquadInfo } from './multi-squad.js';
