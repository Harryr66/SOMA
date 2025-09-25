'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star, Heart, ShoppingCart, Filter, ChevronRight, ChevronLeft } from 'lucide-react';
import { ProductCard } from '@/components/shop/product-card';

// Mock data for marketplace
const mockProducts = [
  {
    id: '1',
    title: 'Professional Oil Paint Set - 24 Colors',
    price: 89.99,
    originalPrice: 120.00,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=300&fit=crop',
    rating: 4.8,
    reviewCount: 1250,
    category: 'Painting Supplies',
    subcategory: 'Oil Paints',
    isWishlisted: false,
    isOnSale: true,
    tags: ['oil', 'paint', 'professional', 'artist'],
    description: 'High-quality oil paint set perfect for professional artists',
    seller: {
      name: 'ArtSupply Pro',
      rating: 4.9,
      isVerified: true
    }
  },
  {
    id: '2',
    title: 'Canvas Stretcher Bars - Set of 4',
    price: 45.50,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=300&fit=crop',
    rating: 4.6,
    reviewCount: 890,
    category: 'Canvas & Surfaces',
    subcategory: 'Stretcher Bars',
    isWishlisted: true,
    isOnSale: false,
    tags: ['canvas', 'stretcher', 'wood', 'professional'],
    description: 'Premium pine stretcher bars for custom canvas sizes',
    seller: {
      name: 'Canvas Masters',
      rating: 4.7,
      isVerified: true
    }
  },
  {
    id: '3',
    title: 'Watercolor Paper Pad - 140lb Cold Press',
    price: 24.99,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=300&fit=crop',
    rating: 4.9,
    reviewCount: 2100,
    category: 'Paper & Surfaces',
    subcategory: 'Watercolor Paper',
    isWishlisted: false,
    isOnSale: false,
    tags: ['watercolor', 'paper', 'cold press', 'professional'],
    description: 'Professional grade watercolor paper for serious artists',
    seller: {
      name: 'Paper Art Co',
      rating: 4.8,
      isVerified: true
    }
  },
  {
    id: '4',
    title: 'Art Print - Van Gogh Starry Night',
    price: 29.99,
    originalPrice: 39.99,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=300&fit=crop',
    rating: 4.7,
    reviewCount: 1560,
    category: 'Art Prints',
    subcategory: 'Fine Art Prints',
    isWishlisted: false,
    isOnSale: true,
    tags: ['print', 'van gogh', 'fine art', 'museum quality'],
    description: 'High-quality museum reproduction print on premium paper',
    seller: {
      name: 'Art Prints Co',
      rating: 4.6,
      isVerified: true
    }
  },
  {
    id: '5',
    title: 'Ceramic Glaze Set - 12 Colors',
    price: 67.50,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=300&fit=crop',
    rating: 4.5,
    reviewCount: 720,
    category: 'Ceramics & Pottery',
    subcategory: 'Glazes',
    isWishlisted: true,
    isOnSale: false,
    tags: ['ceramic', 'glaze', 'pottery', 'colors'],
    description: 'Food-safe ceramic glazes in vibrant colors',
    seller: {
      name: 'Pottery Supplies',
      rating: 4.4,
      isVerified: false
    }
  },
  {
    id: '6',
    title: 'Professional Brush Set - 20 Brushes',
    price: 89.99,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=300&fit=crop',
    rating: 4.8,
    reviewCount: 980,
    category: 'Brushes & Tools',
    subcategory: 'Brush Sets',
    isWishlisted: false,
    isOnSale: false,
    tags: ['brushes', 'professional', 'set', 'synthetic'],
    description: 'Complete brush set for all painting techniques',
    seller: {
      name: 'Brush Masters',
      rating: 4.9,
      isVerified: true
    }
  },
  {
    id: '7',
    title: 'Wooden Artist Easel - Adjustable',
    price: 149.99,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=300&fit=crop',
    rating: 4.6,
    reviewCount: 450,
    category: 'Brushes & Tools',
    subcategory: 'Easels',
    isWishlisted: true,
    isOnSale: false,
    tags: ['easel', 'wooden', 'adjustable', 'studio'],
    description: 'Professional wooden easel with adjustable height and angle',
    seller: {
      name: 'Studio Equipment',
      rating: 4.7,
      isVerified: true
    }
  },
  {
    id: '8',
    title: 'Art History Book - Renaissance Masters',
    price: 34.99,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=300&fit=crop',
    rating: 4.9,
    reviewCount: 320,
    category: 'Art Books',
    subcategory: 'Art History',
    isWishlisted: false,
    isOnSale: false,
    tags: ['book', 'art history', 'renaissance', 'education'],
    description: 'Comprehensive guide to Renaissance art and masters',
    seller: {
      name: 'Art Education Books',
      rating: 4.8,
      isVerified: true
    }
  }
];

