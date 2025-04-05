import { BlogPost, BlogSection } from './types/interfaces';
import { BlogEditor } from './BlogEditor';
import { BlogProvider, useBlog } from './context/BlogContext';
import { ConfigProvider, useConfig, ConfigContextType, BlogEditorConfig } from './context/ConfigContext';
import NavigationBar from './components/NavigationBar';
import HeroImage from './components/HeroImage';
import { EditorSidebar } from './components/EditorSidebar';
import { icons } from './assets';
import { Section } from './components/Section';
import { EditorToolbar } from './components/EditorToolbar';
import CodeBlockTemplate from './components/CodeBlockTemplate';
import RichTextEditor from './components/RichTextEditor';
import BlogPreview from './components/BlogPreview';
import EditorNavBar from './components/EditorNavBar';
import { useEditor } from './hooks/useEditor';
import './styles/base/index.css';
import './styles/components/EditorSidebar.module.css';
import './styles/components/EditorNavBar.module.css';
import './styles/components/CodeBlockTemplate.module.css';
import './styles/components/BlogPreview.module.css';
import './styles/components/NavigationBar.module.css';
import './styles/components/HeroImage.module.css';
import './styles/components/RichTextEditor.module.css';
import './styles/components/Section.module.css';
import './styles/components/Sections.module.css';
import './styles/editor/BlogEditor.module.css';
import './styles/components/EditorToolbar.module.css';

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