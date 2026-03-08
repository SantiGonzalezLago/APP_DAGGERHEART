import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonBackButton, IonSearchbar, IonButton, IonIcon } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslatePipe } from '../pipes/translate.pipe';
import { Subscription, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { I18nService } from '../services/i18n.service';
import { addIcons } from 'ionicons';
import { chevronDownOutline, chevronUpOutline } from 'ionicons/icons';

interface TocHeading {
  id: string;
  titleKey: string;
}

interface TocSection {
  section: string;
  labelKey: string;
  headings: TocHeading[];
}

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
    IonBackButton,
    IonMenuButton,
    IonSearchbar,
    IonButton,
    IonIcon,
    TranslatePipe,
  ],
})
export class RulesPage implements OnInit, OnDestroy {
  private routeSubscription?: Subscription;
  private languageSubscription?: Subscription;
  private contentSubscription?: Subscription;
  private matchElements: HTMLElement[] = [];
  private currentMatchElement?: HTMLElement;
  private matchRenderTimeout?: ReturnType<typeof setTimeout>;
  private sameSectionAnchorTimeout?: ReturnType<typeof setTimeout>;
  private pendingAnchorId?: string;
  private pendingSectionTop = false;

  @ViewChild('rulesSection', { static: false }) private rulesSectionRef?: ElementRef<HTMLElement>;
  @ViewChild(IonContent, { static: false }) private contentRef?: IonContent;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private i18nService: I18nService
  ) {
    addIcons({ chevronUpOutline, chevronDownOutline });
  }

  activeSection: string = 'introduction';
  isTocCollapsed = true;
  searchQuery = '';
  hasSearchResults = true;
  totalMatches = 0;
  currentMatchIndex = -1;
  activeSectionContent: SafeHtml = '';
  tocSections: TocSection[] = [
    {
      section: 'introduction',
      labelKey: 'rules.sections.introduction',
      headings: [
        { id: 'what-is-this', titleKey: 'rules.introductionHeadings.whatIsThis' },
        { id: 'the-basics', titleKey: 'rules.introductionHeadings.theBasics' },
      ],
    },
    {
      section: 'characterCreation',
      labelKey: 'rules.sections.characterCreation',
      headings: [],
    },
    {
      section: 'coreMaterials',
      labelKey: 'rules.sections.coreMaterials',
      headings: [
        { id: 'domains', titleKey: 'rules.coreMaterialsHeadings.domains' },
        { id: 'classes', titleKey: 'rules.coreMaterialsHeadings.classes' },
        { id: 'ancestries', titleKey: 'rules.coreMaterialsHeadings.ancestries' },
        { id: 'communities', titleKey: 'rules.coreMaterialsHeadings.communities' },
      ],
    },
    {
      section: 'coreMechanics',
      labelKey: 'rules.sections.coreMechanics',
      headings: [
        { id: 'flow-of-the-game', titleKey: 'rules.coreMechanicsHeadings.flowOfTheGame' },
        { id: 'core-gameplay-loop', titleKey: 'rules.coreMechanicsHeadings.coreGameplayLoop' },
        { id: 'the-spotlight', titleKey: 'rules.coreMechanicsHeadings.theSpotlight' },
        { id: 'turn-order-and-action-economy', titleKey: 'rules.coreMechanicsHeadings.turnOrderAndActionEconomy' },
        { id: 'making-moves-and-taking-action', titleKey: 'rules.coreMechanicsHeadings.makingMovesAndTakingAction' },
        { id: 'combat', titleKey: 'rules.coreMechanicsHeadings.combat' },
        { id: 'stress', titleKey: 'rules.coreMechanicsHeadings.stress' },
        { id: 'attacking', titleKey: 'rules.coreMechanicsHeadings.attacking' },
        { id: 'maps-range-and-movement', titleKey: 'rules.coreMechanicsHeadings.mapsRangeAndMovement' },
        { id: 'conditions', titleKey: 'rules.coreMechanicsHeadings.conditions' },
        { id: 'downtime', titleKey: 'rules.coreMechanicsHeadings.downtime' },
        { id: 'death', titleKey: 'rules.coreMechanicsHeadings.death' },
        { id: 'additional-rules', titleKey: 'rules.coreMechanicsHeadings.additionalRules' },
        { id: 'leveling-up', titleKey: 'rules.coreMechanicsHeadings.levelingUp' },
        { id: 'multiclassing', titleKey: 'rules.coreMechanicsHeadings.multiclassing' },
        { id: 'equipment', titleKey: 'rules.coreMechanicsHeadings.equipment' },
        { id: 'weapons', titleKey: 'rules.coreMechanicsHeadings.weapons' },
        { id: 'combat-wheelchair', titleKey: 'rules.coreMechanicsHeadings.combatWheelchair' },
        { id: 'armor', titleKey: 'rules.coreMechanicsHeadings.armor' },
        { id: 'loot', titleKey: 'rules.coreMechanicsHeadings.loot' },
        { id: 'consumables', titleKey: 'rules.coreMechanicsHeadings.consumables' },
        { id: 'gold', titleKey: 'rules.coreMechanicsHeadings.gold' },
      ],
    },
    {
      section: 'runningAdventure',
      labelKey: 'rules.sections.runningAdventure',
      headings: [
        { id: 'gm-guidance', titleKey: 'rules.runningAdventureHeadings.gmGuidance' },
        { id: 'core-gm-mechanics', titleKey: 'rules.runningAdventureHeadings.coreGmMechanics' },
        { id: 'adversaries-and-environments', titleKey: 'rules.runningAdventureHeadings.adversariesAndEnvironments' },
        { id: 'environments', titleKey: 'rules.runningAdventureHeadings.environments' },
        { id: 'additional-gm-guidance', titleKey: 'rules.runningAdventureHeadings.additionalGmGuidance' },
        { id: 'campaign-frames', titleKey: 'rules.runningAdventureHeadings.campaignFrames' },
      ],
    },
    {
      section: 'appendix',
      labelKey: 'rules.sections.appendix',
      headings: [
        { id: 'domain-card-reference', titleKey: 'rules.appendixHeadings.domainCardReference' },
      ],
    },
  ];
  private normalizedSectionContent = '';

  ngOnInit(): void {
    this.routeSubscription = this.route.queryParamMap.subscribe(params => {
      const section = params.get('section') as string | null;

      if (section && this.tocSections.some(tocSection => tocSection.section === section)) {
        this.activeSection = section;
      }

      this.loadSectionContent();
    });

    this.languageSubscription = this.i18nService.currentLanguage$.subscribe(() => {
      this.loadSectionContent();
    });
  }

  toggleToc(): void {
    this.isTocCollapsed = !this.isTocCollapsed;
  }

  onTocSelect(section: string, anchorId?: string): void {
    this.isTocCollapsed = true;

    if (section === this.activeSection) {
      if (anchorId) {
        this.pendingAnchorId = undefined;
        this.pendingSectionTop = false;
        this.scheduleSameSectionAnchorScroll(anchorId);
      } else {
        this.pendingAnchorId = undefined;
        this.pendingSectionTop = false;
      }

      return;
    }

    this.activeSection = section;
    this.pendingAnchorId = anchorId;
    this.pendingSectionTop = !anchorId;
    this.loadSectionContent();
  }

  private scheduleSameSectionAnchorScroll(anchorId: string): void {
    if (this.sameSectionAnchorTimeout) {
      clearTimeout(this.sameSectionAnchorTimeout);
    }

    this.sameSectionAnchorTimeout = setTimeout(() => {
      this.sameSectionAnchorTimeout = undefined;
      void this.scrollToAnchor(anchorId, true);
    }, 0);
  }

  onSearchChange(event: CustomEvent): void {
    const anchorOffset = this.getCurrentMatchTextOffset();
    this.searchQuery = (event.detail.value ?? '').trim();
    this.updateDisplayedContent(anchorOffset);
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    this.goToNextMatch();
  }

  goToPreviousMatch(): void {
    if (!this.totalMatches) {
      return;
    }

    const previousIndex = this.currentMatchIndex <= 0
      ? this.totalMatches - 1
      : this.currentMatchIndex - 1;

    this.setCurrentMatch(previousIndex, true);
  }

  goToNextMatch(): void {
    if (!this.totalMatches) {
      return;
    }

    const nextIndex = this.currentMatchIndex >= this.totalMatches - 1
      ? 0
      : this.currentMatchIndex + 1;

    this.setCurrentMatch(nextIndex, true);
  }

  private loadSectionContent(): void {
    const sectionToLoad = this.activeSection;
    const language = this.i18nService.getCurrentLanguage();
    const localizedPath = `assets/daggerheart/rules/${sectionToLoad}_${language}.html`;
    const defaultPath = `assets/daggerheart/rules/${sectionToLoad}.html`;

    this.contentSubscription?.unsubscribe();
    this.contentSubscription = this.http.get(localizedPath, { responseType: 'text' }).pipe(
      map((content) => this.normalizeRulesContent(content, sectionToLoad)),
      catchError(() => of('')),
      switchMap((localizedContent) => {
        if (localizedContent) {
          return of(localizedContent);
        }

        return this.http.get(defaultPath, { responseType: 'text' }).pipe(
          map((content) => this.normalizeRulesContent(content, sectionToLoad)),
          catchError(() => of(''))
        );
      })
    ).subscribe(content => {
      this.normalizedSectionContent = content;
      this.updateDisplayedContent();
    });
  }

  private updateDisplayedContent(anchorOffset?: number): void {
    if (!this.searchQuery) {
      this.hasSearchResults = true;
      this.resetMatchState();
      this.activeSectionContent = this.sanitizer.bypassSecurityTrustHtml(this.normalizedSectionContent);
      this.scheduleMatchRefresh(false);
      return;
    }

    const highlightedResult = this.highlightContentMatches(this.normalizedSectionContent, this.searchQuery);
    this.hasSearchResults = highlightedResult.matches > 0;
    this.activeSectionContent = this.sanitizer.bypassSecurityTrustHtml(highlightedResult.content);
    this.scheduleMatchRefresh(true, anchorOffset);
  }

  private scheduleMatchRefresh(autofocusFirstMatch: boolean, anchorOffset?: number): void {
    if (this.matchRenderTimeout) {
      clearTimeout(this.matchRenderTimeout);
    }

    this.matchRenderTimeout = setTimeout(() => {
      this.refreshMatchElements(autofocusFirstMatch, anchorOffset);
    });
  }

  private refreshMatchElements(autofocusFirstMatch: boolean, anchorOffset?: number): void {
    const rulesSectionElement = this.rulesSectionRef?.nativeElement;

    if (!rulesSectionElement) {
      this.resetMatchState();
      return;
    }

    this.matchElements = Array.from(
      rulesSectionElement.querySelectorAll('mark.rules-highlight')
    ) as HTMLElement[];

    this.totalMatches = this.matchElements.length;

    if (!this.searchQuery || !this.totalMatches) {
      this.currentMatchElement = undefined;
      this.currentMatchIndex = -1;
    } else {
      if (anchorOffset !== undefined) {
        this.currentMatchIndex = this.findFirstMatchIndexFromOffset(anchorOffset, rulesSectionElement);
      } else if (
        autofocusFirstMatch ||
        this.currentMatchIndex < 0 ||
        this.currentMatchIndex >= this.totalMatches
      ) {
        this.currentMatchIndex = this.findFirstMatchIndexFromViewport();
      }

      this.setCurrentMatch(this.currentMatchIndex, true);
    }

    if (this.pendingAnchorId) {
      const anchorId = this.pendingAnchorId;
      this.pendingAnchorId = undefined;
      void this.scrollToAnchor(anchorId, true);
      return;
    }
  }

  private async scrollToAnchor(anchorId: string, smooth: boolean): Promise<void> {
    const rulesSectionElement = this.rulesSectionRef?.nativeElement;
    const targetElement = rulesSectionElement?.querySelector<HTMLElement>(`#${anchorId}`);

    if (!targetElement) {
      return;
    }

    await this.scrollToElementWithOffset(targetElement, smooth);
  }

  private async scrollToElementWithOffset(targetElement: HTMLElement, smooth: boolean): Promise<void> {
    const content = this.contentRef;

    if (!content) {
      targetElement.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start', inline: 'nearest' });
      return;
    }

    const scrollElement = await content.getScrollElement();
    const targetY = this.calculateTargetScrollTop(scrollElement, targetElement);
    await content.scrollToPoint(0, targetY, smooth ? 260 : 0);
  }

  private calculateTargetScrollTop(scrollElement: HTMLElement, targetElement: HTMLElement): number {
    const scrollRect = scrollElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    const currentScrollTop = scrollElement.scrollTop;
    const topOffset = 100;

    return Math.max(currentScrollTop + (targetRect.top - scrollRect.top) - topOffset, 0);
  }

  private getCurrentMatchTextOffset(): number | undefined {
    const rulesSectionElement = this.rulesSectionRef?.nativeElement;

    if (!rulesSectionElement || !this.currentMatchElement || !rulesSectionElement.contains(this.currentMatchElement)) {
      return undefined;
    }

    return this.getElementTextOffset(this.currentMatchElement, rulesSectionElement);
  }

  private findFirstMatchIndexFromOffset(anchorOffset: number, containerElement: HTMLElement): number {
    for (let index = 0; index < this.matchElements.length; index += 1) {
      const matchOffset = this.getElementTextOffset(this.matchElements[index], containerElement);

      if (matchOffset >= anchorOffset) {
        return index;
      }
    }

    return 0;
  }

  private findFirstMatchIndexFromViewport(): number {
    const stickyContainer = document.querySelector('.search-sticky') as HTMLElement | null;
    const viewportTop = stickyContainer?.getBoundingClientRect().bottom ?? 0;

    for (let index = 0; index < this.matchElements.length; index += 1) {
      const matchRect = this.matchElements[index].getBoundingClientRect();

      if (matchRect.bottom >= viewportTop) {
        return index;
      }
    }

    return 0;
  }

  private getElementTextOffset(element: HTMLElement, containerElement: HTMLElement): number {
    const range = document.createRange();
    range.setStart(containerElement, 0);
    range.setEndBefore(element);
    return range.toString().length;
  }

  private setCurrentMatch(matchIndex: number, scrollIntoView: boolean): void {
    if (!this.totalMatches || matchIndex < 0 || matchIndex >= this.totalMatches) {
      return;
    }

    this.currentMatchElement?.classList.remove('rules-highlight-current');

    const nextMatchElement = this.matchElements[matchIndex];
    nextMatchElement.classList.add('rules-highlight-current');

    this.currentMatchElement = nextMatchElement;
    this.currentMatchIndex = matchIndex;

    if (scrollIntoView) {
      nextMatchElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }
  }

  private resetMatchState(): void {
    this.currentMatchElement?.classList.remove('rules-highlight-current');
    this.matchElements = [];
    this.currentMatchElement = undefined;
    this.totalMatches = 0;
    this.currentMatchIndex = -1;
  }

  private highlightContentMatches(content: string, query: string): { content: string; matches: number } {
    const trimmedQuery = query.trim();

    if (!trimmedQuery || !content) {
      return { content, matches: 0 };
    }

    const parser = new DOMParser();
    const documentFragment = parser.parseFromString(content, 'text/html');
    const regex = new RegExp(this.escapeRegExp(trimmedQuery), 'gi');
    const textNodes: Text[] = [];
    let matches = 0;

    const treeWalker = documentFragment.createTreeWalker(documentFragment.body, NodeFilter.SHOW_TEXT);
    let currentNode = treeWalker.nextNode();

    while (currentNode) {
      const parentElement = currentNode.parentElement;
      const parentTagName = parentElement?.tagName;

      if (parentTagName !== 'SCRIPT' && parentTagName !== 'STYLE') {
        textNodes.push(currentNode as Text);
      }

      currentNode = treeWalker.nextNode();
    }

    for (const textNode of textNodes) {
      const textContent = textNode.textContent ?? '';
      regex.lastIndex = 0;

      if (!regex.test(textContent)) {
        continue;
      }

      regex.lastIndex = 0;
      const replacementFragment = documentFragment.createDocumentFragment();
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(textContent)) !== null) {
        const beforeMatch = textContent.slice(lastIndex, match.index);

        if (beforeMatch) {
          replacementFragment.append(documentFragment.createTextNode(beforeMatch));
        }

        const highlightedMatch = documentFragment.createElement('mark');
        highlightedMatch.className = 'rules-highlight';
        highlightedMatch.textContent = match[0];
        replacementFragment.append(highlightedMatch);

        matches += 1;
        lastIndex = match.index + match[0].length;
      }

      const afterMatch = textContent.slice(lastIndex);

      if (afterMatch) {
        replacementFragment.append(documentFragment.createTextNode(afterMatch));
      }

      textNode.parentNode?.replaceChild(replacementFragment, textNode);
    }

    return {
      content: documentFragment.body.innerHTML,
      matches,
    };
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private normalizeRulesContent(content: string, section: string): string {
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
    if (this.matchRenderTimeout) {
      clearTimeout(this.matchRenderTimeout);
    }
    if (this.sameSectionAnchorTimeout) {
      clearTimeout(this.sameSectionAnchorTimeout);
    }
  }
}
