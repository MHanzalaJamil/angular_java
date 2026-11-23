import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateOrderModalComponent } from './create-order-modal';

describe('CreateOrderModal', () => {
  let component: CreateOrderModalComponent;
  let fixture: ComponentFixture<CreateOrderModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOrderModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateOrderModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
