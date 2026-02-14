

// Este es el "molde" de cómo se ve una criptomoneda
export interface CryptoData {
  id: string;           // Identificador único: 'BTC', 'ETH', etc.
  name: string;         // Nombre completo: 'Bitcoin'
  symbol: string;       // Símbolo: 'BTC'
  price: number;        // Precio actual en USD
  changePercent: number; // Cambio porcentual (ej: 5.2 = +5.2%)
  timestamp: number;    // Momento de la actualización
  priceHistory?: number[]; // Historial de precios para cálculos estadísticos
highPrice24?: number; // Precio más alto en las últimas 24 horas
lowPrice24?: number;  // Precio más bajo en las últimas 24 horas
volumen24h?: number;    // Volumen de transacciones en las últimas 24 horas 

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

export interface PriceAlert {
  symbol: string;
  threshold: number; // Umbral para la alerta
  isActive: boolean; // Si la alerta está activa o no
}


export interface BinanceTickerResponse {
    symbol: string;       // Símbolo de la criptomoneda (ej: 'BTCUSDT')
    priceChange: string; // Cambio de precio en el período
    priceChangePercent: string; // Cambio porcentual en el período
    lastPrice: string;    // Precio actual
    highPrice: string;   // Precio más alto en las últimas 24 horas
    lowPrice: string;    // Precio más bajo en las últimas 24 horas
    volume: string;      // Volumen de transacciones en las últimas 24 horas
}

export interface BinanceKlineResponse {
  [index: number]: string | number; // Cada índice representa un dato específico del kline
}