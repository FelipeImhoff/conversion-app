export interface ConversionRate {
  status: number;
  count: number;
  percentage: string;
}

export interface ConversionData {
  origin: string;
  total: number;
  conversionRates: ConversionRate[];
}