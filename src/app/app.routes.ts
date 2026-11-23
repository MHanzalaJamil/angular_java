import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard/dashboard')
        .then(m => m.DashboardComponent)
  },
  {
    path: 'products',
    loadChildren: () =>
      import('./features/products/products.routes')
        .then(m => m.PRODUCTS_ROUTES)
  },
  {
    path: 'orders',
    loadChildren: () =>
      import('./features/orders/orders.routes')
        .then(m => m.ORDERS_ROUTES)
  },
  {
    path: 'payments',
    loadChildren: () =>
      import('./features/payments/payments.routes')
        .then(m => m.PAYMENTS_ROUTES)
  }
];
