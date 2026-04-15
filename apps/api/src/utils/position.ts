import { POSITION_GAP, MIN_POSITION_GAP} from "@trello-clone/shared";

/**
 * Decimal Positioning System
 *
 * Calculates a new position value between two existing positions.
 * This allows efficient drag-and-drop reordering by only updating
 * the moved item's position — no mass-updates required.
 *
 * Strategy:
 *   - Initial items: 1000, 2000, 3000, ...
 *   - Insert between A and B: (A + B) / 2
 *   - Insert at top: firstItem.position / 2
 *   - Insert at bottom: lastItem.position + POSITION_GAP
 */

/**
 * Calculate a new position between two existing positions.
 * @param prevPosition Position of the item above (null if inserting at top)
 * @param nextPosition Position of the item below (null if inserting at bottom)
 * @returns The calculated new position
 */
export function calculatePosition(
  prevPosition: number | null,
  nextPosition: number | null
): number {
  // Empty list — first item
  if (prevPosition === null && nextPosition === null) {
    return POSITION_GAP;
  }

  // Insert at top
  if (prevPosition === null && nextPosition !== null) {
    return nextPosition / 2;
  }

  // Insert at bottom
  if (prevPosition !== null && nextPosition === null) {
    return prevPosition + POSITION_GAP;
  }

  // Insert between two items
  return (prevPosition! + nextPosition!) / 2;
}

/**
 * Check if any adjacent positions are too close and need rebalancing.
 * @param positions Sorted array of current positions
 * @returns true if rebalancing is needed
 */
export function needsRebalancing(positions: number[]): boolean {
  for (let i = 1; i < positions.length; i++) {
    if (Math.abs(positions[i] - positions[i - 1]) < MIN_POSITION_GAP) {
      return true;
    }
  }
  return false;
}

/**
 * Generate evenly-spaced positions for rebalancing.
 * @param count Number of items to generate positions for
 * @returns Array of new positions [1000, 2000, 3000, ...]
 */
export function generateRebalancedPositions(count: number): number[] {
  return Array.from({ length: count }, (_, i) => (i + 1) * POSITION_GAP);
}

/**
 * Given a sorted list of items with positions, determine the new position
 * for an item being moved to a specific index.
 * @param positions Sorted array of current positions (excluding the moved item)
 * @param targetIndex The index where the item should be placed (0-based)
 * @returns The calculated new position
 */
export function getPositionAtIndex(
  positions: number[],
  targetIndex: number
): number {
  if (positions.length === 0) {
    return POSITION_GAP;
  }

  // Insert at the beginning
  if (targetIndex === 0) {
    return calculatePosition(null, positions[0]);
  }

  // Insert at the end
  if (targetIndex >= positions.length) {
    return calculatePosition(positions[positions.length - 1], null);
  }

  // Insert between two items
  return calculatePosition(positions[targetIndex - 1], positions[targetIndex]);
}
