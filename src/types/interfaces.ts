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

export interface HeroImage {
  url: string;
  alt: string;
  position?: {
    x: number;
    y: number;
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
    featuredImage?: HeroImage;
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

export interface BlogEditorProps {
  initialPost?: BlogPost;
  onSave?: (post: BlogPost) => void;
  onPublish?: (post: BlogPost) => void;
  onDraft?: (post: BlogPost) => void;
  readOnly?: boolean;
} 