import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEvent } from './domain-event';

@Injectable()
export class EventBus {
  constructor(private readonly events: EventEmitter2) {}

  publish(event: DomainEvent): void {
    this.events.emit(event.name, event);
  }
}
