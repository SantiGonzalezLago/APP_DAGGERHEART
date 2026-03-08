import { LocalizedTextField } from './localized-fields.model';

export interface CommunityFeature {
  name: LocalizedTextField;
  description: LocalizedTextField;
}

export interface Community {
  name: LocalizedTextField;
  description: LocalizedTextField;
  feature: CommunityFeature;
}
