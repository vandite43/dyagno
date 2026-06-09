// Curated list of parts that appliance repair technicians commonly keep on hand,
// grouped by appliance category. Used to seed the Stock checklist.

export interface StockPart {
  name: string;
  note: string;
}

export interface StockCategory {
  category: string;
  parts: StockPart[];
}

export const COMMON_STOCK_PARTS: StockCategory[] = [
  {
    category: "Washer",
    parts: [
      { name: "Drain pump", note: "Most common cause of no-drain faults" },
      { name: "Door / lid latch assembly", note: "Wears out, blocks cycle start" },
      { name: "Drive belt", note: "Cracks and slips over time" },
      { name: "Water inlet valve", note: "Sticks open or fails to fill" },
      { name: "Shock absorbers / suspension", note: "Causes violent shaking" },
    ],
  },
  {
    category: "Dryer",
    parts: [
      { name: "Heating element", note: "#1 cause of no-heat" },
      { name: "Thermal fuse", note: "Cheap, blows on overheat" },
      { name: "Drum belt", note: "Snaps and stops the drum" },
      { name: "Idler pulley", note: "Squeals and seizes" },
      { name: "Cycling thermostat / thermistor", note: "Bad temperature regulation" },
    ],
  },
  {
    category: "Refrigerator",
    parts: [
      { name: "Defrost thermostat", note: "Frost buildup, weak cooling" },
      { name: "Evaporator fan motor", note: "Noisy or warm fridge" },
      { name: "Water inlet valve", note: "Ice maker / dispenser issues" },
      { name: "Compressor start relay", note: "Clicking, won't cool" },
      { name: "Door gasket", note: "Seal failure, condensation" },
    ],
  },
  {
    category: "Dishwasher",
    parts: [
      { name: "Drain pump", note: "Standing water after cycle" },
      { name: "Door latch assembly", note: "Won't start / mid-cycle stop" },
      { name: "Water inlet valve", note: "No fill or overfill" },
      { name: "Wash pump motor", note: "Poor cleaning, grinding noise" },
      { name: "Door gasket / seal", note: "Leaks onto the floor" },
    ],
  },
  {
    category: "Oven / Range",
    parts: [
      { name: "Bake element", note: "No bottom heat" },
      { name: "Broil element", note: "No top heat" },
      { name: "Surface burner igniter", note: "Won't light or clicks constantly" },
      { name: "Oven igniter (gas)", note: "Weak glow, no ignition" },
      { name: "Oven temperature sensor", note: "Wrong temps / fault codes" },
    ],
  },
  {
    category: "Universal / consumables",
    parts: [
      { name: "Assorted thermal fuses", note: "Common across dryers & more" },
      { name: "Door / micro switches", note: "Used in most appliances" },
      { name: "Run / start capacitors", note: "Motor-driven appliances" },
      { name: "Wire connectors & terminals", note: "Repairs and splices" },
      { name: "Appliance-safe lubricant", note: "Bearings, pulleys, hinges" },
    ],
  },
];
