/// <reference lib="webworker" />

const priceHistory: { [symbol: string]: number[] } = {};
const MAX_HISTORY = 20;

addEventListener('message', ({ data }) => {
  const { symbol, price } = data;
  
  if (!priceHistory[symbol]) {
    priceHistory[symbol] = [];
  }
  
  priceHistory[symbol].push(price);
  
  if (priceHistory[symbol].length > MAX_HISTORY) {
    priceHistory[symbol].shift();
  }
  
  if (priceHistory[symbol].length >= 5) {
    const stats = calculateStats(symbol, priceHistory[symbol]);
    postMessage(stats);
  }
});

function calculateStats(symbol: string, prices: number[]) {
  const sum = prices.reduce((acc, price) => acc + price, 0);
  const movingAverage = sum / prices.length;
  
  const squaredDiffs = prices.map(price => Math.pow(price - movingAverage, 2));
  const variance = squaredDiffs.reduce((acc, diff) => acc + diff, 0) / prices.length;
  const volatility = Math.sqrt(variance);
  
  return {
    symbol,
    movingAverage: Number(movingAverage.toFixed(2)),
    volatility: Number(volatility.toFixed(2))
  };
}