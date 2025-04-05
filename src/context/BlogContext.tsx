import { createContext, useContext, useState } from 'react';
import { BlogPost, BlogContextType } from '../types/interfaces';

export const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const BlogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  const value: BlogContextType = {
    posts,
    addPost: (post: Omit<BlogPost, 'id'>) => {
      const newPost: BlogPost = {
        ...post,
        id: crypto.randomUUID()
      };
      setPosts(prev => [...prev, newPost]);
    },
    updatePost: (id: string, updatedFields: Partial<BlogPost>) => {
      setPosts(prev => prev.map(post => 
        post.id === id ? { ...post, ...updatedFields } : post
      ));
    },
    deletePost: (id: string) => {
      setPosts(prev => prev.filter(post => post.id !== id));
    },
    getPost: (id: string) => posts.find(post => post.id === id)
  };

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
};

export function useBlog() {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
} 