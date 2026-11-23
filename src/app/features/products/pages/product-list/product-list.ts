import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ProductService } from '../../sevices/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);

  products = signal<Product[]>([]);
  searchTerm = signal('');

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (res) => {
        this.products.set(res);
      },
      error: (error) => {
        console.error('Failed to load products', error);
      },
    });
  }
  filteredProducts = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();

    if (!search) {
      return this.products();
    }

    return this.products().filter(
      (product) =>
        product.name.toLowerCase().includes(search) ||
        product.categoryName.toLowerCase().includes(search),
    );
  });
}
