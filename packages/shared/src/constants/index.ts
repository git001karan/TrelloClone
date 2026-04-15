// ─────────────────────────────────────────────────────
// POSITION CONSTANTS
// Used by the Decimal Positioning System for lists & cards
// ─────────────────────────────────────────────────────

/** Default gap between consecutive item positions */
export const POSITION_GAP = 1000;

/** Minimum gap before a rebalance is triggered */
export const MIN_POSITION_GAP = 0.001;

/** Default position for the first item in a new list/board */
export const DEFAULT_FIRST_POSITION = POSITION_GAP;

// ─────────────────────────────────────────────────────
// BOARD DEFAULTS
// ─────────────────────────────────────────────────────

export const DEFAULT_BOARD_BACKGROUNDS = [
  "#1e40af", // Blue
  "#7c3aed", // Violet
  "#059669", // Emerald
  "#dc2626", // Red
  "#d97706", // Amber
  "#0891b2", // Cyan
  "#4f46e5", // Indigo
  "#be185d", // Pink
] as const;

export const DEFAULT_LABELS = [
  { name: "Bug", color: "#ef4444" },
  { name: "Feature", color: "#3b82f6" },
  { name: "Enhancement", color: "#8b5cf6" },
  { name: "Urgent", color: "#f59e0b" },
  { name: "Documentation", color: "#10b981" },
  { name: "Design", color: "#ec4899" },
] as const;

// ─────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