const categories = [
  {
    id: 'painting-supplies',
    name: 'Painting Supplies',
    subcategories: [
      { id: 'oil-paints', name: 'Oil Paints' },
      { id: 'acrylic-paints', name: 'Acrylic Paints' },
      { id: 'watercolors', name: 'Watercolors' },
      { id: 'gouache', name: 'Gouache' }
    ]
  },
  {
    id: 'canvas-surfaces',
    name: 'Canvas & Surfaces',
    subcategories: [
      { id: 'canvas', name: 'Canvas' },
      { id: 'stretcher-bars', name: 'Stretcher Bars' },
      { id: 'panels', name: 'Panels' },
      { id: 'boards', name: 'Boards' }
    ]
  },
  {
    id: 'paper-surfaces',
    name: 'Paper & Surfaces',
    subcategories: [
      { id: 'watercolor-paper', name: 'Watercolor Paper' },
      { id: 'drawing-paper', name: 'Drawing Paper' },
      { id: 'sketch-pads', name: 'Sketch Pads' },
      { id: 'mixed-media', name: 'Mixed Media' }
    ]
  },
  {
    id: 'art-prints',
    name: 'Art Prints',
    subcategories: [
      { id: 'fine-art-prints', name: 'Fine Art Prints' },
      { id: 'posters', name: 'Posters' },
      { id: 'canvas-prints', name: 'Canvas Prints' },
      { id: 'framed-prints', name: 'Framed Prints' }
    ]
  },
  {
    id: 'ceramics-pottery',
    name: 'Ceramics & Pottery',
    subcategories: [
      { id: 'clay', name: 'Clay' },
      { id: 'glazes', name: 'Glazes' },
      { id: 'tools', name: 'Tools' },
      { id: 'kilns', name: 'Kilns' }
    ]
  },
  {
    id: 'brushes-tools',
    name: 'Brushes & Tools',
    subcategories: [
      { id: 'brush-sets', name: 'Brush Sets' },
      { id: 'individual-brushes', name: 'Individual Brushes' },
      { id: 'palette-knives', name: 'Palette Knives' },
      { id: 'easels', name: 'Easels' }
    ]
  },
  {
    id: 'art-books',
    name: 'Art Books',
    subcategories: [
      { id: 'art-history', name: 'Art History' },
      { id: 'technique-books', name: 'Technique Books' },
      { id: 'artist-biographies', name: 'Artist Biographies' },
      { id: 'art-theory', name: 'Art Theory' }
    ]
  }
];

