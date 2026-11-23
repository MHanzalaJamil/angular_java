
import { Payment } from './payment.model';

export interface PaymentPage {
  content: Payment[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
