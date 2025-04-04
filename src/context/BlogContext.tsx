import { createContext, useContext, useState, ReactNode } from 'react';
import { BlogPost, BlogContextType } from '../types/index';

export const BlogContext = createContext<BlogContextType | undefined>(undefined);

// Blog management functions
export const addPost = (post: Omit<BlogPost, 'id'>) => {
  const newPost: BlogPost = {
    ...post,
    id: Date.now().toString(),
    metadata: {
      ...post.metadata,
      date: new Date().toISOString().split('T')[0]
    }
  };
  return newPost;
};

export const updatePost = (currentPost: BlogPost, updatedFields: Partial<BlogPost>): BlogPost => {
  return { ...currentPost, ...updatedFields };
};

export const deletePost = (posts: BlogPost[], id: string): BlogPost[] => {
  return posts.filter(post => post.id !== id);
};

export const getPost = (posts: BlogPost[], id: string): BlogPost | undefined => {
  return posts.find(post => post.id === id);
};

export function BlogProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  const contextValue: BlogContextType = {
    posts,
    addPost: (post) => setPosts(prev => [...prev, addPost(post)]),
    updatePost: (id, updatedFields) => 
      setPosts(prev => prev.map(post => 
        post.id === id ? updatePost(post, updatedFields) : post
      )),
    deletePost: (id) => setPosts(prev => deletePost(prev, id)),
    getPost: (id) => getPost(posts, id)
  };

  return (
    <BlogContext.Provider value={contextValue}>
      {children}
    </BlogContext.Provider>
  );
}

export function useBlog() {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
} 