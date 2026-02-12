//--------Este es un smart component ya que inyecta el servicio de cryptoDataService-------//


import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CryptoDataService } from '../../../app/core/services/crypto-data.service';
import { CryptoCardComponent } from './crypto-card.component';
import { DecimalPipe } from '@angular/common';

@Component({
selector: 'app-crypto-monitor',
standalone: true,
imports: [CryptoCardComponent, DecimalPipe],
changeDetection: ChangeDetectionStrategy.OnPush,
template: `
<div class="container">
    <header class="header">
    <div class="header-content">
        <div class="logo">
        <span class="logo-icon">₿</span>
        <span class="logo-text">CryptoWatch</span>
        </div>
        <div class="header-info">
        <span class="live-indicator">
            <span class="pulse"></span>
            LIVE
        </span>
        </div>
    </div>
    <p class="subtitle">Monitoreo de criptoactivos en tiempo real</p>
    </header>

    @if (cryptoService.topGainers().length > 0) {
    <div class="top-gainers-panel">
        <div class="panel-header">
        <h2>📈 Mejores Rendimientos</h2>
        <span class="panel-badge">+5% o más</span>
        </div>
        <div class="gainers-list">
        @for (gainer of cryptoService.topGainers(); track gainer.id) {
            <div class="gainer-item">
            <span class="gainer-symbol">{{ gainer.symbol }}</span>
            <span class="gainer-name">{{ gainer.name }}</span>
            <span class="gainer-change">+{{ gainer.changePercent | number:'1.2-2' }}%</span>
            </div>
        }
        </div>
    </div>
    }
    
    <div class="crypto-grid">
    @for (crypto of cryptoService.cryptos(); track crypto.id) {
        <app-crypto-card [crypto]="crypto" />
    }
    </div>

    <footer class="footer">
    <p>Los datos se actualizan cada 2 segundos</p>
    </footer>
</div>
`,
styleUrls: ['../styles/crypto-monitor.css']
})

//El for lo que hace es iterar sobre cada crypto en la señal cryptos del servicio cryptoService
// y renderiza un componente CryptoCardComponent para cada una, pasando la crypto actual como entrada.
// to do esto medinte el binding [crypto]="crypto" y el input en el componente hijo.     

export class CryptoMonitorComponent {
// inyectamos el servicio de cryto service
cryptoService = inject(CryptoDataService);
}