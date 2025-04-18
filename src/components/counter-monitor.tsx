'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { useState } from 'react';

interface CounterData {
  [answerId: string]: number;
}

export function CounterMonitor() {
  const [counters, setCounters] = useState<CounterData>({});

  // Subscribe to counter updates
  trpc.subscriptions.counterUpdates.useSubscription(undefined, {
    onData: ({ answerId, count }) => {
      setCounters((prev) => ({
        ...prev,
        [answerId]: count,
      }));
    },
    onError: (err) => {
      console.error('Subscription error:', err);
    },
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Stem Tellingen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {Object.entries(counters).map(([answerId, count]) => (
            <div key={answerId} className="flex items-center justify-between">
              <div className="text-sm font-medium">{answerId}</div>
              <Badge variant="outline">{count}</Badge>
            </div>
          ))}
          {!Object.keys(counters).length && (
            <div className="text-sm text-muted-foreground">Nog geen stemmingen ontvangen</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
