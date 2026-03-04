/**
 * High-Level OTel Initialization (Issue #266)
 *
 * One-call setup that wires OTel providers, the EventBus bridge, and
 * the TelemetryCollector transport in a single invocation. Consumers
 * who don't use OTel pay nothing — if no provider is registered all
 * instrumentation is a no-op.
 *
 * @module runtime/otel-init
 */

import type { OTelConfig } from './otel.js';
import type { EventBus } from './event-bus.js';
import type { UnsubscribeFn } from './event-bus.js';
import { initializeOTel, shutdownOTel } from './otel.js';
import { bridgeEventBusToOTel, createOTelTransport } from './otel-bridge.js';
import { setTelemetryTransport } from './telemetry.js';

// ============================================================================
// Types
// ============================================================================

/** Options for the high-level {@link initSquadTelemetry} helper. */
export interface SquadTelemetryOptions extends OTelConfig {
  /**
   * When provided, all EventBus events are automatically forwarded
   * as OTel spans via {@link bridgeEventBusToOTel}.
   */
  eventBus?: EventBus;

  /**
   * When `true`, the OTel-backed TelemetryTransport is registered
   * as the active transport for {@link TelemetryCollector}.
   * @default true
   */
  installTransport?: boolean;
}

/** Handle returned by {@link initSquadTelemetry} for lifecycle control. */
export interface SquadTelemetryHandle {
  /** Whether tracing was activated. */
  tracing: boolean;
  /** Whether metrics were activated. */
  metrics: boolean;
  /**
   * Flush pending telemetry, detach the EventBus bridge (if any),
   * and shut down OTel providers. Safe to call multiple times.
   */
  shutdown: () => Promise<void>;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * One-call OTel setup for Squad SDK consumers.
 *
 * This is the **high-level** entry point. It:
 * 1. Initializes tracing and metrics via `initializeOTel()`.
 * 2. Optionally bridges an {@link EventBus} so every Squad event
 *    becomes an OTel span.
 * 3. Optionally installs an OTel-backed `TelemetryTransport` so
 *    the existing `TelemetryCollector` pipeline emits spans too.
 *
 * If no `OTEL_EXPORTER_OTLP_ENDPOINT` env var is set **and** no
 * `endpoint` is provided in `options`, everything remains a no-op.
 *
 * @param options - Configuration and optional EventBus.
 * @returns A handle with `tracing`, `metrics` status booleans and a
 *          `shutdown()` method for graceful cleanup.
 *
 * @example
 * ```ts
 * import { initSquadTelemetry, EventBus } from 'squad-sdk';
 *
 * const bus = new EventBus();
 * const telemetry = initSquadTelemetry({
 *   endpoint: 'http://localhost:4318',
 *   eventBus: bus,
 * });
 *
 * // … run your squad …
 *
 * await telemetry.shutdown();
 * ```
 */
export function initSquadTelemetry(options: SquadTelemetryOptions = {}): SquadTelemetryHandle {
  const { eventBus, installTransport = true, ...otelConfig } = options;

  const result = initializeOTel(otelConfig);

  let unsubscribeBridge: UnsubscribeFn | undefined;
  if (eventBus) {
    unsubscribeBridge = bridgeEventBusToOTel(eventBus);
  }

  if (installTransport) {
    setTelemetryTransport(createOTelTransport());
  }

  return {
    tracing: result.tracing,
    metrics: result.metrics,
    shutdown: async () => {
      unsubscribeBridge?.();
      await shutdownOTel();
    },
  };
}

/**
 * Convenience wrapper for Copilot agent-mode telemetry.
 *
 * Pre-configures `serviceName` to `'squad-copilot-agent'` and
 * `mode` to `'copilot-agent'` so the two surfaces (CLI vs agent)
 * are distinguishable in dashboards and trace queries.
 *
 * Call this at agent-mode startup; call `handle.shutdown()` on exit.
 *
 * @param options - Additional overrides (endpoint, eventBus, etc.).
 */
export function initAgentModeTelemetry(options: Omit<SquadTelemetryOptions, 'serviceName' | 'mode'> = {}): SquadTelemetryHandle {
  return initSquadTelemetry({
    ...options,
    serviceName: 'squad-copilot-agent',
    mode: 'copilot-agent',
  });
}
