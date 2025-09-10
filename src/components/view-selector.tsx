'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid3X3, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewSelectorProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  className?: string;
}

export function ViewSelector({ view, onViewChange, className }: ViewSelectorProps) {
  return (
    <div className={cn('flex items-center bg-muted rounded-lg p-1', className)}>
      <Button
        variant={view === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('grid')}
        className={cn(
          'h-8 w-8 p-0 rounded-md transition-all',
          view === 'grid' 
            ? 'bg-background text-foreground shadow-sm border' 
            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
        )}
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
        className={cn(
          'h-8 w-8 p-0 rounded-md transition-all',
          view === 'list' 
            ? 'bg-background text-foreground shadow-sm border' 
            : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
        )}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
