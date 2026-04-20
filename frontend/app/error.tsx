'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    toast.error('Something went wrong. Please try again.');
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <h2 className="text-3xl font-black uppercase">We hit a snag</h2>
        <p className="text-muted-foreground">
          We could not finish this action right now. Please retry or return to shopping.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" render={<Link href="/" />}>Back home</Button>
        </div>
      </div>
    </div>
  );
}
