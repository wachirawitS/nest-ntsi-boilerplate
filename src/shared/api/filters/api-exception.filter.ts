import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApplicationError } from '../errors/application.error';
import { ErrorCode } from '../errors/error-codes';
import { getHttpStatusForErrorCode } from '../errors/error-status.map';
import { ApiErrorResponse } from '../types/api-response';
import { RequestWithId } from '../types/request-with-id';

const defaultCodeByStatus: Readonly<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: ErrorCode.BadRequest,
  [HttpStatus.UNAUTHORIZED]: ErrorCode.Unauthenticated,
  [HttpStatus.FORBIDDEN]: ErrorCode.Forbidden,
  [HttpStatus.NOT_FOUND]: ErrorCode.ResourceNotFound,
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<RequestWithId>();
    const errorBody = this.toErrorBody(exception);

    response.status(errorBody.status).json({
      success: false,
      error: {
        code: errorBody.code,
        message: errorBody.message,
        ...(errorBody.details === undefined
          ? {}
          : { details: errorBody.details }),
      },
      meta: {
        requestId: request.requestId ?? '',
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    } satisfies ApiErrorResponse);
  }

  private toErrorBody(exception: unknown): {
    status: HttpStatus;
    code: string;
    message: string;
    details?: unknown;
  } {
    if (exception instanceof ApplicationError) {
      return {
        status: getHttpStatusForErrorCode(exception.code),
        code: exception.code,
        message: exception.message,
        details: exception.details,
      };
    }

    if (exception instanceof HttpException) {
      return this.toHttpExceptionBody(exception);
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ErrorCode.InternalServerError,
      message: 'Internal server error',
    };
  }

  private toHttpExceptionBody(exception: HttpException): {
    status: HttpStatus;
    code: string;
    message: string;
    details?: unknown;
  } {
    const status = exception.getStatus();
    const response = exception.getResponse();

    if (
      typeof response === 'object' &&
      response !== null &&
      'code' in response
    ) {
      const body = response as {
        code: string;
        message?: string;
        details?: unknown;
      };

      return {
        status,
        code: body.code,
        message: body.message ?? exception.message,
        details: body.details,
      };
    }

    return {
      status,
      code: this.getDefaultCodeForStatus(status),
      message: exception.message,
    };
  }

  private getDefaultCodeForStatus(status: number): string {
    return defaultCodeByStatus[status] ?? ErrorCode.InternalServerError;
  }
}
