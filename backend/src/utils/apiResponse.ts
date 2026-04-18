export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  statusCode: number;
}

export function successResponse<T>(data: T, statusCode = 200): ApiResponse<T> {
  return { success: true, data, timestamp: new Date().toISOString(), statusCode };
}

export function errorResponse(error: string, statusCode = 400): ApiResponse {
  return { success: false, error, timestamp: new Date().toISOString(), statusCode };
}
