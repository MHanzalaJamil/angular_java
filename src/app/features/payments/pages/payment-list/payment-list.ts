import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Payment } from '../../models/payment.model';
import { PaymentPage } from '../../models/payment-page.model';
import { PaymentService } from '../../sevices/payment.service';

import { OrderDetailsModalComponent } from '../../../orders/components/order-detail/order-detail-modal';
import { ButtonComponent } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-payment-list',
  imports: [CommonModule, OrderDetailsModalComponent, ButtonComponent],
  templateUrl: './payment-list.html',
  styleUrl: './payment-list.css',
})
export class PaymentListComponent implements OnInit {
  private paymentService = inject(PaymentService);

  payments = signal<Payment[]>([]);

  currentPage = signal(0);
  pageSize = signal(20);

  totalPages = signal(0);
  totalElements = signal(0);

  selectedOrderId = signal<number | null>(null);
  showOrderModal = signal(false);

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.paymentService.getPayments(this.currentPage(), this.pageSize()).subscribe({
      next: (response: PaymentPage) => {
        this.payments.set(response.content);
        this.totalPages.set(response.totalPages);
        this.totalElements.set(response.totalElements);
      },
      error: (error) => {
        console.error('Failed to load payments', error);
      },
    });
  }

  openOrder(orderId: number): void {
    this.selectedOrderId.set(orderId);
    this.showOrderModal.set(true);
  }

  closeOrder(): void {
    this.showOrderModal.set(false);
    this.selectedOrderId.set(null);
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update((page) => page - 1);
      this.loadPayments();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update((page) => page + 1);
      this.loadPayments();
    }
  }

  changePageSize(size: string): void {
    this.pageSize.set(Number(size));
    this.currentPage.set(0);
    this.loadPayments();
  }
}
