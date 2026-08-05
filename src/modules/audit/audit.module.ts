import { Module } from '@nestjs/common';
import { RecordUserCreatedAuditHandler } from './application/event-handlers/record-user-created-audit.handler';

@Module({
  providers: [RecordUserCreatedAuditHandler],
})
export class AuditModule {}
