import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { OrderService } from '../../../core/services/order.service';
import { OrderWithId } from '../../../core/models/order.model';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrdersListComponent implements OnInit {
  displayedColumns = ['startDate','customerName','phoneNumber','location','itemsPreview','totalItems','grandTotal','status','actions'];
  rawOrders$!: Observable<OrderWithId[]>;
  nameFilter$ = new BehaviorSubject<string>('');
  phoneFilter$ = new BehaviorSubject<string>('');
  filteredOrders$!: Observable<OrderWithId[]>;
  expandedId: string | null = null;

  // Track row-level saving state
  saving: Record<string, boolean> = {};

  filterForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, private orderService: OrderService) {}

  ngOnInit(): void {
    this.rawOrders$ = this.orderService.getOrders();
    this.filterForm = this.formBuilder.group({
      name: [''],
      phone: ['']
    });

    // Wire filters
  this.filterForm.get('name')!.valueChanges.pipe(startWith('')).subscribe(v => this.nameFilter$.next((v||'').toString().trim().toLowerCase()));
  this.filterForm.get('phone')!.valueChanges.pipe(startWith('')).subscribe(v => this.phoneFilter$.next((v||'').toString().trim()));

    this.filteredOrders$ = combineLatest([this.rawOrders$, this.nameFilter$, this.phoneFilter$]).pipe(
      map(([orders, name, phone]) => {
        return orders.filter(o => {
          const nameOk = !name || o.customerName.toLowerCase().includes(name);
          const phoneOk = !phone || (o.phoneNumber || '').includes(phone);
          return nameOk && phoneOk;
        });
      })
    );
  }

  getGrandTotal(order: OrderWithId): number {
    return order.totals?.grandTotal ?? 0;
  }

  getItemsPreview(order: OrderWithId): string {
    if (!order.items || order.items.length === 0) return '—';
    return order.items.map(i => `${i.productName} (x${i.quantity})`).join(', ');
  }

  async changeStatus(order: OrderWithId, status: 'pending'|'completed'|'cancelled') {
    if (order.status === status) return;
    // Only allow transitions from pending -> completed or pending -> cancelled
    if (order.status !== 'pending' && status !== order.status) {
      return;
    }
    this.saving[order.id] = true;
    try {
      await this.orderService.updateOrderStatus(order.id, status);
      // Optimistic update for snappy UI (local mutation okay for listing)
      order.status = status;
    } finally {
      this.saving[order.id] = false;
    }
  }

  trackById = (_: number, item: OrderWithId) => item.id;
}
