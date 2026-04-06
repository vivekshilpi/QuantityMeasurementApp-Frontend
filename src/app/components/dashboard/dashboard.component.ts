import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, Subscription, debounceTime, takeUntil } from 'rxjs';
import { QuantityService, AuthService, HistoryService } from '../../services';
import {
  MeasurementType,
  ActionType,
  ArithmeticOperation,
  UNITS,
  TYPE_MAP,
  QuantityRequest,
  HistoryItem
} from '../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  selectedType: MeasurementType = 'Length';
  selectedAction: ActionType = 'conversion';
  arithmeticOperation: ArithmeticOperation = 'add';

  userName = 'User';
  isLoggedIn = false;
  recentHistory: HistoryItem[] = [];
  private historySubscription?: Subscription;

  conversionValue = '';
  conversionFromUnit = '';
  conversionToUnit = '';
  conversionResultValue = '';
  conversionLoading = false;

  comparisonValue1 = '';
  comparisonUnit1 = '';
  comparisonValue2 = '';
  comparisonUnit2 = '';
  comparisonResult = '';
  comparisonResultClass = '';
  comparisonLoading = false;

  arithmeticValue1 = '';
  arithmeticUnit1 = '';
  arithmeticValue2 = '';
  arithmeticUnit2 = '';
  arithmeticResultValue = '';
  arithmeticResultUnit = '';
  arithmeticTargetUnit = '';
  arithmeticLoading = false;

  private arithmeticBaseValue: number | null = null;
  private arithmeticBaseUnit = '';

  errorMessage = '';

  private destroy$ = new Subject<void>();
  private comparisonInput$ = new Subject<void>();

  constructor(
    private quantityService: QuantityService,
    private authService: AuthService,
    private historyService: HistoryService
  ) {
    this.initializeUnits();
    this.setupComparisonDebounce();
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated;

    const user = this.authService.currentUser;
    if (user) {
      this.userName = user.fullName || user.name || user.email || 'User';
    }

    if (this.isLoggedIn) {
      this.historySubscription = this.historyService.history$.subscribe(
        history => this.recentHistory = history.slice(0, 5)
      );
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.historySubscription?.unsubscribe();
  }

  get units(): string[] {
    return UNITS[this.selectedType] || [];
  }

  get isTemperature(): boolean {
    return this.selectedType === 'Temperature';
  }

  private initializeUnits(): void {
    const units = this.units;
    if (units.length === 0) return;

    this.conversionFromUnit = units[0];
    this.conversionToUnit = units[1] || units[0];
    this.comparisonUnit1 = units[0];
    this.comparisonUnit2 = units[1] || units[0];
    this.arithmeticUnit1 = units[0];
    this.arithmeticUnit2 = units[1] || units[0];
    this.arithmeticTargetUnit = units[0];
  }

  private setupComparisonDebounce(): void {
    this.comparisonInput$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.performComparison());
  }

  selectType(type: MeasurementType): void {
    this.selectedType = type;
    this.initializeUnits();
    this.clearResults();
  }

  selectAction(action: ActionType): void {
    this.selectedAction = action;
    this.clearResults();
  }

  private clearResults(): void {
    this.conversionResultValue = '';
    this.comparisonResult = '';
    this.comparisonResultClass = '';
    this.arithmeticResultValue = '';
    this.arithmeticResultUnit = '';
    this.arithmeticBaseValue = null;
    this.arithmeticBaseUnit = '';
    this.errorMessage = '';
  }

  formatUnit(unit: string): string {
    if (!unit) return '';
    return unit.charAt(0) + unit.slice(1).toLowerCase();
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.recentHistory = [];
  }

  convert(): void {
    if (!this.conversionValue || !this.conversionFromUnit || !this.conversionToUnit) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    this.errorMessage = '';
    this.conversionLoading = true;

    const request = this.buildRequest(
      parseFloat(this.conversionValue),
      this.conversionFromUnit,
      0,
      this.conversionToUnit
    );

    this.quantityService.convert(request).subscribe({
      next: (response) => {
        this.applyConversionResult(response);
        this.conversionLoading = false;
      },
      error: (error) => {
        this.errorMessage = this.getErrorMessage(error, 'Conversion failed. Please try again.');
        this.conversionLoading = false;
      }
    });
  }

  private applyConversionResult(response: { result: string }): void {
    const parsed = this.quantityService.parseResult(this.quantityService.getResultText(response));
    const resultUnit = parsed.unit || this.conversionToUnit;
    const formatted = this.quantityService.formatResult(parsed.value);

    this.conversionResultValue = formatted;

    if (this.isLoggedIn) {
      this.historyService.addHistoryItem({
        type: 'conversion',
        measurementType: this.selectedType,
        input1: { value: parseFloat(this.conversionValue), unit: this.conversionFromUnit },
        input2: { value: parsed.value, unit: resultUnit },
        result: `${this.conversionValue} ${this.formatUnit(this.conversionFromUnit)} = ${formatted} ${this.formatUnit(resultUnit)}`
      });
    }
  }

  onComparisonInputChange(): void {
    this.comparisonInput$.next();
  }

  performComparison(): void {
    if (!this.comparisonValue1 || !this.comparisonUnit1 || !this.comparisonValue2 || !this.comparisonUnit2) {
      this.comparisonResult = '';
      this.comparisonResultClass = '';
      return;
    }

    this.errorMessage = '';
    this.comparisonLoading = true;

    const val1 = parseFloat(this.comparisonValue1);
    const val2 = parseFloat(this.comparisonValue2);
    const request = this.buildRequest(val1, this.comparisonUnit1, val2, this.comparisonUnit2);

    this.quantityService.compare(request).subscribe({
      next: (response) => {
        const isEqual = this.quantityService.isEqual(this.quantityService.getResultText(response));
        if (isEqual) {
          this.applyComparisonResult('EQUAL', val1, val2);
          this.comparisonLoading = false;
          return;
        }

        const convertRequest = this.buildRequest(val1, this.comparisonUnit1, 0, this.comparisonUnit2);
        this.quantityService.convert(convertRequest).subscribe({
          next: (convertResponse) => {
            const parsed = this.quantityService.parseResult(this.quantityService.getResultText(convertResponse));
            const relation = parsed.value > val2 ? 'GREATER' : 'LESS';
            this.applyComparisonResult(relation, val1, val2);
            this.comparisonLoading = false;
          },
          error: () => {
            this.errorMessage = 'Comparison failed. Please try again.';
            this.comparisonLoading = false;
          }
        });
      },
      error: (error) => {
        this.errorMessage = this.getErrorMessage(error, 'Comparison failed. Please try again.');
        this.comparisonLoading = false;
      }
    });
  }

  private applyComparisonResult(relation: 'EQUAL' | 'GREATER' | 'LESS', val1: number, val2: number): void {
    const left = `${val1} ${this.formatUnit(this.comparisonUnit1)}`;
    const right = `${val2} ${this.formatUnit(this.comparisonUnit2)}`;

    if (relation === 'EQUAL') {
      this.comparisonResult = `${left} is EQUAL to ${right}`;
      this.comparisonResultClass = 'equal';
    } else if (relation === 'GREATER') {
      this.comparisonResult = `${left} is GREATER than ${right}`;
      this.comparisonResultClass = 'not-equal';
    } else {
      this.comparisonResult = `${left} is LESS than ${right}`;
      this.comparisonResultClass = 'not-equal';
    }

    if (this.isLoggedIn) {
      this.historyService.addHistoryItem({
        type: 'comparison',
        measurementType: this.selectedType,
        input1: { value: val1, unit: this.comparisonUnit1 },
        input2: { value: val2, unit: this.comparisonUnit2 },
        result: this.comparisonResult
      });
    }
  }

  performArithmetic(): void {
    if (!this.arithmeticValue1 || !this.arithmeticUnit1 || !this.arithmeticValue2 || !this.arithmeticUnit2) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (this.selectedType === 'Temperature') {
      this.errorMessage = 'Temperature does not support arithmetic operations.';
      return;
    }

    this.errorMessage = '';
    this.arithmeticLoading = true;
    this.arithmeticResultValue = '';
    this.arithmeticResultUnit = '';
    this.arithmeticBaseValue = null;
    this.arithmeticBaseUnit = '';

    const val1 = parseFloat(this.arithmeticValue1);
    const val2 = parseFloat(this.arithmeticValue2);
    const request = this.buildRequest(val1, this.arithmeticUnit1, val2, this.arithmeticUnit2);

    const operation$ = this.arithmeticOperation === 'subtract'
      ? this.quantityService.subtract(request)
      : this.arithmeticOperation === 'divide'
        ? this.quantityService.divide(request)
        : this.quantityService.add(request);

    operation$.subscribe({
      next: (response) => {
        this.applyArithmeticResult(val1, val2, response);
        this.arithmeticLoading = false;
      },
      error: (error) => {
        this.errorMessage = this.getErrorMessage(error, 'Operation failed. Please try again.');
        this.arithmeticLoading = false;
      }
    });
  }

  private getErrorMessage(error: any, fallback: string): string {
    return error?.error?.message || error?.error?.errorMessage || fallback;
  }

  private applyArithmeticResult(val1: number, val2: number, response: { result: string }): void {
    const parsed = this.quantityService.parseResult(this.quantityService.getResultText(response));
    const symbol = this.arithmeticOperation === 'subtract' ? '-' : this.arithmeticOperation === 'divide' ? '÷' : '+';

    this.arithmeticBaseValue = parsed.value;
    this.arithmeticBaseUnit = parsed.unit || (this.arithmeticOperation === 'divide' ? '' : this.arithmeticUnit1);

    if (!this.arithmeticBaseUnit) {
      const formatted = this.quantityService.formatResult(parsed.value);
      this.arithmeticResultValue = formatted;
      this.arithmeticResultUnit = '';

      if (this.isLoggedIn) {
        this.historyService.addHistoryItem({
          type: 'arithmetic',
          measurementType: this.selectedType,
          operation: this.arithmeticOperation,
          input1: { value: val1, unit: this.arithmeticUnit1 },
          input2: { value: val2, unit: this.arithmeticUnit2 },
          result: `${val1} ${this.formatUnit(this.arithmeticUnit1)} ${symbol} ${val2} ${this.formatUnit(this.arithmeticUnit2)} = ${formatted}`
        });
      }
      return;
    }

    const targetUnit = this.arithmeticTargetUnit || this.arithmeticBaseUnit;
    this.convertArithmeticResult(targetUnit, () => {
      if (!this.isLoggedIn) return;
      this.historyService.addHistoryItem({
        type: 'arithmetic',
        measurementType: this.selectedType,
        operation: this.arithmeticOperation,
        input1: { value: val1, unit: this.arithmeticUnit1 },
        input2: { value: val2, unit: this.arithmeticUnit2 },
        result: `${val1} ${this.formatUnit(this.arithmeticUnit1)} ${symbol} ${val2} ${this.formatUnit(this.arithmeticUnit2)} = ${this.arithmeticResultValue} ${this.formatUnit(this.arithmeticResultUnit)}`
      });
    });
  }

  onArithmeticResultUnitChange(): void {
    if (!this.arithmeticBaseUnit || this.arithmeticBaseValue === null) return;
    this.convertArithmeticResult(this.arithmeticTargetUnit);
  }

  private convertArithmeticResult(targetUnit: string, onComplete?: () => void): void {
    if (!this.arithmeticBaseUnit || this.arithmeticBaseValue === null) return;

    if (!targetUnit || targetUnit === this.arithmeticBaseUnit) {
      this.arithmeticResultValue = this.quantityService.formatResult(this.arithmeticBaseValue);
      this.arithmeticResultUnit = this.arithmeticBaseUnit;
      onComplete?.();
      return;
    }

    const convertRequest = this.buildRequest(this.arithmeticBaseValue, this.arithmeticBaseUnit, 0, targetUnit);
    this.quantityService.convert(convertRequest).subscribe({
      next: (response) => {
        const parsed = this.quantityService.parseResult(this.quantityService.getResultText(response));
        this.arithmeticResultValue = this.quantityService.formatResult(parsed.value);
        this.arithmeticResultUnit = parsed.unit || targetUnit;
        onComplete?.();
      },
      error: () => {
        this.errorMessage = 'Result unit conversion failed. Showing base result unit.';
        this.arithmeticResultValue = this.quantityService.formatResult(this.arithmeticBaseValue as number);
        this.arithmeticResultUnit = this.arithmeticBaseUnit;
        onComplete?.();
      }
    });
  }

  private buildRequest(thisValue: number, thisUnit: string, thatValue: number, thatUnit: string): QuantityRequest {
    return {
      thisQuantityDTO: {
        value: thisValue,
        unit: thisUnit,
        measurementType: TYPE_MAP[this.selectedType]
      },
      thatQuantityDTO: {
        value: thatValue,
        unit: thatUnit,
        measurementType: TYPE_MAP[this.selectedType]
      }
    };
  }

  getActionIcon(type: string): string {
    switch (type) {
      case 'conversion': return '🔄';
      case 'comparison': return '⚖️';
      case 'arithmetic': return '🧮';
      default: return '📊';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
