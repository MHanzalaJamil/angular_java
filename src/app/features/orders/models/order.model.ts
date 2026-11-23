export interface Order {
  id: number;
  customerName: string;
  productId: number;
  quantity: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}
