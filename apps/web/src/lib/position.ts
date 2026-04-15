import { POSITION_GAP } from "@trello-clone/shared";

/**
 * Frontend mirror of the backend Decimal Positioning System.
 * Used to calculate new positions during drag-and-drop operations
 * without waiting for a server response (optimistic UI).
 */

/**
 * Calculate a new position between two existing positions.
 * @param prevPosition Position of the item above (null if inserting at top)
 * @param nextPosition Position of the item below (null if inserting at bottom)
 */
export function calculatePosition(
  prevPosition: number | null,
  nextPosition: number | null
): number {
  if (prevPosition === null && nextPosition === null) {
    return POSITION_GAP;
  }
  if (prevPosition === null && nextPosition !== null) {
    return nextPosition / 2;
  }
  if (prevPosition !== null && nextPosition === null) {
    return prevPosition + POSITION_GAP;
  }
  return (prevPosition! + nextPosition!) / 2;
}

/**
 * Given a sorted array of positions (excluding the moved item),
 * calculate the position for an item dropped at a target index.
 */
export function getPositionAtIndex(
  positions: number[],
  targetIndex: number
): number {
  if (positions.length === 0) {
    return POSITION_GAP;
  }
  if (targetIndex === 0) {
    return calculatePosition(null, positions[0]);
  }
  if (targetIndex >= positions.length) {
    return calculatePosition(positions[positions.length - 1], null);
  }
  return calculatePosition(positions[targetIndex - 1], positions[targetIndex]);
}
