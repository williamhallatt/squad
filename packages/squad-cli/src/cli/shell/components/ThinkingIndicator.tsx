/**
 * ThinkingIndicator — clean feedback during agent operations.
 *
 * Shows spinner + "Thinking..." (static) + elapsed time.
 * Activity hints from SDK events override the default label.
 *
 * Owned by Cheritto (TUI Engineer). Design approved by Marquez.
 */

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { isNoColor } from '../terminal.js';

export interface ThinkingIndicatorProps {
  isThinking: boolean;
  elapsedMs: number;
  activityHint?: string;
}

/** Thinking label — exported for backward compat with tests. */
export const THINKING_PHRASES = ['Thinking'];

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

/** Color cycles through as time passes — feels alive. */
function indicatorColor(elapsedSec: number): string {
  if (elapsedSec < 5) return 'cyan';
  if (elapsedSec < 15) return 'yellow';
  return 'magenta';
}

function formatElapsed(ms: number): string {
  const sec = Math.floor(ms / 1000);
  if (sec < 1) return '';
  return `${sec}s`;
}

/** Static dots for NO_COLOR mode (no animation). */
const STATIC_SPINNER = '...';

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({
  isThinking,
  elapsedMs,
  activityHint,
}) => {
  const noColor = isNoColor();
  const [frame, setFrame] = useState(0);

  // Spinner animation — 80ms per frame (disabled in NO_COLOR)
  useEffect(() => {
    if (!isThinking || noColor) return;
    const timer = setInterval(() => {
      setFrame(f => (f + 1) % SPINNER_FRAMES.length);
    }, 80);
    return () => clearInterval(timer);
  }, [isThinking, noColor]);

  // Reset frame when thinking starts
  useEffect(() => {
    if (isThinking) setFrame(0);
  }, [isThinking]);

  if (!isThinking) return null;

  const elapsedSec = Math.floor(elapsedMs / 1000);
  const elapsedStr = formatElapsed(elapsedMs);
  const spinnerChar = noColor ? STATIC_SPINNER : (SPINNER_FRAMES[frame] ?? '⠋');

  // NO_COLOR: no color props, use text labels
  if (noColor) {
    return (
      <Box gap={1}>
        <Text>{spinnerChar}</Text>
        <Text>{activityHint ?? 'Thinking...'}</Text>
        {elapsedStr ? <Text>({elapsedStr})</Text> : null}
      </Box>
    );
  }

  const color = indicatorColor(elapsedSec);

  // Activity hint takes priority when available
  if (activityHint) {
    return (
      <Box gap={1}>
        <Text color={color}>{spinnerChar}</Text>
        <Text color={color} italic>{activityHint}</Text>
        {elapsedStr ? <Text dimColor>({elapsedStr})</Text> : null}
      </Box>
    );
  }

  // Default: static "Thinking..." label
  return (
    <Box gap={1}>
      <Text color={color}>{spinnerChar}</Text>
      <Text color={color} dimColor italic>Thinking...</Text>
      {elapsedStr ? <Text dimColor>({elapsedStr})</Text> : null}
    </Box>
  );
};
