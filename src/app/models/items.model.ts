import { LocalizedTextField } from './localized-fields.model';

export interface Item {
  name: LocalizedTextField;
  description: LocalizedTextField;
  isConsumable: boolean;
}
