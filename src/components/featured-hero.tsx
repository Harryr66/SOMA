'use client';

import React from 'react';
import { Play, Info, Plus, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Docuseries } from '@/lib/types';

interface FeaturedHeroProps {
  docuseries: Docuseries;
  isPlaying?: boolean;
  onPlay?: () => void;
  onAddToWatchlist?: () => void;
  onShowInfo?: () => void;
  onToggleMute?: () => void;
  isMuted?: boolean;
  className?: string;
}

export function FeaturedHero({
  docuseries,
  isPlaying = false,
  onPlay,
  onAddToWatchlist,
  onShowInfo,
  onToggleMute,
  isMuted = false,
  className = ''
}: FeaturedHeroProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  return (
    <div className={`relative h-[70vh] min-h-[500px] overflow-hidden bg-background ${className}`}>
      {/* Background Image/Video */}
      <div className="absolute inset-0">
        <img
          src={docuseries.bannerUrl}
          alt={docuseries.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            {/* Title and Badges */}
            <div className="mb-4">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                {docuseries.title}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <Badge variant="secondary" className="text-sm bg-red-600 text-white">
                  {docuseries.status === 'ongoing' ? 'ONGOING' : 'COMPLETED'}
                </Badge>
                <Badge variant="secondary" className="text-sm bg-black/50 text-white">
                  {docuseries.category}
                </Badge>
                <Badge variant="secondary" className="text-sm bg-black/50 text-white">
                  {docuseries.genre}
                </Badge>
                {docuseries.isNew && (
                  <Badge variant="secondary" className="text-sm bg-yellow-600 text-white">
                    NEW
                  </Badge>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-lg text-white/90 mb-6 leading-relaxed line-clamp-3">
              {docuseries.description}
            </p>

            {/* Meta Info */}
            <div className="flex items-center space-x-6 text-white/80 mb-8">
              <span className="text-sm">
                {new Date(docuseries.releaseDate).getFullYear()}
              </span>
              <span className="text-sm">
                {docuseries.totalEpisodes} episodes
              </span>
              <span className="text-sm">
                {formatDuration(docuseries.totalDuration)}
              </span>
              <span className="text-sm">
                {docuseries.rating.toFixed(1)} ⭐
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/90 px-8 py-3 text-lg font-semibold"
                onClick={onPlay}
              >
                <Play className="h-5 w-5 mr-2" />
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="border-white/50 text-white hover:bg-white/10 px-8 py-3 text-lg"
                onClick={onAddToWatchlist}
              >
                <Plus className="h-5 w-5 mr-2" />
                My List
              </Button>
              
              <Button
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10 px-8 py-3 text-lg"
                onClick={onShowInfo}
              >
                <Info className="h-5 w-5 mr-2" />
                More Info
              </Button>

              {onToggleMute && (
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-white hover:bg-white/10 px-4 py-3"
                  onClick={onToggleMute}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Artist Info */}
      <div className="absolute bottom-8 left-4 right-4">
        <div className="flex items-center space-x-4 text-white/80">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <img
              src={docuseries.featuredArtist.avatarUrl || 'https://placehold.co/48x48/2D3748/FFFFFF?text=A'}
              alt={docuseries.featuredArtist.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-medium">Featured Artist</p>
            <p className="text-lg font-semibold">{docuseries.featuredArtist.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
