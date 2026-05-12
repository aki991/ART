export const PIGEON_COLOR_PALETTE = [
  "#00D2FF",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
  "#FBBF24",
  "#EF4444",
  "#14B8A6",
  "#84CC16",
] as const;

export function getColorByIndex(index: number): string {
  return PIGEON_COLOR_PALETTE[index % PIGEON_COLOR_PALETTE.length];
}
