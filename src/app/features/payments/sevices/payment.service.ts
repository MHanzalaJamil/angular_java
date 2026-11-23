import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Payment } from '../models/payment.model';
import { PaymentPage } from '../models/payment-page.model';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {

  private http = inject(HttpClient);

  private readonly apiUrl = '/api/payments';

  getPayments(page: number, size: number): Observable<PaymentPage> {
    return this.http.get<PaymentPage>(
      `${this.apiUrl}?page=${page}&size=${size}`
    );
  }
}
