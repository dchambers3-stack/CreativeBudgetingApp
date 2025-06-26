import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HowToBudgetComponent } from './how-to-budget.component';

describe('HowToBudgetComponent', () => {
  let component: HowToBudgetComponent;
  let fixture: ComponentFixture<HowToBudgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HowToBudgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HowToBudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
