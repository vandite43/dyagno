// Common fault quick-start prompts, keyed by the appliance label used in
// app/(app)/chat/new/page.tsx. Appliances without entries simply show no chips.

export const COMMON_FAULTS: Record<string, string[]> = {
  Washer: [
    "Drum spins but clothes come out soaking wet",
    "Washer won't drain — water sitting at the bottom",
    "Machine vibrates violently during spin cycle",
    "Door won't open after cycle ends",
    "Washer won't start at all",
  ],
  Refrigerator: [
    "Fridge not cooling but freezer is fine",
    "Ice maker stopped producing ice",
    "Water pooling inside the fridge",
    "Fridge making loud clicking or humming noise",
    "Fridge runs constantly and won't stop",
  ],
  Dryer: [
    "Dryer runs but produces no heat",
    "Clothes take multiple cycles to dry",
    "Dryer makes loud squealing noise",
    "Dryer won't start — no response",
    "Burning smell during operation",
  ],
  Dishwasher: [
    "Dishwasher not draining after cycle",
    "Dishes coming out dirty or with residue",
    "Dishwasher leaking water onto floor",
    "Not completing full wash cycle",
    "Making loud grinding noise during wash",
  ],
  "Oven / Range": [
    "Oven not heating to set temperature",
    "Burner won't ignite or stay lit",
    "Oven showing error / fault code",
    "Self-clean cycle won't start",
    "Oven door won't close properly",
  ],
  Microwave: [
    "Microwave runs but doesn't heat food",
    "Turntable not spinning",
    "Sparking or arcing inside during use",
    "Display dead — no power at all",
    "Door latch broken or won't close",
  ],
  Freezer: [
    "Freezer not freezing — contents thawing",
    "Excessive frost or ice buildup",
    "Freezer making loud noise",
    "Freezer runs constantly",
    "Water pooling under the freezer",
  ],
  "Ice Maker": [
    "Ice maker not producing any ice",
    "Ice cubes are too small or hollow",
    "Ice maker leaking water",
    "Ice has bad taste or smell",
    "Ice maker making loud noise",
  ],
  Disposal: [
    "Disposal humming but not spinning",
    "Disposal completely dead — no sound",
    "Disposal leaking from bottom",
    "Disposal jammed — won't turn",
    "Slow drain after disposal runs",
  ],
  "Trash Compactor": [
    "Compactor won't start",
    "Ram not returning to home position",
    "Compactor making grinding noise",
    "Door won't open or latch",
    "Compactor stops mid-cycle",
  ],
};

export function faultsFor(appliance: string | null | undefined): string[] {
  if (!appliance) return [];
  return COMMON_FAULTS[appliance] ?? [];
}
