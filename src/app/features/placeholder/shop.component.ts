import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="pad"><h1>Shop</h1><p>User area placeholder.</p></div>`,
  styles: [`.pad{padding:24px}`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShopComponent {}
