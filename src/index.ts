import { BlogEditor } from './BlogEditor';
import { BlogContext, useBlog, BlogProvider } from './context/BlogContext';
import { ConfigProvider, useConfig, ConfigContextType, BlogEditorConfig } from './context/ConfigContext';
import { BlogPost, BlogSection } from './types';
import { icons } from './assets';
import './styles/index.css';

// Export types
export type { BlogPost, BlogSection, ConfigContextType, BlogEditorConfig };

// Export main components and hooks
export { 
  BlogEditor, 
  BlogContext, 
  useBlog, 
  BlogProvider, 
  ConfigProvider,
  useConfig,
  icons 
};

// Export individual components
export { Section } from './components/Section';
export { EditorSidebar } from './components/EditorSidebar';
export { default as NavigationBar } from './components/NavigationBar';
export { default as HeroImage } from './components/HeroImage';
export { EditorToolbar } from './components/EditorToolbar';
export { default as CodeBlockTemplate } from './components/CodeBlockTemplate';
export { default as RichTextEditor } from './components/RichTextEditor';

// Export hooks
export { useEditor } from './hooks/useEditor';

// Re-export everything that external projects might need
export * from './utils/storage'; 