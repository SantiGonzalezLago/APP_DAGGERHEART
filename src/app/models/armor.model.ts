import { LocalizedTextField } from './localized-fields.model';

export interface ArmorFeature {
  name: LocalizedTextField;
  description: LocalizedTextField;
}

export interface Armor {
  name: LocalizedTextField;
  description: LocalizedTextField;
  tier: 1 | 2 | 3 | 4;
  threshold1: number;
  threshold2: number;
  baseScore: number;
  feature?: ArmorFeature;
}
