import { Component, inject, OnInit, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Product } from '../../../products/models/product.model';
import { ProductService } from '../../../products/sevices/product.service';
import { OrderService } from '../../sevices/order.service';


@Component({
  selector: 'app-create-order-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './create-order-modal.html',
  styleUrl: './create-order-modal.css',
})
export class CreateOrderModalComponent implements OnInit {
  private productService = inject(ProductService);
  private orderService = inject(OrderService);


  closed = output<void>();
  created = output<number>();

  products = signal<Product[]>([]);

  customerName = signal('');
  selectedCategoryId = signal<number | null>(null);
  selectedProductId = signal<number | null>(null);
  quantity = signal(1);

  loadingProducts = signal(true);
  creatingOrder = signal(false);
  orderCreated = signal(false);
  errorMessage = signal('');

  categories = computed(() => {
    const categoryMap = new Map<number, string>();

    for (const product of this.products()) {
      categoryMap.set(product.categoryId, product.categoryName);
    }

    return Array.from(categoryMap.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  });

  filteredProducts = computed(() => {
    const categoryId = this.selectedCategoryId();

    if (categoryId === null) {
      return [];
    }

    return this.products().filter(
      (product) => product.categoryId === categoryId && product.stock > 0,
    );
  });

  selectedProduct = computed(() => {
    const productId = this.selectedProductId();

    if (productId === null) {
      return null;
    }

    return this.products().find((product) => product.id === productId) ?? null;
  });

  totalPrice = computed(() => {
    const product = this.selectedProduct();

    if (!product) {
      return 0;
    }

    return product.price * this.quantity();
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loadingProducts.set(true);

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loadingProducts.set(false);
      },
      error: (error) => {
        console.error('Failed to load products', error);
        this.errorMessage.set('Unable to load products.');
        this.loadingProducts.set(false);
      },
    });
  }

  selectCategory(value: string): void {
    const categoryId = Number(value);

    this.selectedCategoryId.set(Number.isNaN(categoryId) ? null : categoryId);

    this.selectedProductId.set(null);
    this.quantity.set(1);
  }

  selectProduct(value: string): void {
    const productId = Number(value);

    this.selectedProductId.set(Number.isNaN(productId) ? null : productId);

    this.quantity.set(1);
  }

  increaseQuantity(): void {
    const product = this.selectedProduct();

    if (!product) {
      return;
    }

    if (this.quantity() < product.stock) {
      this.quantity.update((value) => value + 1);
    }
  }

  decreaseQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update((value) => value - 1);
    }
  }

  canCreateOrder(): boolean {
    return (
      this.customerName().trim().length > 0 &&
      this.selectedProductId() !== null &&
      this.quantity() > 0
    );
  }

  createOrder(): void {
    if (!this.canCreateOrder() || this.creatingOrder()) {
      return;
    }

    const product = this.selectedProduct();

    if (!product) {
      return;
    }

    if (this.quantity() > product.stock) {
      this.errorMessage.set('Requested quantity exceeds available stock.');
      return;
    }

    this.errorMessage.set('');
    this.creatingOrder.set(true);

    this.orderService
      .createOrder({
        customerName: this.customerName().trim(),
        productId: product.id,
        quantity: this.quantity(),
      })
      .subscribe({
        next: (response) => {
          this.creatingOrder.set(false);

          console.log('Order created:', response);


          this.orderCreated.set(true);
          this.created.emit(response.id);
        },
        error: (error) => {
          console.error('Failed to create order', error);

          this.creatingOrder.set(false);

          this.errorMessage.set(
            error?.error?.message || 'Unable to create order. Please try again.',
          );
        },
      });
  }

  close(): void {
    if (this.creatingOrder()) {
      return;
    }

    this.closed.emit();
  }
}
