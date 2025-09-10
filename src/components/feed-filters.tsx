"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronsUpDown, Filter, Camera } from 'lucide-react';

const filterGroups = {
  Mediums: ["Oil Painting", "Watercolor", "Acrylic", "Charcoal", "Pencil Drawing", "Pottery", "Ceramics", "Sculpture"],
  'Styles & Discovery': ["Abstract", "Realism", "Portrait", "Landscape", "Still Life", "New Artists", "Teachers"],
};

export function FeedFilters() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Your Following');

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full mb-6">
      <div className="flex justify-end items-center gap-2 mb-4">
        <Button variant="outline" size="sm" className="h-8">
            <Camera />
            Share
        </Button>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Filter />
            Filters
            <ChevronsUpDown className="ml-2" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-4 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
        <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={activeFilter === 'Your Following' ? 'secondary' : 'outline'} onClick={() => handleFilterClick('Your Following')}>
              Your Following
            </Button>
        </div>
        {Object.entries(filterGroups).map(([groupName, filters]) => (
            <div key={groupName}>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">{groupName}</h4>
                <div className="flex flex-wrap gap-2">
                    {filters.map(filter => (
                        <Button 
                            key={filter} 
                            size="sm" 
                            variant={activeFilter === filter ? 'secondary' : 'outline'}
                            onClick={() => handleFilterClick(filter)}
                        >
                            {filter}
                        </Button>
                    ))}
                </div>
            </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
