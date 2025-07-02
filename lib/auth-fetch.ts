'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';

export function useAuthenticatedFetch() {
  const { logout, refreshSession } = useAuth();
  const router = useRouter();

  const authenticatedFetch = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Include cookies in requests
    });

    // Handle authentication errors
    if (response.status === 401) {
      // Try to refresh session first
      try {
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          // Retry the original request
          return fetch(url, {
            ...options,
            credentials: 'include',
          });
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }

      // If refresh fails, logout and redirect
      await logout();
      router.push('/');
      throw new Error('Authentication failed');
    }

    return response;
  };

  return authenticatedFetch;
}