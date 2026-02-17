import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonItem, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslatePipe } from '../pipes/translate.pipe';
import { Subscription, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.page.html',
  styleUrls: ['./rules.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonMenuButton,
    IonItem,
    IonSelect,
    IonSelectOption,
    TranslatePipe,
  ],
})
export class RulesPage implements OnInit, OnDestroy {
  private routeSubscription?: Subscription;
  private languageSubscription?: Subscription;
  private contentSubscription?: Subscription;
  private readonly validSections = new Set([
    'introduction',
    'characterCreation',
    'coreMaterials',
    'coreMechanics',
    'runningAdventure'
  ]);

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private i18nService: I18nService
  ) {}

  activeSection = 'introduction';
  activeSectionContent: SafeHtml = '';

  ngOnInit(): void {
    this.routeSubscription = this.route.queryParamMap.subscribe(params => {
      const section = params.get('section');

      if (section && this.validSections.has(section)) {
        this.activeSection = section;
      }

      this.loadSectionContent();
    });

    this.languageSubscription = this.i18nService.currentLanguage$.subscribe(() => {
      this.loadSectionContent();
    });
  }

  onSectionChange(event: CustomEvent): void {
    this.activeSection = event.detail.value ?? 'introduction';
    this.loadSectionContent();
  }

  private loadSectionContent(): void {
    const language = this.i18nService.getCurrentLanguage();
    const localizedPath = `assets/daggerheart/rules/${this.activeSection}_${language}.html`;
    const defaultPath = `assets/daggerheart/rules/${this.activeSection}.html`;

    this.contentSubscription?.unsubscribe();
    this.contentSubscription = this.http.get(localizedPath, { responseType: 'text' }).pipe(
      map((content) => this.normalizeRulesContent(content)),
      catchError(() => of('')),
      switchMap((localizedContent) => {
        if (localizedContent) {
          return of(localizedContent);
        }

        return this.http.get(defaultPath, { responseType: 'text' }).pipe(
          map((content) => this.normalizeRulesContent(content)),
          catchError(() => of(''))
        );
      })
    ).subscribe(content => {
      this.activeSectionContent = this.sanitizer.bypassSecurityTrustHtml(content);
    });
  }

  private normalizeRulesContent(content: string): string {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return '';
    }

    if (trimmedContent.toLowerCase().includes('<app-root')) {
      return '';
    }

    return trimmedContent;
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.languageSubscription?.unsubscribe();
    this.contentSubscription?.unsubscribe();
  }
}
