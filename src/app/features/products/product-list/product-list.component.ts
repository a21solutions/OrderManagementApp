import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { Product } from '../../../core/models/product.model';
import { Order, OrderItem } from '../../../core/models/order.model';
import { FirebaseService } from '../../../core/services/firebase.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LanguageService } from '../../../core/services/language.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    TranslateModule,
    LoaderComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit {
  products$!: Observable<Product[]>;
  products: Product[] = [];
  orderForm!: FormGroup;
  minDate = new Date();
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private notificationService: NotificationService,
    public languageService: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadProducts();
  }

  initializeForm(): void {
    this.orderForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      location: ['', [Validators.required, Validators.minLength(10)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    }, {
      validators: this.dateRangeValidator
    });
  }

  dateRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const startDate = group.get('startDate')?.value;
    const endDate = group.get('endDate')?.value;

    if (startDate && endDate && endDate <= startDate) {
      return { dateRangeInvalid: true };
    }

    return null;
  }

  loadProducts(): void {
    // Subscribe once and populate local products array used across template and calculations
    this.products$ = this.firebaseService.getProducts();
    this.products$.subscribe({
      next: (products) => {
        this.products = products.map(p => ({ ...p, quantity: 0 }));
        // Products loaded
        // Optional: restore draft from storage if needed
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.notificationService.showError('Failed to load products');
      }
    });
  }

  onQuantityChange(product: Product, value: string): void {
    const quantity = Math.max(0, parseInt(value) || 0);
    // Immutable update ensures OnPush change detection reliably picks up modifications
    this.products = this.products.map(p => p.id === product.id ? { ...p, quantity } : p);
    this.cdr.markForCheck();
  }

  getSelectedProducts(): Product[] {
    // Only keep products with quantity > 0
    return this.products.filter(p => (p.quantity || 0) > 0);
  }

  getProductName(product: Product): string {
    return this.languageService.getCurrentLanguage() === 'en' ? product.name : product.nameMr;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.orderForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'ORDER_FORM.REQUIRED';
    }

    if (fieldName === 'phoneNumber' && field?.hasError('pattern')) {
      return 'ORDER_FORM.MOBILE_INVALID';
    }

    if ((fieldName === 'customerName' || fieldName === 'location') && field?.hasError('minlength')) {
      return 'ORDER_FORM.REQUIRED';
    }

    return '';
  }

  async proceedToReview(): Promise<void> {
    // Validate form
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      this.notificationService.showError('Please fill in all required fields correctly');
      return;
    }

    if (this.orderForm.hasError('dateRangeInvalid')) {
      this.notificationService.showError('End date must be after start date');
      return;
    }

    // Get form values
    const formValue = this.orderForm.value;
    
    // Get selected products (products with quantity > 0)
    // Products are optional: allow submitting even if none selected
    const selectedProducts = this.getSelectedProducts();
    
    // Convert selected products to OrderItem format
    const items: OrderItem[] = selectedProducts.map(product => {
      const unitPrice = product.price ?? 0;
      const quantity = product.quantity || 0;
      return {
        productId: product.id,
        productName: product.name,
        productDesc: product.nameMr,
        quantity,
        unitPrice,
        subtotal: unitPrice * quantity
      };
    });
    
    // Calculate total items
  const totalItems = selectedProducts.reduce((sum, product) => sum + (product.quantity || 0), 0);
  const itemsTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = 0;
  const tax = 0;
  const shipping = 0;
  const currency = 'INR';
  const grandTotal = itemsTotal - discount + tax + shipping;
    
    // Calculate days between start and end date
    const startDate = new Date(formValue.startDate);
    const endDate = new Date(formValue.endDate);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Format dates as YYYY-MM-DD strings
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Create complete order object using industry-style schema
    const order: Order = {
      customerName: formValue.customerName,
      phoneNumber: formValue.phoneNumber,
      location: formValue.location,
      startDate: startDateStr,
      endDate: endDateStr,
      deliveryDate: '',
      days: days,
      items,
      totalItems: totalItems,
      totals: {
        currency,
        itemsTotal,
        discount,
        tax,
        shipping,
        grandTotal
      },
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Submit directly to Firestore
    this.isSubmitting = true;
    try {
      const orderId = await this.firebaseService.createOrder(order);
      this.notificationService.showSuccess('Order submitted successfully!');

      // Clear any persisted draft
      sessionStorage.removeItem('currentOrder');

      // Reset form and quantities
      this.orderForm.reset();
      // Re-apply validators' initial state for date fields
      this.orderForm.markAsPristine();
      this.orderForm.markAsUntouched();
      this.products = this.products.map(p => ({ ...p, quantity: 0 }));
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error submitting order:', error);
      this.notificationService.showError('Failed to submit order. Please try again.');
    } finally {
      this.isSubmitting = false;
    }
  }
}
