import { BlogPost } from '../types/interfaces';

export interface BlogPostSummary {
  id: string;
  title: string;
  date: string;
  status: 'draft' | 'published';
}

export interface StorageAdapter {
  save(post: BlogPost): Promise<void>;
  load(id: string): Promise<BlogPost | null>;
  delete(id: string): Promise<void>;
  list(): Promise<BlogPost[]>;
  uploadImage?(file: File): Promise<string>; // Optional: Returns image URL
  deleteImage?(url: string): Promise<void>; // Optional
}