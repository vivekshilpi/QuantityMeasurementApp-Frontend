import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { HistoryService, AuthService } from '../../services';
import { HistoryItem } from '../../models';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit, OnDestroy {
  history: HistoryItem[] = [];
  userName = 'User';
  private subscription?: Subscription;

  constructor(
    private historyService: HistoryService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription = this.historyService.history$.subscribe(
      history => this.history = history
    );

    const user = this.authService.currentUser;
    if (user) {
      this.userName = user.fullName || user.name || user.email || 'User';
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  formatUnit(unit: string): string {
    if (!unit) return '';
    return unit.charAt(0) + unit.slice(1).toLowerCase();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getActionIcon(type: string): string {
    switch (type) {
      case 'conversion': return '🔄';
      case 'comparison': return '⚖️';
      case 'arithmetic': return '🧮';
      default: return '📊';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'Length': return '📏';
      case 'Weight': return '⚖️';
      case 'Volume': return '🧪';
      case 'Temperature': return '🌡️';
      default: return '📊';
    }
  }

  deleteItem(id: string): void {
    this.historyService.deleteHistoryItem(id);
  }

  clearAll(): void {
    if (confirm('Are you sure you want to clear all history?')) {
      this.historyService.clearHistory();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
