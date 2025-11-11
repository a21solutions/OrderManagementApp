import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '../../../core/models/product.model';
import { Order, OrderItem } from '../../../core/models/order.model';
import { FirebaseService } from '../../../core/services/firebase.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    TranslateModule
  ],
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderSummaryComponent implements OnInit {
  order: Order | null = null;
  isSubmitting = false;
  currentLanguage = 'en';

  constructor(
    private router: Router,
    private firebaseService: FirebaseService,
    private notificationService: NotificationService,
    public languageService: LanguageService
  ) {
    this.currentLanguage = this.languageService.getCurrentLanguage();
  }

  ngOnInit(): void {
    this.loadOrderData();
  }

  loadOrderData(): void {
    const orderData = sessionStorage.getItem('currentOrder');

    if (!orderData) {
      this.notificationService.showError('Order data not found');
      this.router.navigate(['/products']);
      return;
    }

    this.order = JSON.parse(orderData);
    
    console.log('=== ORDER LOADED IN SUMMARY ===');
    console.log('Order Object:', this.order);
    console.log('===============================');
  }

  getTotalItems(): number {
    if (!this.order) return 0;
    return this.order.totalItems;
  }

  getProductName(item: OrderItem): string {
    return this.languageService.getCurrentLanguage() === 'en' ? item.productName : (item.productDesc || item.productName);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString(this.currentLanguage === 'en' ? 'en-US' : 'mr-IN');
  }

  calculateDays(): number {
    if (!this.order) return 0;
    return this.order.days;
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  async submitOrder(): Promise<void> {
    if (!this.order) {
      this.notificationService.showError('Invalid order data');
      return;
    }

    this.isSubmitting = true;

    try {
      console.log('=== SUBMITTING ORDER TO FIRESTORE ===');
      console.log('Order Object:', this.order);
      console.log('=====================================');

      // Submit the order object directly to Firestore
      await this.firebaseService.createOrder(this.order);
      
      this.notificationService.showSuccess('Order submitted successfully!');
      
      // Clear session storage
      sessionStorage.removeItem('currentOrder');
      
      // Navigate to products page
      setTimeout(() => {
        this.router.navigate(['/products']);
      }, 2000);

    } catch (error) {
      console.error('Error submitting order:', error);
      this.notificationService.showError('Failed to submit order. Please try again.');
    } finally {
      this.isSubmitting = false;
    }
  }
}
