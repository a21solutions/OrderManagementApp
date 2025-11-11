import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, updateDoc, query, orderBy, Timestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrderWithId } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private firestore: Firestore) {}

  // Stream all orders ordered by startDate (ascending)
  getOrders(): Observable<OrderWithId[]> {
    const ordersRef = collection(this.firestore, 'orders');
    const q = query(ordersRef, orderBy('startDate', 'asc'));
    return collectionData(q, { idField: 'id' }).pipe(
      map(docs => docs as OrderWithId[])
    );
  }

  // Update order status and timestamp
  async updateOrderStatus(orderId: string, status: 'pending' | 'completed' | 'cancelled'): Promise<void> {
    const ref = doc(this.firestore, `orders/${orderId}`);
    await updateDoc(ref, {
      status,
      updatedAt: Timestamp.fromDate(new Date())
    } as any);
  }
}