const sortOptions = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' },
  { value: 'best-selling', label: 'Best Selling' }
];

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('painting-supplies');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const filteredProducts = useMemo(() => {
    let filtered = [...mockProducts];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory
      );
    }

    // Filter by subcategory
    if (selectedSubcategory !== 'all') {
      filtered = filtered.filter(product => 
        product.subcategory.toLowerCase().replace(/\s+/g, '-') === selectedSubcategory
      );
    }

    // Sort products
    filtered.sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
        case 'newest':
          return b.reviewCount - a.reviewCount; // Using review count as proxy for newness
        case 'best-selling':
          return b.reviewCount - a.reviewCount;
      default:
        return 0;
    }
  });

    return filtered;
  }, [searchQuery, selectedCategory, selectedSubcategory, sortBy]);

  const mostWishedFor = mockProducts.filter(p => p.isWishlisted).slice(0, 6);
  const fourStarsAndAbove = mockProducts.filter(p => p.rating >= 4.0).slice(0, 6);
  const onSale = mockProducts.filter(p => p.isOnSale).slice(0, 6);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
        {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-foreground">SOMA Marketplace</h1>
              <div className="text-sm text-muted-foreground">
                Deliver to <span className="font-medium text-foreground">United States</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <ShoppingCart className="h-5 w-5 text-foreground" />
                <span className="text-sm font-medium text-foreground">0</span>
          </div>
        </div>
        </div>

          {/* Search Bar */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
            <Input
                placeholder="Search SOMA Marketplace"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 rounded-r-none"
              />
              <Button className="absolute right-0 top-0 h-10 px-4 rounded-l-none">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4 text-sm overflow-x-auto">
            <Button variant="ghost" className="px-3 py-2 h-auto font-normal whitespace-nowrap">Best Sellers</Button>
            <Button variant="ghost" className="px-3 py-2 h-auto font-normal whitespace-nowrap">New Releases</Button>
            <Button variant="ghost" className="px-3 py-2 h-auto font-normal whitespace-nowrap">Art Supplies</Button>
            <Button variant="ghost" className="px-3 py-2 h-auto font-normal whitespace-nowrap">Art Books</Button>
            <Button variant="ghost" className="px-3 py-2 h-auto font-normal whitespace-nowrap">Art Prints</Button>
            <Button variant="ghost" className="px-3 py-2 h-auto font-normal whitespace-nowrap">Ceramics</Button>
            <Button variant="ghost" className="px-3 py-2 h-auto font-normal whitespace-nowrap">Easels</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-card rounded-lg border border-border p-4">
              <h3 className="font-semibold mb-4 text-card-foreground">Department</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id}>
                    <Button
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-start h-auto p-2 text-sm"
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setSelectedSubcategory('all');
                      }}
                    >
                      {category.name}
                    </Button>
                    {selectedCategory === category.id && category.subcategories.length > 0 && (
                      <div className="ml-4 mt-2 space-y-1">
                        {category.subcategories.map((subcategory) => (
                          <Button
                            key={subcategory.id}
                            variant={selectedSubcategory === subcategory.id ? "secondary" : "ghost"}
                            className="w-full justify-start h-auto p-2 text-xs"
                            onClick={() => setSelectedSubcategory(subcategory.id)}
                          >
                            {subcategory.name}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Page Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {selectedCategoryData?.name || categories[0]?.name || 'Art Supplies'}
              </h2>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  {filteredProducts.length} products found
                </p>
                <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
            </SelectTrigger>
            <SelectContent>
                      {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
        </div>
          </div>
        </div>

            {/* Featured Sections */}
            {selectedCategory === 'all' && (
              <div className="space-y-8 mb-8">
                {/* Most Wished For */}
                {mostWishedFor.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Most wished for</h3>
                      <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                        See more
                      </Button>
                    </div>
                    <div className="grid grid-cols-6 gap-4">
                      {mostWishedFor.map((product) => (
                        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                          <CardContent className="p-0">
                            <div className="relative">
                              <img
                                src={product.imageUrl}
                                alt={product.title}
                                className="w-full h-48 object-cover"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                className="absolute top-2 right-2 h-8 w-8 p-0"
                                onClick={() => toggleWishlist(product.id)}
                              >
                                <Heart className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                              </Button>
                            </div>
                            <div className="p-3">
                              <h4 className="font-medium text-sm line-clamp-2 mb-2">{product.title}</h4>
                              <div className="flex items-center gap-1 mb-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-muted-foreground">{product.rating}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-green-600">${product.price}</span>
                                {product.originalPrice && (
                                  <span className="text-xs text-muted-foreground line-through">${product.originalPrice}</span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{product.reviewCount} reviews</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4 Stars and Above */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">4 stars and above</h3>
                    <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                      See more
                    </Button>
          </div>
                  <div className="grid grid-cols-6 gap-4">
                    {fourStarsAndAbove.map((product) => (
                      <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardContent className="p-0">
                          <div className="relative">
                            <img
                              src={product.imageUrl}
                              alt={product.title}
                              className="w-full h-48 object-cover"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="absolute top-2 right-2 h-8 w-8 p-0"
                              onClick={() => toggleWishlist(product.id)}
                            >
                              <Heart className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                            </Button>
                          </div>
                          <div className="p-3">
                            <h4 className="font-medium text-sm line-clamp-2 mb-2">{product.title}</h4>
                            <div className="flex items-center gap-1 mb-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-muted-foreground">{product.rating}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-green-600">${product.price}</span>
                              {product.originalPrice && (
                                <span className="text-xs text-muted-foreground line-through">${product.originalPrice}</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{product.reviewCount} reviews</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
          </div>
        )}

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-64 object-cover"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 h-8 w-8 p-0"
                        onClick={() => toggleWishlist(product.id)}
                      >
                        <Heart className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                      {product.isOnSale && (
                        <Badge className="absolute top-2 left-2 bg-red-500">Sale</Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">{product.title}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-muted-foreground">{product.rating}</span>
                        <span className="text-sm text-muted-foreground">({product.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-lg text-green-600">${product.price}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-muted-foreground">by {product.seller.name}</span>
                        {product.seller.isVerified && (
                          <Badge variant="secondary" className="text-xs">Verified</Badge>
                        )}
                      </div>
                      <Button className="w-full">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
            </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}