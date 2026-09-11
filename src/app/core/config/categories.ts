import { PartCategory } from '../models/part.model';

export interface CategoryMeta {
  id: PartCategory;
  label: string;
  icon: string;
  optional?: boolean;
  description: string;
}

export const CATEGORY_META: CategoryMeta[] = [
  {
    id: 'cpu',
    label: 'CPU',
    icon: 'memory',
    description: 'Processor for your build',
  },
  {
    id: 'motherboard',
    label: 'Motherboard',
    icon: 'developer_board',
    description: 'Matches CPU socket and RAM type',
  },
  {
    id: 'memory',
    label: 'Memory',
    icon: 'sd_card',
    description: 'DDR4 / DDR5 RAM kits',
  },
  {
    id: 'storage',
    label: 'Storage',
    icon: 'storage',
    description: 'SSD or hard drive',
  },
  {
    id: 'gpu',
    label: 'GPU',
    icon: 'videogame_asset',
    optional: true,
    description: 'Optional if CPU/motherboard has iGPU',
  },
  {
    id: 'psu',
    label: 'PSU',
    icon: 'power',
    description: 'Power supply unit',
  },
  {
    id: 'case',
    label: 'Case',
    icon: 'inventory_2',
    description: 'Chassis for your components',
  },
  {
    id: 'cooling',
    label: 'Cooling',
    icon: 'ac_unit',
    description: 'CPU cooler',
  },
];
