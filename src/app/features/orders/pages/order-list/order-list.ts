import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Order } from '../../models/order.model';
import { OrderService } from '../../sevices/order.service';
import { Product } from '../../../products/models/product.model';
import { ProductService } from '../../../products/sevices/product.service';

import { CreateOrderModalComponent } from '../../components/create-order/create-order-modal';
import { ButtonComponent } from '../../../../shared/components/button/button';

import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { FormsModule } from '@angular/forms';
import { OrderPage } from '../../models/order-page.model';

import { OrderWebSocketService } from '../../../../core/services/order-websocket.service';

import { ToastComponent } from '../../../../shared/components/toast/toast';

@Component({
  selector: 'app-order-list',
  imports: [
    CommonModule,
    CreateOrderModalComponent,
    ButtonComponent,
    PaginationComponent,
    FormsModule,
    ToastComponent,
  ],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css',
})
export class OrderListComponent implements OnInit {
  private orderService = inject(OrderService);
  private productService = inject(ProductService);
  private orderWebSocketService = inject(OrderWebSocketService);

  orders = signal<Order[]>([]);

  searchCustomerName = '';
  searchProductId: number | null = null;

  currentPage = signal(0);
  pageSize = signal(20);

  totalPages = signal(0);
  totalElements = signal(0);
  products = signal<Product[]>([]);

  showToast = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');

  ngOnInit(): void {
    this.loadOrders();
    this.loadProducts();
    this.orderWebSocketService
      .connect()
      .then(() => {
        console.log('Orders page WebSocket ready');
      })
      .catch((error) => {
        console.error('Failed to initialize WebSocket:', error);
      });
  }
  changePageSize(size: string): void {
    this.pageSize.set(Number(size));
    this.currentPage.set(0);
    this.loadOrders();
  }
  showCreateOrderModal = signal(false);

  openCreateOrder(): void {
    this.showCreateOrderModal.set(true);
  }

  closeCreateOrder(): void {
    this.showCreateOrderModal.set(false);
  }

  orderCreated(orderId: number): void {
    this.showCreateOrderModal.set(false);

    this.orderService.getOrder(orderId).subscribe({
      next: (order) => {
        this.orders.update((orders) => {
          const exists = orders.some((existingOrder) => existingOrder.id === order.id);

          if (exists) {
            return orders.map((existingOrder) =>
              existingOrder.id === order.id ? order : existingOrder,
            );
          }

          return [order, ...orders];
        });

        if (order.status === 'PENDING') {
          this.orderWebSocketService
            .connect()
            .then(() => {
              this.subscribeToOrderStatus(orderId);
            })
            .catch((error) => {
              console.error('Failed to connect WebSocket:', error);
            });
        }
      },

      error: (error) => {
        console.error('Failed to load created order', error);

        this.subscribeToOrderStatus(orderId);
      },
    });
  }
  loadOrders(): void {
    this.orderService
      .getOrders(
        this.currentPage(),
        this.pageSize(),
        'id',
        'desc',
        this.searchCustomerName,
        this.searchProductId ?? undefined,
      )
      .subscribe({
        next: (response: OrderPage) => {
          this.orders.set(response.content);
          this.totalPages.set(response.totalPages);
          this.totalElements.set(response.totalElements);
        },
        error: (error) => {
          console.error('Failed to load orders', error);
        },
      });
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
      },
      error: (error) => {
        console.error('Failed to load products', error);
      },
    });
  }
  startOrder = computed(() => {
    if (this.totalElements() === 0) {
      return 0;
    }

    return this.currentPage() * this.pageSize() + 1;
  });

  endOrder = computed(() => {
    return Math.min((this.currentPage() + 1) * this.pageSize(), this.totalElements());
  });
  getProductName(productId: number): string {
    const product = this.products().find((product) => product.id === productId);

    return product?.name ?? 'Unknown product';
  }
  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadOrders();
  }
  searchOrders(): void {
    this.currentPage.set(0);
    this.loadOrders();
  }
  clearSearch(): void {
    this.searchCustomerName = '';
    this.searchProductId = null;

    this.currentPage.set(0);
    this.loadOrders();
  }
  private subscribeToOrderStatus(orderId: number): void {
    this.orderWebSocketService.connect();

    this.orderWebSocketService.subscribeToOrder(orderId).subscribe((notification) => {
      console.log('Order status update:', notification);

      this.orders.update((orders) =>
        orders.map((order) =>
          order.id === notification.orderId
            ? {
                ...order,
                status: notification.status,
              }
            : order,
        ),
      );
      if (notification.status === 'CONFIRMED') {
        this.showOrderToast(`Order #${notification.orderId} confirmed successfully!`, 'success');
      } else if (notification.status === 'CANCELLED') {
        this.showOrderToast(`Order #${notification.orderId}: ${notification.message}.`, 'error');
      }
    });
  }
  private showOrderToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);

    setTimeout(() => {
      this.showToast.set(false);
    }, 4000);
  }
}
