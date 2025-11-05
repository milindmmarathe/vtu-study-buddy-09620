import { PostgrestError } from '@supabase/supabase-js';

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  timeout?: number;
}

const defaultOptions: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  timeout: 30000,
};

/**
 * Exponential backoff delay calculator
 */
function getDelay(attempt: number, initialDelay: number, maxDelay: number): number {
  const delay = initialDelay * Math.pow(2, attempt);
  return Math.min(delay, maxDelay);
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;
  
  // Network errors
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return true;
  }
  
  // Timeout errors
  if (error.message?.includes('timeout') || error.code === 'PGRST301') {
    return true;
  }
  
  // Rate limit errors
  if (error.code === 'PGRST429' || error.status === 429) {
    return true;
  }
  
  // Server errors (5xx)
  if (error.status >= 500 && error.status < 600) {
    return true;
  }
  
  return false;
}

/**
 * Execute a Supabase query with automatic retry logic and timeout
 */
export async function withRetry<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  options: RetryOptions = {}
): Promise<{ data: T | null; error: PostgrestError | null }> {
  const opts = { ...defaultOptions, ...options };
  let lastError: PostgrestError | null = null;
  
  for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), opts.timeout);
      });
      
      // Race between query and timeout
      const result = await Promise.race([
        queryFn(),
        timeoutPromise
      ]);
      
      // If successful, return immediately
      if (!result.error) {
        if (attempt > 0) {
          console.log(`Query succeeded after ${attempt + 1} attempts`);
        }
        return result;
      }
      
      lastError = result.error;
      
      // Check if error is retryable
      if (!isRetryableError(result.error)) {
        console.error('Non-retryable error:', result.error);
        return result;
      }
      
      // Calculate delay before retry
      if (attempt < opts.maxRetries - 1) {
        const delay = getDelay(attempt, opts.initialDelay, opts.maxDelay);
        console.warn(`Query failed (attempt ${attempt + 1}/${opts.maxRetries}), retrying in ${delay}ms...`, result.error);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
    } catch (error: any) {
      console.error(`Query error on attempt ${attempt + 1}:`, error);
      lastError = {
        message: error.message || 'Unknown error',
        details: error.toString(),
        hint: '',
        code: error.code || 'UNKNOWN',
      } as PostgrestError;
      
      if (!isRetryableError(error) || attempt === opts.maxRetries - 1) {
        break;
      }
      
      const delay = getDelay(attempt, opts.initialDelay, opts.maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // All retries failed
  console.error(`Query failed after ${opts.maxRetries} attempts:`, lastError);
  return {
    data: null,
    error: lastError || {
      message: 'All retry attempts failed',
      details: 'The operation could not be completed after multiple attempts',
      hint: 'Please check your internet connection and try again',
      code: 'RETRY_FAILED',
    } as PostgrestError,
  };
}

/**
 * Helper to create user-friendly error messages
 */
export function getUserFriendlyError(error: PostgrestError | Error | null | unknown): string {
  if (!error) return 'An unknown error occurred';
  
  const message = error && typeof error === 'object' && 'message' in error 
    ? (error as Error).message 
    : String(error);
  
  // Network errors
  if (message.includes('fetch') || message.includes('network')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  // Timeout errors
  if (message.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  
  // Auth errors
  if (message.includes('JWT') || message.includes('auth') || message.includes('401')) {
    return 'Session expired. Please log in again.';
  }
  
  // Permission errors
  if (message.includes('permission') || message.includes('403')) {
    return 'You do not have permission to perform this action.';
  }
  
  // Rate limit
  if (message.includes('rate limit') || message.includes('429')) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  
  // Database errors
  if (message.includes('relation') || message.includes('column')) {
    return 'Database error. Please contact support.';
  }
  
  // Default
  return message.length > 100 ? 'An error occurred. Please try again.' : message;
}
