import { ValidationError } from 'class-validator';

export interface ValidationDetail {
  field: string;
  messages: string[];
}

export function flattenValidationErrors(
  errors: ValidationError[],
): ValidationDetail[] {
  return errors.flatMap((error) => flattenValidationError(error));
}

function flattenValidationError(
  error: ValidationError,
  parentPath?: string,
): ValidationDetail[] {
  const field = parentPath ? `${parentPath}.${error.property}` : error.property;
  const messages = error.constraints ? Object.values(error.constraints) : [];
  const current = messages.length > 0 ? [{ field, messages }] : [];
  const children =
    error.children?.flatMap((child) => flattenValidationError(child, field)) ??
    [];

  return [...current, ...children];
}
