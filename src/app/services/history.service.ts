import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HistoryItem } from '../models';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private readonly STORAGE_KEY = 'quantity_history';
  private historySubject = new BehaviorSubject<HistoryItem[]>(this.getStoredHistory());
  public history$ = this.historySubject.asObservable();

  private getStoredHistory(): HistoryItem[] {
    const historyJson = localStorage.getItem(this.STORAGE_KEY);
    if (!historyJson) return [];

    const history = JSON.parse(historyJson);
    return history.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp)
    }));
  }

  private saveHistory(history: HistoryItem[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    this.historySubject.next(history);
  }

  get history(): HistoryItem[] {
    return this.historySubject.value;
  }

  addHistoryItem(item: Omit<HistoryItem, 'id' | 'timestamp'>): void {
    const newItem: HistoryItem = {
      ...item,
      id: this.generateId(),
      timestamp: new Date()
    };

    const history = [newItem, ...this.history].slice(0, 50);
    this.saveHistory(history);
  }

  clearHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.historySubject.next([]);
  }

  deleteHistoryItem(id: string): void {
    const history = this.history.filter(item => item.id !== id);
    this.saveHistory(history);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
