import React from 'react';
import { BlogEditor, ConfigProvider } from '../src';
import examplePost from './content/posts/example-blog-01/post.json';
import { BlogPost } from '../src/types/index';

const styles = {
  appContainer: {
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  editorWrapper: {
    position: 'relative' as const,
    zIndex: 1,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  appTitle: {
    color: '#fff',
    margin: '20px',
    textAlign: 'center' as const,
  },
  categorySelector: {
    marginBottom: '20px',
  },
  categoryLabel: {
    color: '#fff',
    marginRight: '10px',
  },
  categorySelect: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    fontSize: '14px',
    minWidth: '200px',
  },
  categorySelectFocus: {
    outline: 'none',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  categoryOption: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
  }
};

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
      <div style={styles.appContainer}>
        <BlogEditor initialPost={examplePost as BlogPost} />
      </div>
    </ConfigProvider>
  );
};

export default App; 