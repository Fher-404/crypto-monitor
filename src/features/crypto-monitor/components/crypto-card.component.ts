///-----------------Este es un Presentational component que muestra la tarjeta de cada crypto------------------///


import { Component, input, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core'; // ChangedetectionStrategy detecta cambios en el componente
import { CryptoData } from '../../../app/models/crypto.model';
import { DecimalPipe } from '@angular/common';
import { CryptoDataService } from '../../../app/core/services/crypto-data.service';
import { HighlightChangeDirective } from '../../../app/shared/directive/highlight-change.directive';
import { FormsModule } from '@angular/forms';

@Component({
selector: 'app-crypto-card',
standalone: true,
imports: [DecimalPipe, HighlightChangeDirective, FormsModule], // Importamos la directiva para usarla en el template
changeDetection: ChangeDetectionStrategy.OnPush,
//Detecta solo cuando hay cambios en las entradas @Input hay eventos como clicks o outputs o cuando cambia un signal
template: `
<div class="card" 
        [appHighlightChange]="crypto().price"
        [class.alert-active]="isAlertActive()">
    
    <div class="card-header">
        <div class="crypto-info">
        <div class="crypto-icon">{{ getCryptoIcon(crypto().symbol) }}</div>
        <div class="crypto-details">
            <h3 class="symbol">{{ crypto().symbol }}</h3>
            <span class="name">{{ crypto().name }}</span>
        </div>
        </div>
        @if (isAlertActive()) {
        <div class="alert-badge">
            <span class="alert-icon">🔔</span>
        </div>
        }
    </div>
    
    <div class="price-section">
        <div class="price">\${{ crypto().price | number:'1.2-2' }}</div>
        <div class="change-badge" 
            [class.positive]="crypto().changePercent > 0" 
            [class.negative]="crypto().changePercent < 0">
        <span class="change-arrow">{{ crypto().changePercent > 0 ? '▲' : '▼' }}</span>
        <span>{{ crypto().changePercent | number:'1.2-2' }}%</span>
        </div>
    </div>

    @if (currentStats()) {
        <div class="stats-grid">
        <div class="stat-card">
            <span class="stat-label">Promedio Móvil</span>
            <span class="stat-value">\${{ currentStats()!.movingAverage | number:'1.2-2' }}</span>
        </div>
        <div class="stat-card">
            <span class="stat-label">Volatilidad</span>
            <span class="stat-value">\${{ currentStats()!.volatility | number:'1.2-2' }}</span>
        </div>
        </div>
    }

    <div class="alert-section">
        <label class="alert-label">
        <span class="label-icon">⚠️</span>
        Alerta de Precio
        </label>
        <div class="alert-controls">
        <div class="input-wrapper">
            <span class="input-prefix">\$</span>
            <input 
            type="number" 
            class="alert-input"
            [(ngModel)]="alertThreshold"
            (blur)="updateAlert()"
            placeholder="Ej: 46000"
            />
        </div>
        <button 
            class="alert-button"
            (click)="removeAlertClick()"
            [disabled]="!currentAlert()"
            title="Eliminar alerta">
            <span class="button-icon">🗑️</span>
        </button>
        </div>
        @if (isAlertActive()) {
        <div class="alert-message">
            <span class="message-icon">🚨</span>
            <span>¡Precio superó \${{ currentAlert()!.threshold | number:'1.0-0' }}!</span>
        </div>
        }
    </div>
    </div>
`,

// number:'1.2-2' formatea el número con al menos 1 dígito entero y entre 2 y 2 decimales

styleUrls: ['../styles/crypto-card.css']
})
export class CryptoCardComponent {
crypto = input.required<CryptoData>();
private cryptoService = inject(CryptoDataService);

// 👇 NUEVO: Computed signal para las stats de ESTA cripto
currentStats = computed(() => {
    return this.cryptoService.getCryptoStats(this.crypto().symbol);
});

    alertThreshold = signal<number | null>(null);

    currentAlert = computed(() => {
    return this.cryptoService.getAlert(this.crypto().symbol);
    });

    isAlertActive = computed(() => {
    const alert = this.currentAlert();
    return alert?.isActive ?? false;
    });

    updateAlert(): void {
    const threshold = this.alertThreshold();
    if (threshold && threshold > 0) {
        this.cryptoService.setAlert(this.crypto().symbol, threshold);
    }
    }

    removeAlertClick(): void {
    this.cryptoService.removeAlert(this.crypto().symbol);
    this.alertThreshold.set(null);
    }


// Método para obtener el icono de cada cripto
getCryptoIcon(symbol: string): string {
    const icons: { [key: string]: string } = {
        'BTC': '₿',
        'ETH': 'Ξ',
        'BNB': '🔶',
        'ADA': '🔷',
        'SOL': '◎'
    };
    return icons[symbol] || '●';
}
}