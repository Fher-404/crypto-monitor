import { Injectable, signal, computed } from '@angular/core'; //injectable permite inyectar el servicio en otros componentes
// signal = para crear los signals del sistema
//computed = para crear propiedades derivadas basadas en signals

import { interval } from 'rxjs';
// interval = para crear un observable que emite valores en intervalos regulares

import { CryptoData } from '../../models/crypto.model';
// importa la interfaz CryptoData para tipar los datos de las criptomonedas

import { CryptoStats } from '../../models/crypto.model';

import { PriceAlert } from '../../models/crypto.model';




//Le decimos que esta clase es un servicio inyectable a nivel raíz
    @Injectable({
    providedIn: 'root' // esto significa que el servicio es un singleton y está disponible en toda la aplicación
    })



    export class CryptoDataService {
    
        //private significa que solo se puede acceder dentro de esta clase (encapsulación)
        //readonly significa que no se puede reasignar la variable, pero su contenido puede cambiar si es un objeto mutable
        // el guion bajo _ es una convención para indicar que es una propiedad privada
        private readonly _cryptos = signal<CryptoData[]>([
        { id: 'BTC', name: 'Bitcoin', symbol: 'BTC', price: 45000, changePercent: 0, timestamp: Date.now() },
        { id: 'ETH', name: 'Ethereum', symbol: 'ETH', price: 3000, changePercent: 0, timestamp: Date.now() },
        { id: 'BNB', name: 'Binance Coin', symbol: 'BNB', price: 400, changePercent: 0, timestamp: Date.now() },
        { id: 'ADA', name: 'Cardano', symbol: 'ADA', price: 1.5, changePercent: 0, timestamp: Date.now() },
        { id: 'SOL', name: 'Solana', symbol: 'SOL', price: 100, changePercent: 0, timestamp: Date.now() }
    ]);

    // Aqui estamos creando una señal pública de solo lectura
    // Otros componentes pueden LEER pero NO modificar directamente
    // Es basicamente una "copia segura" de _cryptos
    readonly cryptos = this._cryptos.asReadonly();

// Signal para estadisticas de cada crypto calculadas en el Worker
    private readonly _stats = signal<Map<string, CryptoStats>>(new Map());

    readonly stats = this._stats.asReadonly();

// signal para alertas
private readonly _alerts = signal<Map<string, PriceAlert>>(new Map());
readonly alerts = this._alerts.asReadonly();


    // Aquí definimos una propiedad computada (computed)
    // Aqui seleccionamos filtramos las 5 criptomonedas con mayor ganancia (>5%)
    // y las ordenamos de mayor a menor
    readonly topGainers = computed(() => {
        return this._cryptos()
        .filter(crypto => crypto.changePercent > 5)
        .sort((a, b) => b.changePercent - a.changePercent);
    });



    // web worker
    private worker?: Worker;
    private initWorker(): void {
        if (typeof Worker !== 'undefined') {
            this.worker = new Worker(new URL('../crypto-stats.worker', import.meta.url), 
            { type: 'module' });


        this.worker.onmessage = ({ data }: {data: CryptoStats}) => {
            this._stats.update(currentStats => {
                const newStats = new Map(currentStats);
                newStats.set(data.symbol, data);
                return newStats;
            });
        };
        }else {
            console.warn('Web Workers are not supported in this environment.');
        }
    }

    private updatePrices(): void {
        //Esta primera funcion lo que hace es buscar todas las cryptos y establacer una variable
        // de precio viejo que sera usada para calcular el nuevo precio
        // esa variable de oldprice sera igual al precio que tenga la crypto en ese momento
        this._cryptos.update(currentCryptos => {
            return currentCryptos.map(crypto => {
                const oldPrice = crypto.price;

                


            // generamos el cambio porcentual aleatorio entre -3% y +3%
            // y se lo multiplicamos al precio viejo para obtener el nuevo precio
            const changePercent = (Math.random() - 0.5) * 6;
            const newPrice = oldPrice * (1 + changePercent / 100);
            
            if (this.worker) {
                this.worker.postMessage({
                    symbol: crypto.symbol,
                    price: newPrice
                });
            }
            
            // Aquí podríamos agregar la lógica para verificar si el nuevo precio supera algún umbral de alerta
            this.checkAlert(crypto.symbol, newPrice);

            //
            return {
                // con un operador spread (...) copiamos todas las propiedades nuevas de la crypto
                //price, changePercent y timestamp son actualizadas con los nuevos valores
            ...crypto,
            price: Number(newPrice.toFixed(2)),
            changePercent: Number(changePercent.toFixed(2)),
            timestamp: Date.now()
            };
        });
        });
    }


    //--------------------- Lógica para alertas de precio ---------------------//
    // Crear o actualizar una alerta para una criptomoneda específica con un umbral de precio
    setAlert(symbol:string, threshold: number): void {
        this._alerts.update(currentAlerts => {
            const newAlerts = new Map(currentAlerts);
            newAlerts.set(symbol, {
                symbol,
                threshold,
                isActive: true
            });
            return newAlerts;
        });
    }


    
    getCryptoStats(symbol: string): CryptoStats | undefined {
        return this.stats().get(symbol);
    }
    
    // Eliminar una alerta para una criptomoneda específica
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

    // Verificar si el precio actual de una criptomoneda supera el umbral de alerta y desactivar la alerta si se cumple la condición
    private checkAlert(symbol: string, price: number): void {
        const alert = this._alerts().get(symbol);


        if (alert && price >= alert.threshold) {
            this._alerts.update(currentAlerts => {
            const newAlerts = new Map(currentAlerts);
            const updateAlert = { ...alert, isActive: false };
            newAlerts.set(symbol, updateAlert);
            return newAlerts;
        });
    }
}



    // Inicia la aplicacion del servicio
    constructor() {
        this.startPriceSimulation();
        this.initWorker();
    }
    
    //Simulacion de actualizaciones de precio cada 200ms
    private startPriceSimulation(): void {
        interval(2000).subscribe(() => {
        this.updatePrices();
        });
    }

    }
