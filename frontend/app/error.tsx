'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import { AlertTriangle, RefreshCw, Home, Wifi, WifiOff } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isOnline, setIsOnline] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    toast.error('Something went wrong. Please try again.');
  }, [error]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    reset();
  };

  const isNetworkError = !isOnline || error.message?.includes('network') || error.message?.includes('fetch');

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center">
          {isNetworkError ? (
            <WifiOff className="h-16 w-16 text-destructive" />
          ) : (
            <AlertTriangle className="h-16 w-16 text-destructive" />
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tight">
            {isNetworkError ? 'Connection Lost' : 'We Hit a Snag'}
          </h2>
          <p className="text-muted-foreground">
            {isNetworkError
              ? 'Server temporarily unavailable. Please check your connection and try again.'
              : 'We could not finish this action right now. Please retry or return to shopping.'
            }
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleRetry}
            className="w-full"
            disabled={retryCount >= 3}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {retryCount >= 3 ? 'Max retries reached' : 'Try Again'}
          </Button>

          <div className="flex gap-3">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Back Home
              </Button>
            </Link>
            <Link href="/products" className="flex-1">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        {isNetworkError && (
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              {isOnline ? 'You are online' : 'You are offline'}
            </div>
          </div>
        )}

        {process.env.NODE_ENV === 'development' && (
          <details className="text-left text-xs text-muted-foreground">
            <summary className="cursor-pointer">Error Details (Dev Only)</summary>
            <pre className="mt-2 whitespace-pre-wrap break-all">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
