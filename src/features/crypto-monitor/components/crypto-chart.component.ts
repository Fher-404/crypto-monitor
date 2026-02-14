  import { Component, input, ViewChild, effect, ChangeDetectorRef, inject } from '@angular/core';
  import { BaseChartDirective } from 'ng2-charts';
  import { ChartConfiguration, ChartType } from 'chart.js';

  @Component({
  selector: 'app-crypto-chart',
  standalone: true,
  imports: [BaseChartDirective],
  template: `
    <div class="chart-container">
      @if (chartReady) {
        <canvas 
          baseChart
          [type]="chartType"
          [data]="chartData"
          [options]="chartOptions">
        </canvas>
      }
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 100px;
      width: 100%;
      padding: 8px 0;
    }

    canvas {
      max-height: 100px !important;
    }
  `]
  })
  export class CryptoChartComponent {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private cdr = inject(ChangeDetectorRef);

  priceHistory = input.required<number[]>();
  changePercent = input.required<number>();

  chartReady = false;
  chartType: ChartType = 'line';

  chartData: ChartConfiguration['data'] = {
    datasets: [],
    labels: []
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0 // Sin animación para mejor performance
    },
    plugins: {
      legend: { 
        display: false 
      },
      tooltip: { 
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `$${context.parsed.y.toFixed(2)}`
        }
      }
    },
    scales: {
      x: { 
        display: false,
        grid: { display: false }
      },
      y: { 
        display: false,
        grid: { display: false },
        beginAtZero: false
      }
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 2
      },
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 4
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  constructor() {
    console.log('🎨 CryptoChartComponent created');
    
    // Effect para actualizar cuando cambian los datos
    effect(() => {
      const history = this.priceHistory();
      const change = this.changePercent();
      
      console.log('📊 Chart data changed:', {
        historyLength: history?.length || 0,
        change: change,
        firstPrice: history?.[0],
        lastPrice: history?.[history.length - 1]
      });
      
      if (history && history.length > 1) {
        this.updateChartData(history, change);
      }
    });
  }

  private updateChartData(prices: number[], changePercent: number): void {
    console.log('🔄 Updating chart with', prices.length, 'prices');
    
    // Determinar color
    const isPositive = changePercent >= 0;
    const borderColor = isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
    const backgroundColor = isPositive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)';

    // Actualizar datos del gráfico
    this.chartData = {
      datasets: [
        {
          data: prices,
          borderColor: borderColor,
          backgroundColor: backgroundColor,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: borderColor,
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2
        }
      ],
      labels: prices.map((_, i) => '')
    };

    this.chartReady = true;
    
    // Forzar detección de cambios
    this.cdr.markForCheck();
    
    // Actualizar el gráfico si ya existe
    setTimeout(() => {
      if (this.chart) {
        this.chart.chart?.update('none'); // 'none' = sin animación
        console.log('✅ Chart updated successfully');
      }
    }, 0);
  }
  }