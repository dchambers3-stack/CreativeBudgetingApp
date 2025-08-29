import { Component } from '@angular/core';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-how-to-budget',
  imports: [TranslatePipe],
  templateUrl: './how-to-budget.component.html',
  styleUrl: './how-to-budget.component.css',
})
export class HowToBudgetComponent {}
