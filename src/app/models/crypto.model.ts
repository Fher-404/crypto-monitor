

// Este es el "molde" de cómo se ve una criptomoneda
export interface CryptoData {
  id: string;           // Identificador único: 'BTC', 'ETH', etc.
  name: string;         // Nombre completo: 'Bitcoin'
  symbol: string;       // Símbolo: 'BTC'
  price: number;        // Precio actual en USD
  changePercent: number; // Cambio porcentual (ej: 5.2 = +5.2%)
  timestamp: number;    // Momento de la actualización
}

// Para los cálculos estadísticos que haremos en el Worker
export interface CryptoStats {
    symbol: string;
    movingAverage: number;   // Promedio móvil de precios
    volatility: number;      // Qué tan volátil es el precio
}

export interface PriceHistory {
  [symbol: string]: number[]; // Historial de precios para cada criptomoneda
}