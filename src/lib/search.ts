import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { User, Artwork, Community, Product } from './types';

export interface SearchResult<T> {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  relevance: number;
  data: T;
}

export class SearchService {
  static async searchUsers(searchTerm: string, limitCount: number = 20): Promise<SearchResult<User>[]> {
    const usersQuery = query(
      collection(db, 'users'),
      where('username', '>=', searchTerm),
      where('username', '<=', searchTerm + '\uf8ff'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(usersQuery);
    return snapshot.docs.map(doc => {
      const user = { id: doc.id, ...doc.data() } as User;
      return {
        id: user.id,
        title: user.displayName,
        description: user.bio || '',
        imageUrl: user.avatarUrl,
        relevance: this.calculateRelevance(searchTerm, user.displayName, user.bio || ''),
        data: user
      };
    });
  }

  static async searchArtworks(searchTerm: string, limitCount: number = 20): Promise<SearchResult<Artwork>[]> {
    const artworksQuery = query(
      collection(db, 'artworks'),
      where('title', '>=', searchTerm),
      where('title', '<=', searchTerm + '\uf8ff'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(artworksQuery);
    return snapshot.docs.map(doc => {
      const artwork = { id: doc.id, ...doc.data() } as Artwork;
      return {
        id: artwork.id,
        title: artwork.title,
        description: artwork.description || '',
        imageUrl: artwork.imageUrl,
        relevance: this.calculateRelevance(searchTerm, artwork.title, artwork.description || ''),
        data: artwork
      };
    });
  }

  static async searchCommunities(searchTerm: string, limitCount: number = 20): Promise<SearchResult<Community>[]> {
    const communitiesQuery = query(
      collection(db, 'communities'),
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff'),
      orderBy('memberCount', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(communitiesQuery);
    return snapshot.docs.map(doc => {
      const community = { id: doc.id, ...doc.data() } as Community;
      return {
        id: community.id,
        title: community.name,
        description: community.description,
        imageUrl: community.avatarUrl,
        relevance: this.calculateRelevance(searchTerm, community.name, community.description),
        data: community
      };
    });
  }

  static async searchProducts(searchTerm: string, limitCount: number = 20): Promise<SearchResult<Product>[]> {
    const productsQuery = query(
      collection(db, 'products'),
      where('title', '>=', searchTerm),
      where('title', '<=', searchTerm + '\uf8ff'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(productsQuery);
    return snapshot.docs.map(doc => {
      const product = { id: doc.id, ...doc.data() } as Product;
      return {
        id: product.id,
        title: product.title,
        description: product.description,
        imageUrl: product.images[0],
        relevance: this.calculateRelevance(searchTerm, product.title, product.description),
        data: product
      };
    });
  }

  static async searchAll(searchTerm: string, limitCount: number = 20): Promise<{
    users: SearchResult<User>[];
    artworks: SearchResult<Artwork>[];
    communities: SearchResult<Community>[];
    products: SearchResult<Product>[];
  }> {
    const [users, artworks, communities, products] = await Promise.all([
      this.searchUsers(searchTerm, limitCount),
      this.searchArtworks(searchTerm, limitCount),
      this.searchCommunities(searchTerm, limitCount),
      this.searchProducts(searchTerm, limitCount)
    ]);

    return { users, artworks, communities, products };
  }

  private static calculateRelevance(searchTerm: string, title: string, description: string): number {
    const searchLower = searchTerm.toLowerCase();
    const titleLower = title.toLowerCase();
    const descriptionLower = description.toLowerCase();

    let relevance = 0;

    // Exact title match gets highest score
    if (titleLower === searchLower) {
      relevance += 100;
    } else if (titleLower.startsWith(searchLower)) {
      relevance += 80;
    } else if (titleLower.includes(searchLower)) {
      relevance += 60;
    }

    // Description match gets lower score
    if (descriptionLower.includes(searchLower)) {
      relevance += 20;
    }

    // Word boundary matches get bonus
    const titleWords = titleLower.split(/\s+/);
    const searchWords = searchLower.split(/\s+/);
    
    for (const searchWord of searchWords) {
      for (const titleWord of titleWords) {
        if (titleWord.startsWith(searchWord)) {
          relevance += 10;
        } else if (titleWord.includes(searchWord)) {
          relevance += 5;
        }
      }
    }

    return Math.min(relevance, 100);
  }
}
