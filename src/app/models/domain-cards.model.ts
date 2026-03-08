import { LocalizedTextField } from './localized-fields.model';

export interface DomainCard {
  name: LocalizedTextField;
  description: LocalizedTextField;
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  domain: string;
  recall_cost: number;
}
