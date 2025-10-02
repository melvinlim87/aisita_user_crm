// Centralized theme color tokens
// Usage: import the tokens in components instead of hardcoding hex values.

export const BACKGROUND_START = '#000000';
export const BACKGROUND_END = '#111111';

export const PRIMARY_GOLD = '#FFD700';           // Primary text / titles
export const SECONDARY_GOLD = '#DAA520';         // Secondary text / details

export const CTA_GRADIENT_START = '#FFD700';     // Highlights / CTA Buttons (start)
export const CTA_GRADIENT_END = '#B87333';       // Highlights / CTA Buttons (end)

export const CHART_UP = '#00FF66';               // Charts / Data (up)
export const CHART_DOWN = '#FF3333';             // Charts / Data (down)

export const BORDER_STEEL = '#C0C0C0';           // Borders / accents (light steel)

// Optional map if you prefer an object interface
export const themeColors = {
  background: { start: BACKGROUND_START, end: BACKGROUND_END },
  text: { primary: PRIMARY_GOLD, secondary: SECONDARY_GOLD },
  cta: { start: CTA_GRADIENT_START, end: CTA_GRADIENT_END },
  chart: { up: CHART_UP, down: CHART_DOWN },
  border: BORDER_STEEL,
};
