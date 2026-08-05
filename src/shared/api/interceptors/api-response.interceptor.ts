import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiSuccessResponse } from '../types/api-response';
import { RequestWithId } from '../types/request-with-id';

@Injectable()
export class ApiResponseInterceptor<TData> implements NestInterceptor<
  TData,
  ApiSuccessResponse<TData>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<TData>,
  ): Observable<ApiSuccessResponse<TData>> {
    const request = context.switchToHttp().getRequest<RequestWithId>();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        meta: {
          requestId: request.requestId ?? '',
        },
      })),
    );
  }
}
