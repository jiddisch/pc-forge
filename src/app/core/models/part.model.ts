export type PartCategory =
  | 'cpu'
  | 'motherboard'
  | 'memory'
  | 'storage'
  | 'gpu'
  | 'psu'
  | 'case'
  | 'cooling';

export interface PartSpecs {
  [key: string]: string | number | boolean | undefined;
  socket?: string;
  ramType?: string;
  tdpW?: number;
  wattage?: number;
  formFactor?: string;
  lengthMm?: number;
  integratedGraphics?: boolean;
  coolerHeightMm?: number;
  maxCoolerHeightMm?: number;
  gpuLengthMm?: number;
}

export interface Part {
  id: string;
  category: PartCategory;
  name: string;
  brand: string;
  price: number;
  specs: PartSpecs;
  imageUrl: string;
}

export type BuildSlots = {
  cpu: Part | null;
  motherboard: Part | null;
  memory: Part | null;
  storage: Part | null;
  gpu: Part | null;
  psu: Part | null;
  case: Part | null;
  cooling: Part | null;
};

export const REQUIRED_CATEGORIES: PartCategory[] = [
  'cpu',
  'motherboard',
  'memory',
  'storage',
  'psu',
  'case',
  'cooling',
];

export const ALL_CATEGORIES: PartCategory[] = [
  'cpu',
  'motherboard',
  'memory',
  'storage',
  'gpu',
  'psu',
  'case',
  'cooling',
];
