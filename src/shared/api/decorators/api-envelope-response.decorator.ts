import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiResponseMetaDto } from '../dtos/api-error-response.dto';

export function ApiEnvelopeResponse(options: {
  status?: HttpStatus;
  description?: string;
  type: Type<unknown>;
  isArray?: boolean;
}): MethodDecorator {
  const status = options.status ?? HttpStatus.OK;
  const dataSchema = options.isArray
    ? {
        type: 'array',
        items: { $ref: getSchemaPath(options.type) },
      }
    : { $ref: getSchemaPath(options.type) };

  return applyDecorators(
    ApiExtraModels(options.type, ApiResponseMetaDto),
    ApiResponse({
      status,
      description: options.description,
      schema: {
        type: 'object',
        required: ['success', 'data', 'meta'],
        properties: {
          success: { type: 'boolean', example: true },
          data: dataSchema,
          meta: { $ref: getSchemaPath(ApiResponseMetaDto) },
        },
      },
    }),
  );
}
