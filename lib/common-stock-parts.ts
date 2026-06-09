// Curated list of high-failure appliance parts technicians commonly keep on hand.
// Where a single brand is the dominant failure for a part, that brand's verified
// OEM number is listed. Parts whose numbers are genuinely model-specific are shown
// without a number (look up by model) rather than guessing.

export interface StockPart {
  name: string;
  brand?: string;       // most failure-prone / most common brand for this part
  partNumber?: string;  // verified OEM number (fits the noted family)
  note: string;
}

export interface StockCategory {
  category: string;
  parts: StockPart[];
}

export const COMMON_STOCK_PARTS: StockCategory[] = [
  {
    category: "Dryer",
    parts: [
      { name: "Heating element", brand: "Whirlpool / Kenmore / Maytag", partNumber: "279838", note: "#1 no-heat fix; fits the 29\" Whirlpool family" },
      { name: "Heating element", brand: "Samsung", partNumber: "DC47-00019A", note: "Very common Samsung dryer no-heat failure" },
      { name: "Heating element", brand: "GE", partNumber: "WE11X10006", note: "Common GE electric dryer no-heat" },
      { name: "Thermal fuse", brand: "Whirlpool / Kenmore", partNumber: "3392519", note: "Cheap, blows on overheat — stock several" },
      { name: "Drum belt", brand: "Whirlpool / Kenmore", partNumber: "341241", note: "27\" dryers; snaps and stops the drum" },
      { name: "Idler pulley", note: "Squeals and seizes — model-specific, look up by model" },
    ],
  },
  {
    category: "Washer",
    parts: [
      { name: "Drain pump & motor", brand: "Whirlpool / Maytag / Kenmore", partNumber: "W10536347", note: "Cabrio / Bravos / Oasis top-loaders" },
      { name: "Drain pump", brand: "Samsung", note: "Common Samsung failure — look up DC96 series for your model" },
      { name: "Door / lid latch assembly", note: "Blocks cycle start — model-specific" },
      { name: "Drive belt", note: "Cracks and slips — model-specific" },
      { name: "Shock absorbers / suspension", note: "Causes violent shaking — model-specific" },
    ],
  },
  {
    category: "Refrigerator",
    parts: [
      { name: "Defrost thermostat", brand: "Whirlpool / Kenmore", partNumber: "W10225581", note: "Frost buildup, weak cooling" },
      { name: "Temperature sensor (thermistor)", brand: "Whirlpool / KitchenAid / Maytag", partNumber: "WP2188819", note: "Wrong temps; side-by-side units" },
      { name: "Compressor start relay", brand: "Whirlpool / Maytag", partNumber: "W10613606", note: "Clicking, won't cool" },
      { name: "Ice maker assembly", brand: "Samsung", partNumber: "DA97-12540", note: "Notorious Samsung French-door ice maker failure" },
      { name: "Linear compressor", brand: "LG", note: "Well-known LG failure — major repair, order per model" },
      { name: "Door gasket", note: "Seal failure, condensation — model-specific" },
    ],
  },
  {
    category: "Dishwasher",
    parts: [
      { name: "Drain pump", note: "Standing water after cycle — model-specific" },
      { name: "Circulation / wash pump motor", brand: "Frigidaire", note: "Most common Frigidaire failure (poor cleaning)" },
      { name: "Water inlet valve", note: "No fill or overfill — model-specific" },
      { name: "Door latch assembly", note: "Won't start / mid-cycle stop — model-specific" },
      { name: "Door gasket / seal", note: "Leaks onto the floor — model-specific" },
    ],
  },
  {
    category: "Oven / Range",
    parts: [
      { name: "Bake element", note: "No bottom heat — model-specific" },
      { name: "Broil element", note: "No top heat — model-specific" },
      { name: "Surface burner igniter", note: "Won't light / clicks constantly — model-specific" },
      { name: "Oven igniter (gas)", note: "Weak glow, no ignition — model-specific" },
      { name: "Oven temperature sensor", note: "Wrong temps / fault codes — model-specific" },
    ],
  },
  {
    category: "Universal / consumables",
    parts: [
      { name: "Assorted thermal fuses", note: "Common across dryers and more" },
      { name: "Door / micro switches", note: "Used in most appliances" },
      { name: "Run / start capacitors", note: "Motor-driven appliances" },
      { name: "Wire connectors & terminals", note: "Repairs and splices" },
      { name: "Appliance-safe lubricant", note: "Bearings, pulleys, hinges" },
    ],
  },
];
