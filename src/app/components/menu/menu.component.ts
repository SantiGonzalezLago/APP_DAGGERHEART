import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonIcon, IonMenuToggle } from '@ionic/angular/standalone';
import { ActionSheetController } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { globeOutline, chevronDownOutline, chevronForwardOutline } from 'ionicons/icons';
import { I18nService } from '../../services/i18n.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ConfigurationService } from '../../services/configuration.service';
import { KofiSupportCardComponent } from '../kofi-support-card/kofi-support-card.component';

addIcons({ globeOutline, chevronDownOutline, chevronForwardOutline });

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  imports: [CommonModule, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonIcon, IonMenuToggle, RouterLink, TranslatePipe, KofiSupportCardComponent],
  standalone: true
})
export class MenuComponent implements OnInit {
  private i18nService = inject(I18nService);
  private actionSheetCtrl = inject(ActionSheetController);
  private configurationService = inject(ConfigurationService);
  isRulesExpanded = false;
  isHeritageExpanded = false;
  isEquipmentExpanded = false;
  isGmContentExpanded = false;

  availableLanguages: string[] = [];
  currentLanguage: string = 'es';
  languageOptions: { value: string; label: string }[] = [];
  appVersion = this.configurationService.getAppVersion();
  licenseNoticeParams = {
    link: '<a class="menu-license-link" href="https://www.daggerheart.com" target="_blank" rel="noopener noreferrer">https://www.daggerheart.com</a>'
  };

  ngOnInit(): void {
    this.availableLanguages = this.i18nService.getAvailableLanguages();
    this.currentLanguage = this.i18nService.getCurrentLanguage();
    this.languageOptions = this.i18nService.getLanguageOptions();

    this.i18nService.currentLanguage$.subscribe(lang => {
      this.currentLanguage = lang;
    });
  }

  async openLanguageSelector(): Promise<void> {
    const isSystemDefault = !localStorage.getItem('language');

    const buttons = this.languageOptions.map(lang => {
      const isActive = isSystemDefault && lang.value === 'system' || !isSystemDefault && lang.value === this.currentLanguage;
      const label = this.i18nService.instant(lang.label);

      return {
        text: label,
        icon: lang.value === 'system' ? 'globe-outline' : undefined,
        cssClass: this.getLanguageButtonClasses(lang.value, isActive),
        handler: () => {
          this.i18nService.setLanguage(lang.value).subscribe();
        }
      };
    });

    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        ...buttons,
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  private getLanguageButtonClasses(languageValue: string, isActive: boolean): string {
    const classes = ['lang-option', `lang-${languageValue}`];

    if (isActive) {
      classes.push('active-language');
    }

    return classes.join(' ');
  }

  toggleRulesMenu(): void {
    this.isRulesExpanded = !this.isRulesExpanded;
  }

  toggleHeritageMenu(): void {
    this.isHeritageExpanded = !this.isHeritageExpanded;
  }

  toggleEquipmentMenu(): void {
    this.isEquipmentExpanded = !this.isEquipmentExpanded;
  }

  toggleGmContentMenu(): void {
    this.isGmContentExpanded = !this.isGmContentExpanded;
  }
}
