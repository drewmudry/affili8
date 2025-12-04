'use client'

import { Button } from '@/components/ui/button';
import { triggerHelloWorld } from '@/actions/trigger-hello';
import { useState } from 'react';

export function TriggerButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    try {
      const result = await triggerHelloWorld({});
      console.log('Task triggered:', result);
      alert(`Task triggered! Job ID: ${result.jobId}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to trigger task');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={isLoading}>
      {isLoading ? 'Triggering...' : 'Trigger Hello World Task'}
    </Button>
  );
}