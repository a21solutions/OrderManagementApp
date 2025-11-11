// Line-item for an order
export interface OrderItem {
  productId: string;
  productName: string;
  productDesc?: string; // localized name (Marathi)
  quantity: number; // integer > 0
  unitPrice: number; // price per unit in base currency
  subtotal: number; // quantity * unitPrice
}

// Totals with currency context
export interface OrderTotals {
  currency: string; // e.g., 'INR'
  itemsTotal: number; // sum of item subtotals
  discount: number; // total discount applied
  tax: number; // total tax amount
  shipping: number; // shipping charges
  grandTotal: number; // itemsTotal - discount + tax + shipping
}

export interface Order {
  // Customer details
  customerName: string;
  phoneNumber: string;
  location: string;

  // Booking/delivery dates (domain specific)
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  deliveryDate?: string; // optional delivery date
  days: number;

  // Items and totals
  items: OrderItem[];
  totalItems: number; // sum of item quantities
  totals: OrderTotals;

  // Status and timestamps
  status: 'pending' | 'confirmed' | 'paid' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

// Firestore document with id for listing/editing
export type OrderWithId = Order & { id: string };
