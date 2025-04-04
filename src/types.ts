export interface BlogSection {
  id: string;
  type: 'text' | 'code' | 'quote' | 'image';
  content: string;
  metadata?: {
    title?: string;
    language?: string;
    author?: string;
    image?: {
      url: string;
      alt: string;
      caption?: string;
    };
  };
}

export interface BlogPost {
  id: string;
  metadata: {
    title: string;
    author: string;
    date: string;
    category: string;
    readTime: string;
    featured: boolean;
    status: 'draft' | 'published';
  };
  content: {
    sections: BlogSection[];
    excerpt: BlogSection;
    featuredImage?: {
      url: string;
      alt: string;
      position?: { x: number; y: number };
    };
    backgroundColor?: string;
  };
}

// Alias BlogData to BlogPost for compatibility
export type BlogData = BlogPost; 