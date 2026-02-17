import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigurationService } from '../../services/configuration.service';
import { TranslatePipe } from 'src/app/pipes/translate.pipe';

@Component({
  selector: 'app-kofi-support-card',
  templateUrl: './kofi-support-card.component.html',
  styleUrls: ['./kofi-support-card.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslatePipe],
})
export class KofiSupportCardComponent {
  @Input() avatarSrc: string = 'assets/images/avatar.png';
  @Input() kofiIconSrc: string = 'assets/images/kofi.png';

  href: string = '';
  displayUrl: string = '';
  private configurationService = inject(ConfigurationService);

  constructor() {
    this.href = this.configurationService.getKoFiHref();
    this.displayUrl = this.configurationService.getKoFiLink();
  }
}
