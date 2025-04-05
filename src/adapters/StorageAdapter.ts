import { BlogPost } from '../types/interfaces';

export interface BlogPostSummary {
  id: string;
  title: string;
  date: string;
  status: 'draft' | 'published';
}

export interface StorageAdapter {
  save(post: BlogPost): Promise<string>; // Returns post ID
  load(id: string): Promise<BlogPost | null>;
  list(): Promise<BlogPostSummary[]>;
  delete(id: string): Promise<void>;
  uploadImage?(file: File): Promise<string>; // Optional: Returns image URL
  deleteImage?(url: string): Promise<void>; // Optional
}