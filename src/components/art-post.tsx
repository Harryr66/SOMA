"use client";

import { Heart, MessageCircle, Bookmark, MoreHorizontal } from 'lucide-react';

// This is a 'type' definition. It tells our component what kind of data to expect.
// Think of it as a blueprint for an 'artwork'.
type Artwork = {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatarUrl: string;
  imageUrl: string;
  title: string;
  caption: string;
  likeCount: number;
  commentCount: number;
};

// This is our component. It's a function that takes an 'artwork' object as input
// and returns the HTML to display it.
export function ArtPost({ artwork }: { artwork: Artwork }) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden my-6">
      {/* Post Header */}
      <div className="p-4 flex items-center">
        <img src={artwork.authorAvatarUrl || 'https://placehold.co/40x40/2D3748/FFFFFF?text=A'} alt={artwork.authorName} className="w-10 h-10 rounded-full mr-4" />
        <div>
          <p className="font-bold text-white">{artwork.authorName}</p>
          <p className="text-sm text-gray-400">@{artwork.authorHandle}</p>
        </div>
        <button className="ml-auto text-gray-400 hover:text-white">
          <MoreHorizontal size={24} />
        </button>
      </div>

      {/* Artwork Image */}
      <div className="bg-black">
         <img src={artwork.imageUrl || 'https://placehold.co/600x400/000000/FFFFFF?text=Artwork'} alt={artwork.title} className="w-full h-auto max-h-[70vh] object-contain" />
      </div>
     

      {/* Action Buttons */}
      <div className="p-4 flex items-center space-x-4">
        <button className="flex items-center space-x-2 text-gray-400 hover:text-white">
          <Heart size={24} />
          <span>{artwork.likeCount}</span>
        </button>
        <button className="flex items-center space-x-2 text-gray-400 hover:text-white">
          <MessageCircle size={24} />
          <span>{artwork.commentCount}</span>
        </button>
        <button className="ml-auto text-gray-400 hover:text-white">
          <Bookmark size={24} />
        </button>
      </div>

      {/* Caption */}
      <div className="px-4 pb-4">
        <p className="text-white">
          <span className="font-bold mr-2">{artwork.authorHandle}</span>
          {artwork.caption}
        </p>
      </div>
    </div>
  );
}
