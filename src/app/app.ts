import { Component, inject } from '@angular/core';
import { CommonModule, JsonPipe, DatePipe } from '@angular/common'; // Importamos CommonModule, JsonPipe y DatePipe
import { CryptoDataService } from './core/services/crypto-data.service';
import { CryptoData } from './core/models/crypto.model'; // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, JsonPipe, DatePipe],
  template: `
    <div class="container">
      <header class="header">
        <h1>🚀 Crypto Monitor</h1>
        <p>Precios en tiempo real (simulados)</p>
      </header>

      <section class="crypto-list">
        <h2>Todas las Criptomonedas</h2>
        <div class="cards-grid">
          <div *ngFor="let crypto of cryptoService.cryptos()" class="crypto-card">
            <div class="card-header">
              <h3>{{ crypto.name }} <span class="symbol">{{ crypto.symbol }}</span></h3>
            </div>
            <div class="card-body">
              <p class="price">{{ crypto.price | currency:'USD':'symbol':'1.2-2' }}</p>
              <div [class]="getCssClassForChange(crypto.changePercent)">
                <span class="change-icon">
                  <ng-container *ngIf="crypto.changePercent > 0">▲</ng-container>
                  <ng-container *ngIf="crypto.changePercent < 0">▼</ng-container>
                  <ng-container *ngIf="crypto.changePercent === 0">—</ng-container>
                </span>
                {{ crypto.changePercent | number:'1.2-2' }}%
              </div>
            </div>
            <div class="card-footer">
              <small>Última actualización: {{ crypto.timestamp | date:'HH:mm:ss' }}</small>
            </div>
          </div>
        </div>
      </section>

      <section *ngIf="cryptoService.topGainers().length > 0" class="top-gainers">
        <h2>📈 Top Gainers (>5% de cambio)</h2>
        <div class="gainers-list">
          <div *ngFor="let gainer of cryptoService.topGainers()" class="gainer-item">
            <span>{{ gainer.name }} ({{ gainer.symbol }})</span>
            <span class="gainer-change positive">{{ gainer.changePercent | number:'1.2-2' }}%</span>
          </div>
        </div>
      </section>
    </div>
  `,
  styleUrls: ['./app.css'] 
})
export class AppComponent {
  cryptoService = inject(CryptoDataService);

  getCssClassForChange(change: number): string {
    if (change > 0) {
      return 'change-positive';
    } else if (change < 0) {
      return 'change-negative';
    } else {
      return 'change-neutral';
    }
  }
}