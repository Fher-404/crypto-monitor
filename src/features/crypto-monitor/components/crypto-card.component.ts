///-----------------Este es un Presentational component que muestra la tarjeta de cada crypto------------------///


import { Component, input, ChangeDetectionStrategy } from '@angular/core'; // ChangedetectionStrategy detecta cambios en el componente
import { CryptoData } from '../../../app/models/crypto.model';
import { DecimalPipe } from '@angular/common';

@Component({
selector: 'app-crypto-card',
standalone: true,
imports: [DecimalPipe],
changeDetection: ChangeDetectionStrategy.OnPush,
//Detecta solo cuando hay cambios en las entradas @Input hay eventos como clicks o outputs o cuando cambia un signal
template: `
    <div class="card">
    <div class="card-header">
        <h3>{{ crypto().symbol }}</h3>
        <span class="name">{{ crypto().name }}</span>
    </div>
    
    <div class="price">
        {{ crypto().price | number:'1.2-2' }} 
    </div>
    
    <div class="change" [class.positive]="crypto().changePercent > 0" 
                        [class.negative]="crypto().changePercent < 0">
        {{ crypto().changePercent > 0 ? '+' : '' }}{{ crypto().changePercent | number:'1.2-2' }}%
    </div>
    </div>
`,

// number:'1.2-2' formatea el número con al menos 1 dígito entero y entre 2 y 2 decimales


styleUrls: ['../styles/crypto-card.css']
})
export class CryptoCardComponent {
crypto = input.required<CryptoData>();
}