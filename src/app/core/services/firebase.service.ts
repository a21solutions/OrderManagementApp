import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, query, orderBy, Timestamp } from '@angular/fire/firestore';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { Order, OrderItem } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private productsCache$ = new BehaviorSubject<Product[] | null>(null);

  constructor(private firestore: Firestore) {}

  /**
   * Fetch all products from Firestore, ordered by sequence
   * Implements caching for performance
   */
  getProducts(): Observable<Product[]> {
    // Return cached data if available
    if (this.productsCache$.value) {
      return this.productsCache$.asObservable().pipe(
        map(products => products || [])
      );
    }

    const productsRef = collection(this.firestore, 'products');
    const q = query(productsRef, orderBy('sequence', 'asc'));
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(products => products as Product[]),
      tap(products => {
        // Cache the products
        this.productsCache$.next(products);
      })
    );
  }

  /**
   * Clear products cache (useful for refresh)
   */
  clearProductsCache(): void {
    this.productsCache$.next(null);
  }

  /**
   * Create a new order in Firestore with the new schema
   */
  async createOrder(order: Order): Promise<string> {
    try {
      const ordersRef = collection(this.firestore, 'orders');

      const nowTs = Timestamp.fromDate(new Date());

      const orderData = {
        customerName: order.customerName,
        phoneNumber: order.phoneNumber,
        location: order.location,
        startDate: order.startDate,
        endDate: order.endDate,
        deliveryDate: order.deliveryDate || '',
        days: order.days,
        items: order.items.map(i => ({
          productId: i.productId,
          productName: i.productName,
          productDesc: i.productDesc || '',
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          subtotal: i.subtotal
        })),
        totalItems: order.totalItems,
        totals: order.totals,
        status: order.status,
        createdAt: nowTs,
        updatedAt: nowTs
      };

      // Diagnostics: log payload shape and target project
      const appProjectId = (this.firestore as any)?._app?.options?.projectId;
      console.info('[Firestore] Writing order to project:', appProjectId, 'collection: orders');
      console.info('[Firestore] Order payload preview:', {
        customerName: orderData.customerName,
        totalItems: orderData.totalItems,
        itemsCount: orderData.items?.length ?? 0,
        grandTotal: orderData.totals?.grandTotal ?? 0,
        status: orderData.status
      });

      const docRef = await addDoc(ordersRef, orderData);
      console.info('[Firestore] Order created with id:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Calculate days between two dates
   */
  calculateDays(startDate: Date, endDate: Date): number {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}
