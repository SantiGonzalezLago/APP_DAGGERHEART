import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

type JsonObject = Record<string, unknown>;
export type ReferenceData = JsonObject | unknown[];

@Injectable({
  providedIn: 'root'
})
export class ReferenceService {
  private http = inject(HttpClient);

  private readonly basePath = 'assets/daggerheart/reference';
  private readonly storagePrefix = 'com.santigl.daggerheart.reference.';

  getReference(referenceName: string): Observable<ReferenceData> {
    const referenceKey = this.normalizeReferenceName(referenceName);
    const customItems = this.getCustomItems(referenceKey);

    return this.http.get<ReferenceData>(`${this.basePath}/${referenceKey}.json`).pipe(
      map((baseData) => this.mergeReferenceData(baseData, customItems)),
      catchError(() => of(customItems))
    );
  }

  getCustomItems(referenceName: string): unknown[] {
    const referenceKey = this.normalizeReferenceName(referenceName);
    const storageValue = localStorage.getItem(this.getStorageKey(referenceKey));

    if (!storageValue) {
      return [];
    }

    try {
      const parsed = JSON.parse(storageValue) as unknown;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  addCustomItem(referenceName: string, item: unknown): unknown[] {
    const referenceKey = this.normalizeReferenceName(referenceName);
    const items = this.getCustomItems(referenceKey);

    items.push(item);
    this.saveCustomItems(referenceKey, items);

    return items;
  }

  removeCustomItemByIndex(referenceName: string, index: number): unknown[] {
    const referenceKey = this.normalizeReferenceName(referenceName);
    const items = this.getCustomItems(referenceKey);

    if (index < 0 || index >= items.length) {
      return items;
    }

    items.splice(index, 1);
    this.saveCustomItems(referenceKey, items);

    return items;
  }

  removeCustomItemById(referenceName: string, itemId: string | number, idField: string = 'id'): unknown[] {
    const referenceKey = this.normalizeReferenceName(referenceName);
    const items = this.getCustomItems(referenceKey);

    const updatedItems = items.filter((item) => {
      if (!this.isJsonObject(item)) {
        return true;
      }

      return item[idField] !== itemId;
    });

    this.saveCustomItems(referenceKey, updatedItems);

    return updatedItems;
  }

  clearCustomItems(referenceName: string): void {
    const referenceKey = this.normalizeReferenceName(referenceName);
    localStorage.removeItem(this.getStorageKey(referenceKey));
  }

  private mergeReferenceData(baseData: ReferenceData, customItems: unknown[]): ReferenceData {
    if (Array.isArray(baseData)) {
      return [...baseData, ...customItems];
    }

    if (this.isJsonObject(baseData)) {
      return {
        ...baseData,
        customItems
      };
    }

    return customItems;
  }

  private saveCustomItems(referenceKey: string, items: unknown[]): void {
    localStorage.setItem(this.getStorageKey(referenceKey), JSON.stringify(items));
  }

  private getStorageKey(referenceKey: string): string {
    return `${this.storagePrefix}${referenceKey}`;
  }

  private normalizeReferenceName(referenceName: string): string {
    return referenceName.trim().replace(/[^a-zA-Z0-9_-]/g, '');
  }

  private isJsonObject(value: unknown): value is JsonObject {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }
}
