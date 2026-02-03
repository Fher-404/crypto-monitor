//--------Este es un smart component ya que inyecta el servicio de cryptoDataService-------//


import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CryptoDataService } from '../../../app/core/services/crypto-data.service';
import { CryptoCardComponent } from './crypto-card.component';

@Component({
selector: 'app-crypto-monitor',
standalone: true,
imports: [CryptoCardComponent],
changeDetection: ChangeDetectionStrategy.OnPush,
template: `
    <div class="container">
    <h1>💰 Crypto Monitor - Real Time</h1>
    
    <div class="crypto-grid">
        @for (crypto of cryptoService.cryptos(); track crypto.id) {
        <app-crypto-card [crypto]="crypto" />
        }
    </div>
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