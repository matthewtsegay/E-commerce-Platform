import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { api, getNetworkStatus } from '@/lib/api-client';
import { toast } from 'sonner';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    showToast?: boolean;
    retryCount?: number;
  } = {}
) {
  const { onSuccess, onError, showToast = true, retryCount = 3 } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    retry: () => {},
  });

  const execute = useCallback(async (attempt: number = 0) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiCall();
      setState({
        data: result,
        loading: false,
        error: null,
        retry: () => execute(),
      });
      onSuccess?.(result);
      return result;
    } catch (error) {
      const axiosError = error as AxiosError;
      let errorMessage = 'An unexpected error occurred';

      if (!getNetworkStatus()) {
        errorMessage = 'You are offline. Please check your connection.';
      } else if (axiosError.response) {
        // Server responded with error status
        const status = axiosError.response.status;
        if (status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (status === 404) {
          errorMessage = 'Resource not found.';
        } else if (status === 403) {
          errorMessage = 'Access denied.';
        } else if (status === 400) {
          errorMessage = 'Invalid request.';
        } else {
          errorMessage = (axiosError.response.data as any)?.message || 'Request failed';
        }
      } else if (axiosError.request) {
        // Network error
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = axiosError.message || 'Request failed';
      }

      // Retry logic for network errors
      if (attempt < retryCount && (
        !axiosError.response ||
        axiosError.response.status >= 500 ||
        errorMessage.includes('Network error')
      )) {
        setTimeout(() => execute(attempt + 1), 1000 * (attempt + 1));
        return;
      }

      setState({
        data: null,
        loading: false,
        error: errorMessage,
        retry: () => execute(),
      });

      onError?.(errorMessage);

      if (showToast) {
        toast.error(errorMessage);
      }

      throw error;
    }
  }, [apiCall, onSuccess, onError, showToast, retryCount]);

  const retry = useCallback(() => {
    execute();
  }, [execute]);

  return {
    ...state,
    execute,
    retry,
  };
}

// Hook for mutations (POST, PUT, DELETE)
export function useMutation<TData, TVariables>(
  apiCall: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData) => void;
    onError?: (error: string) => void;
    showToast?: boolean;
  } = {}
) {
  const { onSuccess, onError, showToast = true } = options;

  const [state, setState] = useState<{
    loading: boolean;
    error: string | null;
  }>({
    loading: false,
    error: null,
  });

  const mutate = useCallback(async (variables: TVariables) => {
    setState({ loading: true, error: null });

    try {
      const result = await apiCall(variables);
      setState({ loading: false, error: null });
      onSuccess?.(result);

      if (showToast) {
        toast.success('Operation completed successfully');
      }

      return result;
    } catch (error) {
      const axiosError = error as AxiosError;
      let errorMessage = 'Operation failed';

      if (!getNetworkStatus()) {
        errorMessage = 'You are offline. Please check your connection.';
      } else if (axiosError.response) {
        const status = axiosError.response.status;
        if (status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (status === 400) {
          errorMessage = 'Invalid data provided.';
        } else if (status === 403) {
          errorMessage = 'Access denied.';
        } else {
          errorMessage = (axiosError.response.data as any)?.message || 'Operation failed';
        }
      } else {
        errorMessage = axiosError.message || 'Operation failed';
      }

      setState({ loading: false, error: errorMessage });
      onError?.(errorMessage);

      if (showToast) {
        toast.error(errorMessage);
      }

      throw error;
    }
  }, [apiCall, onSuccess, onError, showToast]);

  return {
    ...state,
    mutate,
  };
}