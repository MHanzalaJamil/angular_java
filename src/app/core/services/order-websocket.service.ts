import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderWebSocketService {
  private client: Client;

  private connected = false;

  private connectionPromise?: Promise<void>;

  private resolveConnection?: () => void;

  constructor() {
    this.client = new Client({
      brokerURL: 'ws://localhost:8080/ws',

      reconnectDelay: 5000,

      onConnect: () => {
        console.log('WebSocket connected');

        this.connected = true;

        this.resolveConnection?.();
      },

      onDisconnect: () => {
        console.log('WebSocket disconnected');

        this.connected = false;

        this.connectionPromise = undefined;
        this.resolveConnection = undefined;
      },

      onWebSocketClose: (event) => {
        console.log('Raw Websocket Closed: ', event);
      },

      onWebSocketError: (event) => {
        console.error('Raw Websocket error: ', event);
      },

      onStompError: (frame) => {
        console.error('WebSocket STOMP error:', frame);
      },
    });
  }

  connect(): Promise<void> {
    if (this.connected) {
      return Promise.resolve();
    }

    if (!this.connectionPromise) {
      this.connectionPromise = new Promise<void>((resolve) => {
        this.resolveConnection = resolve;
      });

      if (!this.client.active) {
        this.client.activate();
      }
    }

    return this.connectionPromise;
  }

  subscribeToOrder(orderId: number): Observable<any> {
    return new Observable((observer) => {
      let subscription: StompSubscription | undefined;

      this.connect()
        .then(() => {
          console.log(
            'Subscribing:',
            `/topic/orders/${orderId}`,
            'client active:',
            this.client.active,
            'connected:',
            this.connected,
          );

          subscription = this.client.subscribe(`/topic/orders/${orderId}`, (message: IMessage) => {
            console.log('STOMP Message:', message.body);

            const data = JSON.parse(message.body);

            observer.next(data);
          });

          console.log('Subscription Created:', subscription.id);
        })
        .catch((error) => {
          console.error('Failed to connect WebSocket:', error);

          observer.error(error);
        });

      return () => {
        console.log('Unsubscribing Order: ', orderId);

        subscription?.unsubscribe();
      };
    });
  }

  disconnect(): void {
    this.connected = false;

    this.connectionPromise = undefined;
    this.resolveConnection = undefined;

    this.client.deactivate();
  }
}
