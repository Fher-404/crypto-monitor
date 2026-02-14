import { Injectable, signal, computed, inject } from '@angular/core';
import { CryptoData, CryptoStats, PriceAlert } from '../../models/crypto.model';
import { BinanceApiService } from './binance-api.service';

@Injectable({
providedIn: 'root'
})
export class CryptoDataService {

private binanceService = inject(BinanceApiService);

// Ahora los cryptos vienen de Binance
readonly cryptos = this.binanceService.getCryptos();

// Signals para stats y alertas (igual que antes)
private readonly _stats = signal<Map<string, CryptoStats>>(new Map());
readonly stats = this._stats.asReadonly();

private readonly _alerts = signal<Map<string, PriceAlert>>(new Map());
readonly alerts = this._alerts.asReadonly();

readonly topGainers = computed(() => {
return this.cryptos()
    .filter(crypto => crypto.changePercent > 5)
    .sort((a, b) => b.changePercent - a.changePercent);
});

private worker?: Worker;

constructor() {
this.initWorker();
this.startMonitoring();
}

private initWorker(): void {
if (typeof Worker !== 'undefined') {
    this.worker = new Worker(new URL('../workers/crypto-stats.worker', import.meta.url));

    this.worker.onmessage = ({ data }: { data: CryptoStats }) => {
    this._stats.update(currentStats => {
        const newStats = new Map(currentStats);
        newStats.set(data.symbol, data);
        return newStats;
    });
    };
} else {
    console.warn('Web Workers no están disponibles en este navegador');
}
}

private startMonitoring(): void {
// Monitorear cambios en los cryptos para enviar al worker y verificar alertas
setInterval(() => {
    const cryptos = this.cryptos();
    
    cryptos.forEach(crypto => {
    // Enviar al worker
    if (this.worker) {
        this.worker.postMessage({
        symbol: crypto.symbol,
        price: crypto.price
        });
    }
    
    // Verificar alertas
    this.checkAlert(crypto.symbol, crypto.price);
    });
}, 2000);
}

getStatsForCrypto(symbol: string): CryptoStats | undefined {
return this.stats().get(symbol);
}

// Métodos de alertas (igual que antes)
setAlert(symbol: string, threshold: number): void {
this._alerts.update(currentAlerts => {
    const newAlerts = new Map(currentAlerts);
    newAlerts.set(symbol, {
    symbol,
    threshold,
    isActive: false
    });
    return newAlerts;
});
}

removeAlert(symbol: string): void {
this._alerts.update(currentAlerts => {
    const newAlerts = new Map(currentAlerts);
    newAlerts.delete(symbol);
    return newAlerts;
});
}

getAlert(symbol: string): PriceAlert | undefined {
return this.alerts().get(symbol);
}

private checkAlert(symbol: string, currentPrice: number): void {
const alert = this._alerts().get(symbol);

if (alert && currentPrice >= alert.threshold) {
    this._alerts.update(currentAlerts => {
    const newAlerts = new Map(currentAlerts);
    const updatedAlert = { ...alert, isActive: true };
    newAlerts.set(symbol, updatedAlert);
    return newAlerts;
    });
}
}
}