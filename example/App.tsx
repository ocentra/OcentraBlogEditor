import React from 'react';
import { BlogEditor, ConfigProvider } from '../src';
import './App.css';

const App: React.FC = () => {
  const categories = [
    'Technology',
    'Travel',
    'Food',
    'Lifestyle',
    'Business'
  ];

  const initialPost = {
    id: crypto.randomUUID(),
    metadata: {
      title: '',
      author: '',
      category: '',
      readTime: '',
      featured: false,
      status: 'draft' as const,
      date: new Date().toISOString(),
    },
    content: {
      excerpt: {
        id: '1',
        type: 'text' as const,
        content: '',
      },
      sections: [],
    },
  };

  return (
    <ConfigProvider config={{ categories }}>
      <div className="app-container">
        <BlogEditor initialPost={initialPost} />
      </div>
    </ConfigProvider>
  );
};

export default App; 