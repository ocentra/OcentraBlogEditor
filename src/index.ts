import { BlogPost, BlogSection } from './types/interfaces';
import { BlogEditor } from './BlogEditor';
import { BlogProvider, useBlog } from './context/BlogContext';
import { ConfigProvider, useConfig, ConfigContextType, BlogEditorConfig } from './context/ConfigContext';
import NavigationBar from './components/NavigationBar';
import HeroImage from './components/HeroImage';
import { EditorSidebar } from './components/EditorSidebar';
import { addPost, updatePost, deletePost, getPost } from './context/BlogContext';
import { icons } from './assets';
import { Section } from './components/Section';
import { EditorToolbar } from './components/EditorToolbar';
import CodeBlockTemplate from './components/CodeBlockTemplate';
import RichTextEditor from './components/RichTextEditor';
import BlogPreview from './components/BlogPreview';
import EditorNavBar from './components/EditorNavBar';
import { useEditor } from './hooks/useEditor';
import './styles/base/index.css';
import './styles/editor/BlogEditor.css';
import './styles/components/EditorToolbar.css';
import './styles/components/EditorSidebar.css';
import './styles/components/EditorNavBar.css';
import './styles/components/CodeBlockTemplate.css';
import './styles/components/BlogPreview.css';

// Export all components, hooks, and utilities
export { 
  // Main components
  BlogEditor,
  NavigationBar,
  HeroImage,
  EditorSidebar,
  Section,
  EditorToolbar,
  CodeBlockTemplate,
  RichTextEditor,
  BlogPreview,
  EditorNavBar,
  
  // Context providers and hooks
  BlogProvider,
  useBlog,
  ConfigProvider,
  useConfig,
  useEditor,
  
  // Blog management functions
  addPost,
  updatePost,
  deletePost,
  getPost,
  
  // Assets
  icons
};

// Export types
export type { 
  BlogPost, 
  BlogSection,
  ConfigContextType,
  BlogEditorConfig
};

// Export utilities
export * from './utils/storage';
export * from './utils/typeValidator';
export * from './utils/config'; 