import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Order } from '../../../orders/models/order.model';
import { OrderPage } from '../../../orders/models/order-page.model';
import { OrderService } from '../../../orders/sevices/order.service';

import { Product } from '../../../products/models/product.model';
import { ProductService } from '../../../products/sevices/product.service';

import { ButtonComponent } from '../../../../shared/components/button/button';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  private orderService = inject(OrderService);
  private productService = inject(ProductService);
  private router = inject(Router);

  recentOrders = signal<Order[]>([]);
  totalOrders = signal(0);
  totalRevenue = signal(0);

  products = signal<Product[]>([]);

  ngOnInit(): void {
    this.loadOrders();
    this.loadProducts();
  }

  private loadOrders(): void {
    this.orderService.getOrders(0, 5).subscribe({
      next: (response: OrderPage) => {
        this.recentOrders.set(response.content);
        this.totalOrders.set(response.totalElements);

      },
      error: (error) => {
        console.error('Failed to load dashboard orders', error);
      },
    });
  }

  private loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
      },
      error: (error) => {
        console.error('Failed to load dashboard products', error);
      },
    });
  }

  getProductName(productId: number): string {
    const product = this.products().find((product) => product.id === productId);

    return product?.name ?? 'Unknown Product';
  }

  viewAllOrders(): void {
    this.router.navigate(['/orders']);
  }
}
