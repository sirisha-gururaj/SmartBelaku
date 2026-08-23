export const WARDS = Array.from({ length: 60 }, (_, i) => i + 1);

export const LIGHT_COUNTS = Array.from({ length: 20 }, (_, i) => i + 1);

export const POLE_TYPES = ["RCC", "Octogonal", "Tubular", "Rail", "Mini Mast", "High Mast"] as const;

export const LED_MAKES = ["Smart Lumens", "Crompton", "Halonix", "Mled", "Others"] as const;

export const WATTAGES = [
  "20w", "24w", "36w", "45w", "50w", "60w", "65w", "90w", "100w", "120w", "150w",
  "fl50w", "fl100w", "fl150w", "FL 200W", "Others",
] as const;

export const CB_CONDITIONS = ["Good", "Bad"] as const;

export const YES_NO = ["yes", "no"] as const;
