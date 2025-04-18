'use client';

import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function ResetCounters() {
  const [isResetting, setIsResetting] = useState(false);
  const utils = trpc.useContext();

  const resetMutation = trpc.questions.resetCounters.useMutation({
    onSuccess: () => {
      // Refetch questions data after reset
      utils.questions.getAll.invalidate();
      setIsResetting(false);
    },
    onError: (err) => {
      console.error('Error resetting counters:', err);
      setIsResetting(false);
    },
  });

  const handleReset = async () => {
    setIsResetting(true);
    resetMutation.mutate();
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleReset} disabled={isResetting}>
      {isResetting ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Resetten...
        </>
      ) : (
        'Tellingen Resetten'
      )}
    </Button>
  );
}
