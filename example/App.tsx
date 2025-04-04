import React from 'react';
import { BlogEditor, ConfigProvider } from '../src';
import './App.css';
import examplePost from './content/posts/example-blog-01/post.json';

const App: React.FC = () => {
  const categories = [
    'Technology',
    'Travel',
    'Food',
    'Lifestyle',
    'Business'
  ];

  return (
    <ConfigProvider config={{ categories }}>
      <div className="app-container">
        <BlogEditor initialPost={examplePost} />
      </div>
    </ConfigProvider>
  );
};

export default App; 