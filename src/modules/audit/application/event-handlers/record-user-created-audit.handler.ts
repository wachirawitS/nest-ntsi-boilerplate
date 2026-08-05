import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '../../../identity';

export class RecordUserCreatedAuditHandler {
  private readonly logger = new Logger(RecordUserCreatedAuditHandler.name);

  @OnEvent(UserCreatedEvent.eventName)
  handle(event: UserCreatedEvent): void {
    this.logger.log({
      event: event.name,
      occurredAt: event.occurredAt.toISOString(),
      userId: event.payload.userId,
    });
  }
}
