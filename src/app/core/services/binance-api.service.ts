import { Injectable, signal } from '@angular/core';
import { interval } from 'rxjs';
import { CryptoData, BinanceTickerResponse } from '../../models/crypto.model';

// Creamos el injectable para el servicio que se encargará de comunicarse con la API de Binance
@Injectable({
providedIn: 'root' // Crear una sola instancia global del servicio para toda la aplicación //singlenton
})


export class BinanceApiService {

// Mapeo de nuestros símbolos a los de Binance ya que bonance trabaja con pares de trading (ej: BTCUSDT)
//Ejemplo BTC -> BTCUSDT, ETH -> ETHUSDT, etc.
private readonly symbolMap: { [key: string]: string } = {
'BTC': 'BTCUSDT',
'ETH': 'ETHUSDT',
'BNB': 'BNBUSDT',
'ADA': 'ADAUSDT',
'SOL': 'SOLUSDT'
};


//Creamos el signal que tiene un array de CryptoData, que es el formato que usamos en nuestra aplicación. Este signal se actualizará con los datos obtenidos de Binance.
//Por supuesto la hacemos privada para que solo se pueda modificar desde este servicio, y luego exponemos una versión de solo lectura para que los componentes puedan suscribirse a los cambios.
private readonly cryptos = signal<CryptoData[]>([]);



//Creamos un signal de solo lectura para que los componentes puedan suscribirse a los cambios en las criptomonedas sin poder modificarlas directamente.
readonly cryptos$ = this.cryptos.asReadonly();


//Al usar el singlenton el constructor se ejecutará una sola vez, por lo que es un buen lugar para inicializar la obtención de datos y configurar el intervalo de actualización.
//y el segundo método se encarga de iniciar el proceso de actualización periódica cada 2 segundos.
constructor() {
this.initializeCryptos();
this.startFetchingPrices();
}




private initializeCryptos(): void {
// Inicializar con datos básicos
const initialCryptos: CryptoData[] = [
    { id: 'BTC', name: 'Bitcoin', symbol: 'BTC', price: 0, changePercent: 0, timestamp: Date.now(), priceHistory: [] },
    { id: 'ETH', name: 'Ethereum', symbol: 'ETH', price: 0, changePercent: 0, timestamp: Date.now(), priceHistory: [] },
    { id: 'BNB', name: 'Binance Coin', symbol: 'BNB', price: 0, changePercent: 0, timestamp: Date.now(), priceHistory: [] },
    { id: 'ADA', name: 'Cardano', symbol: 'ADA', price: 0, changePercent: 0, timestamp: Date.now(), priceHistory: [] },
    { id: 'SOL', name: 'Solana', symbol: 'SOL', price: 0, changePercent: 0, timestamp: Date.now(), priceHistory: [] }
];

this.cryptos.set(initialCryptos);

// Cargar datos iniciales inmediatamente
this.fetchAllPrices();
this.fetchHistoricalData();
}

//Suscribe es un observable de RxJS que emite un valor cada X milisegundos
//En este caso, cada 2000 milisegundos (2 segundos) se ejecutará la función que obtiene los precios actualizados de Binance.
private startFetchingPrices(): void {
// Actualizar cada 2 segundos
interval(2000).subscribe(() => {
    this.fetchAllPrices();
});
}




//--------------------- Métodos para interactuar con la API de Binance --------------------
private async fetchAllPrices(): Promise<void> {
try {
    const symbols = Object.values(this.symbolMap); // Obtenemos los símbolos de Binance (ej: ['BTCUSDT', 'ETHUSDT', ...])
    const symbolsParam = JSON.stringify(symbols); // Los convertimos en JSON Para pasar datos en la URL de la API de Binance, que espera un array de símbolos en formato JSON.
    

    // API de Binance para obtener precios de múltiples símbolos
    const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${symbolsParam}`;
    
    const response = await fetch(url); // HAcemos la petición a la API de Binance
    const data: BinanceTickerResponse[] = await response.json(); // La respuesta es un array de objetos con la información de cada símbolo solicitado por lo que lo parseamos a nuestro formato BinanceTickerResponse
    
    this.updateCryptosWithBinanceData(data);
} catch (error) {
    console.error('Error fetching Binance prices:', error);
    // En caso de error, mantener los datos actuales
}
}




// La funcion update busca los datos de Binance para cada cripto en nuestro signal cryptos, y actualiza el precio, el cambio porcentual, el precio más alto y más bajo en las últimas 24 horas, el volumen, y también mantiene un historial de precios para cada cripto (limitado a los últimos 20 precios) para luego usarlo en los gráficos.
// Si no songigue encontrar los datos de Binance para una cripto, simplemente devuelve la cripto sin modificar.
private updateCryptosWithBinanceData(data: BinanceTickerResponse[]): void {
this.cryptos.update(currentCryptos => {
    return currentCryptos.map(crypto => {
    const binanceSymbol = this.symbolMap[crypto.symbol];
    const binanceData = data.find(d => d.symbol === binanceSymbol);
    
    if (!binanceData) return crypto;
    
    // Convertimos datos a numeros y actualizamos el historial de precios
    const newPrice = parseFloat(binanceData.lastPrice);
    
    // Actualizar historial de precios (mantener últimos 20)
    const updatedHistory = [...(crypto.priceHistory || []), newPrice];
    if (updatedHistory.length > 20) {
        updatedHistory.shift(); // Eliminar el más antiguo
    }
    
    return {
        ...crypto,
        price: newPrice,
        changePercent: parseFloat(binanceData.priceChangePercent),
        highPrice24h: parseFloat(binanceData.highPrice),
        lowPrice24h: parseFloat(binanceData.lowPrice),
        volume24h: parseFloat(binanceData.volume),
        priceHistory: updatedHistory,
        timestamp: Date.now()
    };
    });
});
}


private async fetchHistoricalData(): Promise<void> {
try {
    // Obtener datos históricos de las últimas horas para inicializar los gráficos
    const promises = Object.entries(this.symbolMap).map(async ([symbol, binanceSymbol]) => {
    const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=1m&limit=20`;
    const response = await fetch(url);
    const data = await response.json();
    
    // data es un array de arrays: [[time, open, high, low, close, volume, ...], ...]
    // Extraemos solo los precios de cierre (índice 4)
    const prices = data.map((kline: any) => parseFloat(kline[4]));
    
    return { symbol, prices };
    });
    
    const results = await Promise.all(promises);
    
    // Actualizar el historial inicial
    this.cryptos.update(currentCryptos => {
    return currentCryptos.map(crypto => {
        const result = results.find(r => r.symbol === crypto.symbol);
        if (result) {
        return {
            ...crypto,
            priceHistory: result.prices
        };
        }
        return crypto;
    });
    });
    
} catch (error) {
    console.error('Error fetching historical data:', error);
}
}

// Método público para obtener las criptos
getCryptos() {
return this.cryptos$;
}
}