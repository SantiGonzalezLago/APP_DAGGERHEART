import { LocalizedTextField } from './localized-fields.model';

export interface AncestryFeature {
  name: LocalizedTextField;
  description: LocalizedTextField;
}

export interface Ancestry {
  name: LocalizedTextField;
  description: LocalizedTextField;
  featureOne: AncestryFeature;
  featureTwo: AncestryFeature;
}
