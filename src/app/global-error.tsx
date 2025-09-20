'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

function isDatabaseUnavailable(error: Error) {
  const message = error.message || '';
  return (
    message.includes('ECONNREFUSED') ||
    message.includes('PrismaClientInitializationError') ||
    message.includes('Database') ||
    message.includes('connect ECONNREFUSED') ||
    message.includes('could not connect to server')
  );
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Optionally log error to an error reporting service
    // console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
          <h1 className="text-2xl font-bold">
            {isDatabaseUnavailable(error) ? 'Database Unavailable' : 'Something went wrong'}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {isDatabaseUnavailable(error)
              ? "We couldn't connect to the database. Please check your connection or try again later."
              : error.message}
          </p>
          <Button variant="default" onClick={() => reset()}>
            Try Again
          </Button>
        </div>
      </body>
    </html>
  );
}
