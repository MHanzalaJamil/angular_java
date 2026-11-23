import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';
import { OrderPage } from '../models/order-page.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);

  private readonly apiUrl = '/api/orders';

  getOrders(
    page: number,
    size: number,
    sortBy = 'id',
    direction = 'desc',
    customerName = '',
    productId?: number,
  ): Observable<OrderPage> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy)
      .set('direction', direction);

    if (customerName.trim()) {
      params = params.set('customerName', customerName.trim());
    }

    if (productId !== undefined) {
      params = params.set('productId', productId);
    }

    return this.http.get<OrderPage>(this.apiUrl, { params });
  }
  getOrder(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`);
  }
  createOrder(request: {
    customerName: string;
    productId: number;
    quantity: number;
  }): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, request);
  }
}
