/// <reference lib="webworker" />
// Este es el código que se ejecuta en el Web Worker

// Historial de precios (mantiene los últimos 20 precios de cada cripto)
const priceHistory: { [symbol: string]: number[] } = {};
const MAX_HISTORY = 20;

// Escucha mensajes del thread principal
addEventListener('message', ({ data }) => {
  const { symbol, price } = data;
  
  // Inicializa el historial si no existe
  if (!priceHistory[symbol]) {
    priceHistory[symbol] = [];
  }
  
  // Agrega el nuevo precio
  priceHistory[symbol].push(price);
  
  // Mantiene solo los últimos 20 precios
  if (priceHistory[symbol].length > MAX_HISTORY) {
    priceHistory[symbol].shift(); // Elimina el primero (el más viejo)
  }
  
  // Calcula estadísticas solo si hay suficiente historial
  if (priceHistory[symbol].length >= 5) {
    const stats = calculateStats(symbol, priceHistory[symbol]);
    
    // Envía el resultado de vuelta al thread principal
    postMessage(stats);
  }
});

// Función para calcular promedio móvil y volatilidad
function calculateStats(symbol: string, prices: number[]) {
  // 1. Calcular promedio móvil (media aritmética)
  // Reduce suma todos los precios.
  // acc es el acumulador que guarda la suma parcial, price es el precio actual del array.
  const sum = prices.reduce((acc, price) => acc + price, 0);
  const movingAverage = sum / prices.length;
  
  // 2. Calcular volatilidad (desviación estándar)
  // creamos un nuevo array squaredDiffs donde cada elemento es el cuadrado de la diferencia entre el precio y el promedio móvil.
  // esto con la finalidad de eliminar los valores negativos y obtener una medida de dispersión.
  // ejemplo: si el precio es 100 y el promedio móvil es 90, la diferencia es 10, y el cuadrado de esa diferencia es 100. Si el precio es 80, la diferencia es -10, pero el cuadrado de esa diferencia también es 100. Esto nos permite medir la volatilidad sin importar si los precios están por encima o por debajo del promedio móvil.
  const squaredDiffs = prices.map(price => Math.pow(price - movingAverage, 2));

  // Aca sumamos todas las diferencias al cuadrado y luego dividimos por la cantidad de precios para obtener la varianza.
  // La varianza es una medida de cuánto varían los precios respecto al promedio móvil. Una varianza alta indica que los precios fluctúan mucho, mientras que una varianza baja indica que los precios son más estables.
  // ejemplo: si tenemos precios [100, 110, 90] y un promedio móvil de 100, las diferencias al cuadrado serían [0, 100, 100]. La suma de estas diferencias es 200. Si dividimos por la cantidad de precios (3), obtenemos una varianza de aproximadamente 66.67. Esto indica que los precios tienen una cierta volatilidad respecto al promedio móvil.
  const variance = squaredDiffs.reduce((acc, diff) => acc + diff, 0) / prices.length;

 // La volatilidad se calcula como la raíz cuadrada de la varianza. Esto nos da una medida de dispersión que está en las mismas unidades que los precios originales, lo que facilita su interpretación.
  const volatility = Math.sqrt(variance);
  
  return {
    symbol,
    movingAverage: Number(movingAverage.toFixed(2)),
    volatility: Number(volatility.toFixed(2))
  };
}