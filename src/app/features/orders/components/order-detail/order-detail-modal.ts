import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Order } from '../../models/order.model';
import { OrderService } from '../../sevices/order.service';

import { Product } from '../../../products/models/product.model';
import { ProductService } from '../../../products/sevices/product.service';

@Component({
  selector: 'app-order-details-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-detail-modal.html',
  styleUrl: './order-detail-modal.css',
})
export class OrderDetailsModalComponent {

  private orderService = inject(OrderService);
  private productService = inject(ProductService);

  orderId = input<number | null>(null);

  closed = output<void>();

  order = signal<Order | null>(null);
  product = signal<Product | null>(null);

  loading = signal(false);

  ngOnInit(): void {
    const id = this.orderId();

    if (id !== null) {
      this.loadOrder(id);
    }
  }

  private loadOrder(orderId: number): void {
    this.loading.set(true);

    this.orderService.getOrder(orderId).subscribe({
      next: (order) => {
        this.order.set(order);

        this.loadProduct(order.productId);
      },
      error: (error) => {
        console.error('Failed to load order', error);
        this.loading.set(false);
      },
    });
  }

  private loadProduct(productId: number): void {
    this.productService.getProduct(productId).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load product', error);
        this.loading.set(false);
      },
    });
  }

  close(): void {
    this.closed.emit();
  }
}
