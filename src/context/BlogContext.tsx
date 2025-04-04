import { createContext, useContext, useState, ReactNode } from 'react';
import { BlogPost, BlogContextType } from '../types';

export const BlogContext = createContext<BlogContextType | undefined>(undefined);

// Initial blog posts data
const initialPosts: BlogPost[] = [
  {
    id: '1',
    metadata: {
      title: "The Power of Small Language Models for SMBs",
      author: "John Doe",
      category: "Small Language Models",
      readTime: "8 min read",
      featured: true,
      status: "published",
      date: "2024-03-25"
    },
    content: {
      excerpt: {
        id: 'excerpt-1',
        type: 'text',
        content: "Discover how smaller, more efficient models are making AI accessible to SMBs without the massive compute requirements of larger models."
      },
      sections: [
        {
          id: 'section-1',
          type: 'text',
          content: "<h1>The Power of Small Language Models for SMBs</h1><p>In today's AI landscape, smaller, more efficient models are revolutionizing how SMBs can leverage AI technology. These models offer comparable performance to their larger counterparts while requiring significantly less computational resources.</p><h2>Key Benefits</h2><ul><li>Lower computational requirements</li><li>Faster inference times</li><li>Reduced operational costs</li><li>Easier deployment and maintenance</li></ul>",
          metadata: {
            title: "Introduction"
          }
        }
      ],
      featuredImage: {
        url: "/assets/blog/small-llm.jpg",
        alt: "Small Language Models"
      }
    }
  },
  {
    id: '2',
    metadata: {
      title: "Edge Computing: The Future of AI Deployment",
      author: "Jane Smith",
      category: "Edge Computing",
      readTime: "6 min read",
      featured: true,
      status: "draft",
      date: "2024-03-20"
    },
    content: {
      excerpt: {
        id: 'excerpt-2',
        type: 'text',
        content: "Learn how edge deployment can dramatically reduce your operational costs while improving response times for your AI applications."
      },
      sections: [
        {
          id: 'section-1',
          type: 'text',
          content: "<h1>Edge Computing: The Future of AI Deployment</h1><p>Edge computing is transforming how we deploy and run AI models. By moving computation closer to the data source, organizations can achieve better performance and reduced costs.</p><h2>Advantages of Edge Deployment</h2><ul><li>Reduced latency</li><li>Lower bandwidth costs</li><li>Enhanced privacy</li><li>Improved reliability</li></ul>",
          metadata: {
            title: "Introduction"
          }
        }
      ],
      featuredImage: {
        url: "/assets/blog/edge-computing.jpg",
        alt: "Edge Computing"
      }
    }
  }
];

export function BlogProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);

  const addPost = (post: Omit<BlogPost, 'id'>) => {
    const newPost: BlogPost = {
      ...post,
      id: Date.now().toString(),
      metadata: {
        ...post.metadata,
        date: new Date().toISOString().split('T')[0]
      }
    };
    setPosts(prev => [...prev, newPost]);
  };

  const updatePost = (id: string, updatedFields: Partial<BlogPost>) => {
    setPosts(prev => prev.map(post => 
      post.id === id ? { ...post, ...updatedFields } : post
    ));
  };

  const deletePost = (id: string) => {
    setPosts(prev => prev.filter(post => post.id !== id));
  };

  const getPost = (id: string) => {
    return posts.find(post => post.id === id);
  };

  return (
    <BlogContext.Provider value={{ posts, addPost, updatePost, deletePost, getPost }}>
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