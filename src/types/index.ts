export interface BlogSection {
  id: string;
  type: 'text' | 'image' | 'code' | 'quote';
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
    category: string;
    readTime: string;
    featured: boolean;
    status: 'draft' | 'published';
    date: string;
  };
  content: {
    sections: BlogSection[];
    featuredImage?: {
      url: string;
      alt: string;
      position?: {
        x: number;
        y: number;
      };
    };
    backgroundColor?: string;
  };
}

export interface BlogContextType {
  posts: BlogPost[];
  addPost: (post: Omit<BlogPost, 'id'>) => void;
  updatePost: (id: string, post: Partial<BlogPost>) => void;
  deletePost: (id: string) => void;
  getPost: (id: string) => BlogPost | undefined;
} 