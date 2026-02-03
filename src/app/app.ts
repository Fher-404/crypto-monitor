//---------------Este es el app component que importa el smart component crypto-monitor es decir la vista principal ya lista para el usuario final------------------//

import { Component } from '@angular/core';
import { CryptoMonitorComponent } from '../features/crypto-monitor/components/crypto-monitor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CryptoMonitorComponent],  // Importa el SMART component
  template: `
    <app-crypto-monitor />
  `
})
export class AppComponent {}