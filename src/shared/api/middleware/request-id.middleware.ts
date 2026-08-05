import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { RequestWithId } from '../types/request-with-id';

const REQUEST_ID_HEADER = 'x-request-id';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestWithId, res: Response, next: NextFunction): void {
    const incomingRequestId = req.header(REQUEST_ID_HEADER);
    const requestId = incomingRequestId?.trim() || randomUUID();

    req.requestId = requestId;
    res.setHeader(REQUEST_ID_HEADER, requestId);
    next();
  }
}
