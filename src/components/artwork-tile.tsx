'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Artwork } from '@/lib/types';
import Image from 'next/image';

interface ArtworkTileProps {
  artwork: Artwork;
  onClick?: () => void;
}

export function ArtworkTile({ artwork, onClick }: ArtworkTileProps) {
  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden" 
      onClick={onClick}
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={artwork.imageUrl}
          alt={artwork.imageAiHint}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Price badge */}
        {artwork.isForSale && artwork.price && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-600 hover:bg-green-700 text-xs">
              ${artwork.price.toLocaleString()}
            </Badge>
          </div>
        )}

        {/* AI badge */}
        {artwork.isAI && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs">
              AI {artwork.aiAssistance}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}
