export interface QuantityDTO {
  value: number;
  unit: string;
  measurementType: string;
}

export interface QuantityRequest {
  thisQuantityDTO: QuantityDTO;
  thatQuantityDTO: QuantityDTO;
}

// Backend response structure (QuantityMeasurementDTO)
export interface QuantityMeasurementResponse {
  id?: number;
  thisValue?: number;
  thisUnit?: string;
  thisMeasurementType?: string;
  thatValue?: number;
  thatUnit?: string;
  thatMeasurementType?: string;
  operationType?: string;
  result: string;  // "true", "false", or "24.0 Inch" etc.
  error?: boolean;
  errorMessage?: string;
  createdAt?: string;
}

// Aliases for clarity (all use the same backend response)
export type ConversionResponse = QuantityMeasurementResponse;
export type ComparisonResponse = QuantityMeasurementResponse;
export type ArithmeticResponse = QuantityMeasurementResponse;

export type MeasurementType = 'Length' | 'Weight' | 'Volume' | 'Temperature';
export type ActionType = 'conversion' | 'comparison' | 'arithmetic';
export type ArithmeticOperation = 'add' | 'subtract' | 'divide';

export interface HistoryItem {
  id: string;
  type: ActionType;
  measurementType: MeasurementType;
  operation?: ArithmeticOperation;
  input1: { value: number; unit: string };
  input2?: { value: number; unit: string };
  result: string;
  timestamp: Date;
}

export const UNITS: Record<MeasurementType, string[]> = {
  Length: ['INCH', 'FOOT', 'YARD', 'CENTIMETER'],
  Weight: ['GRAM', 'KILOGRAM', 'MILLIGRAM', 'POUND', 'TONNE'],
  Volume: ['LITRE', 'MILLILITRE', 'GALLON'],
  Temperature: ['CELSIUS', 'FAHRENHEIT', 'KELVIN']
};

export const TYPE_MAP: Record<MeasurementType, string> = {
  Length: 'LengthUnit',
  Weight: 'WeightUnit',
  Volume: 'VolumeUnit',
  Temperature: 'TemperatureUnit'
};
