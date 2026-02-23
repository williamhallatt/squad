# Decision: P2 UX Polish — Text over Emoji, Simplicity over Fidget

**Author:** Cheritto (TUI Engineer)
**Date:** 2026-02-26
**Issue:** #340
**PR:** #364

## Context

Marquez's UX audit flagged 6 P2 items — all "polish" tier. The theme across all 6: reduce visual noise, prefer text+ANSI over emoji, and simplify where rotation/variety adds no value.

## Decisions Made

1. **Removed "you:" from user messages.** The `❯` chevron already signals "your input." Adding "you:" was redundant and cluttered the message stream. Every character in a TUI earns its place.

2. **Unified all separators to `-` (ASCII hyphen).** Was using `─` (U+2500) in MessageStream and `┄` (U+2504) in AgentPanel. Inconsistency between two components that render inches apart on screen. ASCII `-` is the most portable choice and renders identically across all terminal emulators.

3. **Killed the thinking phrase carousel.** 10 rotating phrases every 2.5s was a nice idea but in practice just added motion that competed with the actual content. Static "Thinking..." is clear, honest, and doesn't draw the eye away from streaming content. Activity hints still override when available — those are genuinely informative.

4. **Text status labels in `/agents`.** Emoji circles (`🔵🟢🔴⚪`) are ambiguous and render inconsistently across terminals. `[WORK]`, `[STREAM]`, `[ERR]`, `[IDLE]` are instantly readable and grep-friendly.

5. **Single-space indent for status lines.** Minor but compounds: 2-space indent pushed content right, especially on narrow terminals. 1-space keeps things tight.

6. **Replaced all ornamental emoji with text.** `📋` → `▸`, `📍` → `Focus:`, `🔌` → removed. Emoji in TUI output is a crapshoot — different widths, different renderers, different moods. Text + ANSI color is reliable.

## Principle

> In a TUI, every glyph earns its pixel. Prefer text that works everywhere over emoji that works sometimes.

## Risk

Low. All changes are visual-only. No behavioral or architectural changes. Tests updated to match.
