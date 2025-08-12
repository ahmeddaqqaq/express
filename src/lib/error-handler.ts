// Utility to extract and display proper error messages from API responses
export function getErrorMessage(error: any): string {
  // Check for API error response with message in body
  if (error?.body?.message) {
    return error.body.message;
  }
  
  // Check for standard error message
  if (error?.message) {
    return error.message;
  }
  
  // Check for network errors
  if (error?.name === 'NetworkError' || !navigator.onLine) {
    return 'Connection failed. Please check your internet connection and try again.';
  }
  
  // Check for timeout errors
  if (error?.name === 'TimeoutError') {
    return 'Request timed out. Please try again.';
  }
  
  // Check for status code errors
  if (error?.status) {
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'You are not authorized. Please sign in again.';
      case 403:
        return 'Access denied. You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'A conflict occurred. The resource may already exist.';
      case 500:
        return 'A server error occurred. Please try again later.';
      default:
        return `An error occurred (${error.status}). Please try again.`;
    }
  }
  
  // Default error message
  return 'Something went wrong. Please try again.';
}

// Display error using toast notification
export function showError(error: any, customMessage?: string): void {
  const message = customMessage || getErrorMessage(error);
  
  // Use alert for now, can be replaced with toast library
  alert(message);
  
  // Log error for debugging
  console.error('Error occurred:', error);
}

// Display success message
export function showSuccess(message: string): void {
  // Can be replaced with toast library
  alert(message);
}