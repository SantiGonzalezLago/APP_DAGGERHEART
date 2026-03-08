import { LocalizedTextField } from './localized-fields.model';

export interface WeaponFeature {
  name: LocalizedTextField;
  description: LocalizedTextField;
}

export interface Weapon {
  name: LocalizedTextField;
  description: LocalizedTextField;
  category: 'primary' | 'secondary';
  type: 'phy' | 'mag';
  tier: 1 | 2 | 3 | 4;
  trait: 'aglity' | 'strength' | 'finesse' | 'instinct' | 'presence' | 'knowledge';
  range: 'melee' | 'very_close' | 'close' | 'far' | 'very_far';
  damage: string;
  burden: 1 | 2;
  feature?: WeaponFeature;
}
