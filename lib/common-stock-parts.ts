// High-volume appliance repair parts, organized by brand. Every entry has a
// verified OEM part number that technicians commonly stock. No model-specific
// parts, no compressors or sealed-system components.

export interface StockPart {
  name: string;
  partNumber: string;
  note: string;
}

export interface StockCategory {
  category: string;   // brand family
  parts: StockPart[];
}

export const COMMON_STOCK_PARTS: StockCategory[] = [
  {
    category: "Whirlpool / Kenmore / Maytag",
    parts: [
      { name: "Dryer heating element", partNumber: "279838", note: "#1 no-heat fix across the 29\" dryer family" },
      { name: "Dryer thermal fuse", partNumber: "3392519", note: "Cheap, blows on overheat — stock several" },
      { name: "Dryer cycling thermostat", partNumber: "3387134", note: "Erratic heat / temperature control" },
      { name: "Dryer high-limit thermostat", partNumber: "3977767", note: "Overheat protection; pairs with element" },
      { name: "Dryer drum belt", partNumber: "341241", note: "27\" dryers; snaps and stops the drum" },
      { name: "Washer drain pump & motor", partNumber: "W10536347", note: "Cabrio / Bravos / Oasis top-loaders" },
      { name: "Refrigerator defrost thermostat", partNumber: "W10225581", note: "Frost buildup, weak cooling" },
      { name: "Refrigerator temperature sensor", partNumber: "WP2188819", note: "Wrong temps; side-by-side units" },
      { name: "Refrigerator start relay / overload", partNumber: "W10613606", note: "Clicking, won't cool" },
    ],
  },
  {
    category: "Samsung",
    parts: [
      { name: "Dryer heating element", partNumber: "DC47-00019A", note: "Very common Samsung dryer no-heat failure" },
      { name: "Washer drain pump", partNumber: "DC96-01414A", note: "Frequent Samsung front-load drain failure" },
      { name: "Refrigerator ice maker assembly", partNumber: "DA97-12540", note: "Notorious Samsung French-door ice maker failure" },
    ],
  },
];
