import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  private readonly APP_VERSION = '0.0.1';
  private readonly LINK_KOFI = 'ko-fi.com/santigl';

  getAppVersion(): string {
    return this.APP_VERSION;
  }

  getKoFiLink(): string {
    return this.LINK_KOFI;
  }

  getKoFiHref(): string {
    const link = this.getKoFiLink();
    return /^https?:\/\//i.test(link) ? link : `https://${link}`;
  }
}