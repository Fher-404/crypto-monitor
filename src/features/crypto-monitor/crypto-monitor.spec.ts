import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CryptoMonitor } from './crypto-monitor';

describe('CryptoMonitor', () => {
  let component: CryptoMonitor;
  let fixture: ComponentFixture<CryptoMonitor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CryptoMonitor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CryptoMonitor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
