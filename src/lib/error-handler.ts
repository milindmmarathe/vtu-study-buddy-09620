export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.userMessage;
  }
  
  if (error instanceof Error) {
    // Map common errors to user-friendly messages
    if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
      return 'Network error. Please check your connection.';
    }
    if (error.message.includes('JWT') || error.message.includes('expired')) {
      return 'Session expired. Please login again.';
    }
    if (error.message.includes('permission') || error.message.includes('not authorized')) {
      return 'You do not have permission to perform this action.';
    }
  }
  
  return 'An unexpected error occurred. Please try again.';
};
