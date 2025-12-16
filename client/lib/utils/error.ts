/**
 * Safely extracts error message from unknown error type
 * @param error - The error object (unknown type)
 * @param fallback - Fallback message if error message cannot be extracted
 * @returns Error message string
 */
export function getErrorMessage(error: unknown, fallback = 'Unknown error'): string {
  if (error instanceof Error) {
    return (error as Error).message || fallback;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message;
    return typeof message === 'string' ? message : fallback;
  }
  return fallback;
}
