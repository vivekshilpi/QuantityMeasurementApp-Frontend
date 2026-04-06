import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { QuantityRequest, QuantityMeasurementResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class QuantityService {
  private readonly API_URL = `${environment.apiUrl}/api/v1/quantities`;

  constructor(private http: HttpClient) {}

  convert(request: QuantityRequest): Observable<QuantityMeasurementResponse> {
    return this.http.post<QuantityMeasurementResponse>(`${this.API_URL}/convert`, request);
  }

  compare(request: QuantityRequest): Observable<QuantityMeasurementResponse> {
    return this.http.post<QuantityMeasurementResponse>(`${this.API_URL}/compare`, request);
  }

  add(request: QuantityRequest): Observable<QuantityMeasurementResponse> {
    return this.http.post<QuantityMeasurementResponse>(`${this.API_URL}/add`, request);
  }

  subtract(request: QuantityRequest): Observable<QuantityMeasurementResponse> {
    return this.http.post<QuantityMeasurementResponse>(`${this.API_URL}/subtract`, request);
  }

  divide(request: QuantityRequest): Observable<QuantityMeasurementResponse> {
    return this.http.post<QuantityMeasurementResponse>(`${this.API_URL}/divide`, request);
  }

  // Extracts result text from backend response with fallbacks for differing DTO shapes.
  getResultText(response: QuantityMeasurementResponse | null | undefined): string {
    if (!response) return '';

    const rawResult = (response as any).result;
    if (typeof rawResult === 'string' || typeof rawResult === 'number' || typeof rawResult === 'boolean') {
      return String(rawResult).trim();
    }

    const value = this.pickFirstNumber([
      (response as any).thatValue,
      (response as any).thisValue,
      (response as any).value,
      (response as any).resultValue
    ]);

    const unit = this.pickFirstString([
      (response as any).thatUnit,
      (response as any).thisUnit,
      (response as any).unit,
      (response as any).resultUnit
    ]);

    if (value !== null && unit) return `${value} ${unit}`;
    if (value !== null) return `${value}`;
    return '';
  }

  parseResult(result: unknown): { value: number; unit: string } {
    if (result === null || result === undefined) {
      return { value: 0, unit: '' };
    }

    if (typeof result === 'number') {
      return { value: result, unit: '' };
    }

    const text = String(result).trim();
    if (!text) {
      return { value: 0, unit: '' };
    }

    const parts = text.split(/\s+/);
    const value = parseFloat(parts[0]);
    const unit = parts.slice(1).join(' ') || '';
    return { value: isNaN(value) ? 0 : value, unit };
  }

  isEqual(result: unknown): boolean {
    if (typeof result === 'boolean') return result;
    if (typeof result === 'number') return result === 1;
    return String(result).trim().toLowerCase() === 'true';
  }

  formatResult(value: number): string {
    const rounded = parseFloat(value.toFixed(4));
    return rounded.toString();
  }

  private pickFirstString(values: unknown[]): string {
    for (const value of values) {
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
    return '';
  }

  private pickFirstNumber(values: unknown[]): number | null {
    for (const value of values) {
      if (typeof value === 'number' && !isNaN(value)) {
        return value;
      }
      if (typeof value === 'string' && value.trim()) {
        const parsed = parseFloat(value);
        if (!isNaN(parsed)) {
          return parsed;
        }
      }
    }
    return null;
  }
}
