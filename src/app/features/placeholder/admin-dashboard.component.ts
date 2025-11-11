import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="pad"><h1>Admin Dashboard</h1><p>Superadmin area placeholder.</p></div>`,
  styles: [`.pad{padding:24px}`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent {}
