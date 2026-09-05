/**
 * Standard Action Response type for Server Actions
 * Adheres to DRY principle across the entire backend actions layer.
 */
export interface ActionResponse<T = void> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
